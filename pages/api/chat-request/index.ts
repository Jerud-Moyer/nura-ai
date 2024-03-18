import { ChatRequestMessage } from "@/types";
import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'

const getResponse = async(messages: any) => {
  if(messages) {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: .2,
      messages: messages
    });
    console.log('chat response => ', res)
    return res
    // return await openai.createChatCompletion({
    //   model: 'gpt-3.5-turbo',
    //   temperature: .2,
    //   messages: messages
    // });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const messages = req.body
  console.log('prompt => ', messages)
  try {
    const response =  await getResponse(messages)
    console.log('response => ', response?.choices)
    res.send(response?.choices)
  } catch(error: any) {
    if(error.response) {
      res.send(error.response.data)
    } else {
      res.send(error)
    }
  }
}
