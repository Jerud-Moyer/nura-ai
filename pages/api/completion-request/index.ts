import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'
import { OpenAIStream } from "../../../utils/openAIStream";

export const config = {
  runtime: "edge",
};

// const getResponse = async(prompt: string) => {
//   const modelId = process.env.FINE_TUNED_MODEL as string
//   console.log('model => ', modelId)
//   return await openai.createCompletion({
//     model: modelId,
//     prompt,
//     temperature: .3,
//     max_tokens: 1200,
//     stream: true
//   });
// };

export default async function handler(
  req: Request,
  res: NextApiResponse
) {
  // const oldPrompt = req.query.prompt as string
  const { prompt } = (await req.json()) as {
    prompt: string
  }

  console.log('prompt => ', prompt)

  const payload = {
    // model: process.env.FINE_TUNED_MODEL as string,
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
    // const response =  await getResponse(prompt)
    // console.log('response => ', response.data.choices)
    // res.send(response.data)
    const stream = await OpenAIStream(payload)
    return new Response(stream)
  } catch(error: any) {
    if(error.response) {
      console.log('error here => ', error.response)
      res.send(error.response.data)
    } else {
      console.log('error => ', error)
      res.send(error)
    }
  }
}
