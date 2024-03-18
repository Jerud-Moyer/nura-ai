import openai from "@/openai-config/openai"
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser"
// import { CreateCompletionRequest } from "openai"

export async function OpenAIStream(payload: any) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let counter = 0

  // const res = await openai.createCompletion(payload)
  const res = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`
    },
    body: JSON.stringify(payload)
  })

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(e: ParsedEvent | ReconnectInterval) {
        if(e.type === 'event') {
          const data = e.data
          if(data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].text
            if(counter < 2 && (text.match(/\n/) || []).length) {
              return
            }
            const queue = encoder.encode(text)
            controller.enqueue(queue)
            counter ++ 
          } catch (err) {
            controller.error(err)
          }
        }
      }

      const parser = createParser(onParse)
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    }
  })
  return stream
}
