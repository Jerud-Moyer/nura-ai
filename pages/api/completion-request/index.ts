import { NextApiResponse } from "next"
import { OpenAIStream } from "../../../utils/openAIStream";
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(
  req: Request,
  res: NextApiResponse
) {
  const { prompt } = (await req.json()) as {
    prompt: string
  }


  const payload = {
    model: 'gpt-3.5-turbo-instruct',
    prompt,
    temperature: 1,
    max_tokens: 400,
    stream: true,
    frequency_penalty: 1,
    presence_penalty: 1
    // stop: ['__']
  }

  try{
    const stream = await OpenAIStream(payload)
    return new Response(stream)
  } catch(error: any) {
    if(error.response) {
      console.error('error => ', error.response)
      return NextResponse.json(error.response.data)
    } else {
      console.error('error => ', error)
      return NextResponse.json(error)
    }
  }
}
