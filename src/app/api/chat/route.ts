import { NextResponse } from 'next/server'

const API_URL = 'https://0z9q93nzo4.execute-api.ap-southeast-2.amazonaws.com/try/triggerLambda'
const ANALYZE_API_URL = 'https://i5elyiivui.execute-api.ap-southeast-2.amazonaws.com/try/questionTag'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_query: body.user_query
      })
    })

    const data = await response.json()
    
    // 异步发送问题分析请求
    try {
      await fetch(ANALYZE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: body.user_query
        })
      })
    } catch (analyzeError) {
      // 即使分析请求失败，也不影响主聊天流程
      console.error('Question analysis failed:', analyzeError)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    )
  }
} 