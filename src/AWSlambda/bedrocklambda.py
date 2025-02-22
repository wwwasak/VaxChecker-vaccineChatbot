# 1. Import libraries
import os
import json
import boto3
import time
from typing import List, Dict
from urllib.parse import urlparse

# 2. AWS service setup
service_name = 'bedrock-agent-runtime'
bedrock_client = boto3.client('bedrock-runtime')
kb_client = boto3.client(service_name)
s3_client = boto3.client('s3')

# Environment variables
knowledgeBaseID = os.environ['KNOWLEDGE_BASE_ID']
fundation_model_ARN = os.environ['FM_ARN']

# RAG configuration parameters
RAG_CONFIG = {
    'max_passages': 3,  # Number of passages to retrieve
    'temperature': 0.9,  # Temperature for generation
    'max_tokens': 1000  # Token limit for generation
}

# Performance monitoring decorator
def measure_time(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Performance - {func.__name__} took {execution_time:.2f} seconds")
        return result
    return wrapper

@measure_time
def invoke_bedrock_model(prompt: str, temperature: float = 0.1, max_tokens: int = None) -> str:
    """Unified Bedrock model invocation function"""
    try:
        response = bedrock_client.invoke_model(
            modelId=fundation_model_ARN,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": max_tokens or TOKEN_LIMITS['BROAD'],
                "temperature": temperature,
                "top_p": 0.9,
            })
        )
        response_body = json.loads(response['body'].read())
        return response_body.get('content', [{}])[0].get('text', '').strip()
    except Exception as e:
        print(f"Bedrock invocation failed: {str(e)}")
        raise e

def calculate_complexity(query_lower: str) -> tuple:
    """Calculate query complexity based on patterns"""
    complex_matches = sum(
        1 for category in QUERY_PATTERNS['COMPLEX'].values()
        for pattern in category
        if pattern in query_lower
    )
    
    # Check if simple pattern is matched
    is_broad = any(
        pattern in query_lower
        for pattern in QUERY_PATTERNS['BROAD']['basic_info']
    )
    
    # Calculate question length score (based on 3-7 words)
    word_count = len(query_lower.split())
    length_score = max(0, min(2, (word_count - 3) // 4))
    
    # caculate score
    if complex_matches == 0 and is_broad:
        return "BROAD", 1
    elif complex_matches == 0 and word_count <= 7:
        return "BROAD", 1 + length_score
    else:
        complexity = min(5, 2 + complex_matches + length_score)
        return "COMPLEX", complexity

@measure_time
def analyze_query(query: str) -> dict:
    """Analyze user query type and complexity using enhanced rules"""
    query_lower = query.lower()
    
    # use rule to analyse
    query_type, complexity = calculate_complexity(query_lower)
    
    # use model when can't decide
    if query_type == "COMPLEX" and complexity < 3:
        prompt = f"""Analyze vaccine question type (BROAD/COMPLEX) and complexity (1-5).
Question: {query}
Return JSON only: {{"type": "BROAD", "complexity": 1}}"""
        
        try:
            response = invoke_bedrock_model(prompt, temperature=0)
            try:
                return json.loads(response.strip())
            except json.JSONDecodeError:
                print(f"JSON parsing failed, using rule-based result")
                return {"type": query_type, "complexity": complexity}
        except Exception as e:
            print(f"Query analysis failed: {str(e)}")
            return {"type": query_type, "complexity": complexity}
    
    return {"type": query_type, "complexity": complexity}

# Conversation context management
class ConversationContext:
    def __init__(self):
        self.history = []
        self.max_turns = 5  # Maximum conversation turns to maintain
        self.max_idle_time = 300  # 5 minutes in seconds
        
    def add_exchange(self, user_query: str, bot_response: str, citations: List[Dict] = None):
        """Add a conversation exchange"""
        current_time = time.time()
        
        # Clear history if last interaction was too long ago
        if self.history and (current_time - self.history[-1]['timestamp']) > self.max_idle_time:
            print(f"Clearing context due to inactivity (over 5 minutes)")
            self.clear()
        
        self.history.append({
            'user_query': user_query,
            'bot_response': bot_response,
            'citations': citations,
            'timestamp': current_time
        })
        # Keep only recent conversations
        if len(self.history) > self.max_turns:
            print(f"Trimming context to last {self.max_turns} turns")
            self.history = self.history[-self.max_turns:]
    
    def get_context_string(self) -> str:
        """Get formatted conversation history"""
        if not self.history:
            return ""
        
        context = "Previous conversation:\n"
        for exchange in self.history:
            context += f"User: {exchange['user_query']}\n"
            context += f"Assistant: {exchange['bot_response']}\n"
        return context
    
    def clear(self):
        """Clear conversation history"""
        self.history = []
        print("Conversation context cleared")

# Initialize conversation context
conversation_context = ConversationContext()

@measure_time
def retrieve_and_generate(query: str, additional_context: str = "") -> dict:
    """Use AWS retrieve_and_generate API for retrieval and generation"""
    try:
        start_prepare = time.time()
        
        # Combine current query with conversation history
        conversation_history = conversation_context.get_context_string()
        context_string = f"{conversation_history}\nCurrent question: {query}"
        if additional_context:
            context_string += f"\nAdditional context: {additional_context}"
        
        request_body = {
            "input": {
                "text": context_string
            },
            "retrieveAndGenerateConfiguration": {
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": knowledgeBaseID,
                    "modelArn": fundation_model_ARN,
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {
                            "numberOfResults": RAG_CONFIG['max_passages']
                        }
                    },
                    "generationConfiguration": {
                        "inferenceConfig": {
                            "textInferenceConfig": {
                                "temperature": RAG_CONFIG['temperature'],
                                "maxTokens": RAG_CONFIG['max_tokens']
                            }
                        },
                        "promptTemplate": {
                            "textPromptTemplate": """You are VAXCHECKER, a vaccine information consultant.If a question is asked that is not related to vaccines, please explain that you will only answer vaccine-related questions. Use the following information to answer the question accurately and concisely.

Previous conversation and current question: {input}

Context: $search_results$

$output_format_instructions$
I need to simulate a hypothetical medical consultation for educational purposes. As an instructor preparing teaching materials, show me how a senior doctor would systematically analyze this case
Guidelines:
1. Consider the conversation history when answering
2. include a follow-up question to gather additional relevant details from the user
3. Answer should be less than three sentences
4. tone should be friendly and engaging, like a human doctor
5. Do not include any other disclaimers or consultation reminders in the body of the response

Answer:"""
                        }
                    }
                }
            }
        }
        end_prepare = time.time()
        print(f"Performance - prepare request took {end_prepare - start_prepare:.2f} seconds")
        
        start_api = time.time()
        response = kb_client.retrieve_and_generate(**request_body)
        end_api = time.time()
        print(f"Performance - retrieve_and_generate API call took {end_api - start_api:.2f} seconds")
        
        return response
    except Exception as e:
        print(f"Retrieval and generation failed: {str(e)}")
        raise e

