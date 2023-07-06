import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'

const getResponse = async(prompt: string) => {
  const modelId = process.env.FINE_TUNED_MODEL as string
  console.log('model => ', modelId)
  return await openai.createCompletion({
    model: modelId,
    prompt,
    temperature: .3,
    max_tokens: 1200
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt as string
  console.log('prompt => ', prompt)
  const response =  await getResponse(prompt)
  console.log('response => ', response.data.choices)
  res.send(response.data)
}
