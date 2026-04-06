import openai from '../../../openai-config/openai'
import { NextApiResponse } from 'next'

export const config = {
  runtime: "edge",
};

const getSpeech = async(text: string) => {
  const styledText = `Please read the following text in the style of a calm, proper British lady:
  Articulate, polite, measured pacing, clear Received Pronunciation accent.
  ${text}`
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: styledText,
    speed: .7 
  })

  return mp3
}

export default async function handler(
  req: Request,
  res: NextApiResponse
) {
  try {
    const { text } = (await req.json()) as { text: string }
    
    const response = await getSpeech(text)

    return new Response(response.body, {
      headers: {
        "Content-Type": response.type
      }
    })

  } catch(err: any) {
    console.log('ERROR => ', err)
  }
}
