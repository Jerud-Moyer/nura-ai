import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'

const getResponse = async(messages: any) => {
  if(messages) {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: .2,
      messages: messages
    });
    
    return res
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const messages = req.body
  
  try {
    const response =  await getResponse(messages)
    res.send(response?.choices)
  } catch(error: any) {
    if(error.response) {
      res.send(error.response.data)
    } else {
      res.send(error)
    }
  }
}
