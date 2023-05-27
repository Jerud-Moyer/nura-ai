import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'

const getImage = async(prompt: string) => {
  return await openai.createImage({
    prompt,
    n: 5,
    size: '1024x1024'
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt as string
  console.log('prompt => ', prompt)
  const response = await getImage(prompt)
  console.log('response => ', response.data)
  res.send(response.data)
}
