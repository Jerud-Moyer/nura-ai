import { ChatRequestMessage } from "@/types";
import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'


const getResponse = async(messages: any) => {
  if(messages) {
    return await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: .2,
      messages: messages
    });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('hit the route')
  const messages = req.body
  console.log('prompt => ', messages)
  const response =  await getResponse(messages)
  console.log('response => ', response?.data.choices)
  res.send(response?.data)
}
