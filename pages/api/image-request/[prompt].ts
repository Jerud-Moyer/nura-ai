import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'

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
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt as string
  console.log('do we get the prompt => ', prompt)
  try {
    const response = await getImage(prompt)
    console.log('response => ', response.data)
    res.send(response.data)
  } catch (error: any) {
    if(error.response) {
      res.send(error.response.data)
    } else {
      res.send(error)
    }
  }
}
