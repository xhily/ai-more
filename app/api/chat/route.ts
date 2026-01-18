import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const models = {
  deepseek: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
  qwen: 'Qwen/Qwen2.5-7B-Instruct',
  glm: 'THUDM/glm-4-9b-chat',
  hunyuan: 'tencent/Hunyuan-MT-7B',
  internlm: 'internlm/internlm2_5-7b-chat',
};

export async function POST(request: NextRequest) {
  const { message, model } = await request.json();

  if (!message || !model || !models[model as keyof typeof models]) {
    return new Response('Invalid request', { status: 400 });
  }

  const apiKey = import.meta.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    return new Response('API key not configured', { status: 500 });
  }

  const client = new OpenAI({
    baseURL: 'https://api.siliconflow.cn/v1',
    apiKey: apiKey,
  });

  try {
    const stream = await client.chat.completions.create({
      model: models[model as keyof typeof models],
      messages: [{ role: 'user', content: message }],
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('[v0] Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[v0] API error:', error);
    return new Response('Error calling AI model', { status: 500 });
  }
}
