import json
import time
from datetime import datetime
import boto3
from typing import Dict, Any

# 初始化 AWS 客户端
bedrock = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')

VACCINE_TAGS = [
  "safety",
  "children safety",
  "pregnant safety",
  "elderly safety",
  "long-term safety",
  "vaccine testing",
  "approval safety",
  "necessity",
  "personal eligibility",
  "public health",
  "herd immunity",
  "efficacy",
  "infection prevention",
  "severe illness prevention",
  "variant protection",
  "waning immunity",
  "booster shots",
  "side effects",
  "mild side effects",
  "serious side effects",
  "allergic reactions",
  "autoimmune response",
  "rare side effects",
  "long-term effects",
  "general eligibility",
  "children eligibility",
  "pregnant eligibility",
  "elderly eligibility",
  "chronic illness",
  "special populations",
  "vaccine contraindications",
  "vaccine types",
  "mRNA vaccines",
  "adenovirus vaccines",
  "inactivated vaccines",
  "protein subunit vaccines",
  "viral vector vaccines",
  "nasal spray vaccines",
  "vaccination process",
  "doses",
  "dose interval",
  "vaccination schedule",
  "vaccination sites",
  "booster schedule",
  "missed doses",
  "availability",
  "distribution",
  "scheduling",
  "shortage",
  "priority groups",
  "regional availability",
  "regulation",
  "emergency use authorization",
  "full approval",
  "clinical trials",
  "manufacturing quality",
  "lot recalls",
  "production monitoring",
  "vaccine myths",
  "misinformation",
  "conspiracy theories",
  "anti-vaccine movements",
  "scientific evidence",
  "debunking myths",
  "data and studies",
  "clinical trials",
  "real-world studies",
  "comparative studies",
  "variant effectiveness",
  "study updates",
  "peer-reviewed research",
  "travel requirements",
  "workplace mandates",
  "vaccine passports",
  "international travel",
  "entry restrictions",
  "vaccine ethics",
  "mandatory vaccination",
  "vaccine equity",
  "anti-vaccine concerns",
  "informed consent",
  "immunity comparison",
  "co-administration",
  "pregnancy and breastfeeding",
  "timing post-infection",
  "global initiatives"
]


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    处理用户疫苗相关问题的 Lambda 处理函数
    
    Args:
        event: Lambda 事件对象，包含用户问题
        context: Lambda 上下文对象
    
    Returns:
        Dict 包含处理状态和匹配的标签
    """
    try:
        # 验证输入
        if 'question' not in event:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'message': 'Missing required field: question',
                })
            }

        # 准备 Claude 提示词
        prompt = f'''Given this question about vaccines: "{event['question']}"

If the question is about vaccines,Please analyze this question and return only the most relevant five tags from this list: {json.dumps(VACCINE_TAGS)}

Return the tags in a JSON array format. If no tags match or the question is not about vaccines, return ["other"].
Only return the JSON array, nothing else.'''

        # 调用 Bedrock Claude
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "temperature": 0,
                "messages": [{
                    "role": "user",
                    "content": prompt
                }]
            })
        )

        # 解析响应
        response_body = json.loads(response.get('body').read().decode('utf-8'))
        content = response_body.get('content', [{}])[0].get('text', '[]')
        
        try:
            tags = json.loads(content)
        except json.JSONDecodeError:
            print(f"Failed to parse content as JSON: {content}")
            tags = ["other"]

        # 准备 DynamoDB 记录
        table = dynamodb.Table('user-questions')
        question_id = f"q_{int(time.time() * 1000)}"
        item = {
            'PK': question_id,  # 添加主键
            'questionId': question_id,
            'question': event['question'],
            'tags': tags,
            'timestamp': datetime.utcnow().isoformat()
        }

        # 存储到 DynamoDB
        table.put_item(Item=item)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Question processed successfully',
                'tags': tags,
                'question': event['question']
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"Full error details: {repr(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing question',
                'error': str(e)
            })
        } 