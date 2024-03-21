import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

const getImage = async(prompt: string) => {
  return await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    // n: 5,
    size: '1024x1024'
  })
}

export default async function handler(
  req: Request,
  res: NextApiResponse
) {
  const prompt = (await req.json()) as string
  console.log('prompt server side => ', prompt)
  try {
    const response = await getImage(prompt)
    console.log('image response => ', response)
    return NextResponse.json(response.data)
  } catch (error: any) {
    if(error.response) {
      console.log('ERROR response => ', error.response)
      return NextResponse.json(error.response.data)
    } else {
      console.log('ERROR => ', error)
      return NextResponse.json(error)
    }
  }
}
