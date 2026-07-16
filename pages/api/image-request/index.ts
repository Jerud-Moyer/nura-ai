import { NextApiRequest, NextApiResponse } from "next"
import openai from '../../../openai-config/openai'
import { NextRequest, NextResponse } from "next/server";

// export const config = {
//   runtime: "edge",
// };

const getImage = async(prompt: string) => {
  return await openai.images.generate({
    model: 'gpt-image-2',
    prompt,
    // n: 5,
    // moderation: 'low',
    size: '1024x1024'
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.body
  // const prompt = req.body
  console.log('prompt server side => ', prompt)
  try {
    const response = await getImage(prompt)
    console.log('image response => ', response)
    // return NextResponse.json(response.data)
    return res.status(200).json(response.data)
  } catch (error: any) {
    if(error.status) {
      console.log('ERROR response => ', error.response)
      // return NextResponse.json(error.response.data)
      return res.status(error.status).json({
        error: error.error
      })
    } 
    // else {
    //   console.log('ERROR => ', error)
    //   return NextResponse.json(error)
    // }
    return res.status(500).json({
      error: 'Internal Server Error'
    })
  }
}