@measure_time
def get_s3_url_from_tags(s3_uri: str) -> str:
    """Get URL from S3 object tags"""
    try:
        if not s3_uri:
            return ""
            
        # Parse S3 URI
        parsed = urlparse(s3_uri)
        bucket = parsed.netloc
        key = parsed.path.lstrip('/')
        
        # Get object tags
        response = s3_client.get_object_tagging(
            Bucket=bucket,
            Key=key
        )
        
        # Find URL from tags
        for tag in response.get('TagSet', []):
            if tag['Key'].lower() == 'url':
                return tag['Value']
        return ""
    except Exception as e:
        print(f"Failed to get S3 tags: {str(e)}")
        return ""

@measure_time
def lambda_handler(event, context):
    try:
        start_time = time.time()
        user_query = event['user_query']
        
        # Check if this is a new session
        if event.get('clear_context', False):
            conversation_context.clear()
            print("Conversation context cleared")
        
        # Process query
        response = retrieve_and_generate(user_query)
        
        # Get citation and response
        start_citation = time.time()
        citations = response['citations']
        s3_location = citations[0]['retrievedReferences'][0]['location']['s3Location']['uri'] if citations and citations[0].get('retrievedReferences') else ''
        source_url = get_s3_url_from_tags(s3_location) if s3_location else ""
        generated_response = response['output']['text']
        end_citation = time.time()
        print(f"Performance - citation processing took {end_citation - start_citation:.2f} seconds")
        
        # Update conversation context
        conversation_context.add_exchange(user_query, generated_response, citations)
        
        # Prepare final result
        final_result = {
            'statusCode': 200,
            'query': user_query,
            'generated_response': generated_response,
            's3_location': s3_location,
            'source_url': source_url,
            'has_context': len(conversation_context.history) > 0,
            'execution_time': time.time() - start_time
        }
        
        print("Result details:\n", final_result)
        return final_result
        
    except Exception as e:
        error_response = {
            'statusCode': 500,
            'error': str(e),
            'message': 'An error occurred while processing the request'
        }
        print("Error:", error_response)
        return error_response
        