import { ChatRequestMessage } from "@/types"

export const getTTS = async(text: string): Promise<ArrayBuffer> => {
  const res =  await fetch('/api/tts-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text  
    })
  })
  return await res.arrayBuffer()
}

export const getCompletion = async(prompt: string) => {
  const res =  await fetch(`/api/completion-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'applicaton/json'
      },
      body: JSON.stringify({
        prompt: prompt
      })
    })

  return res
}

export const getImage = async(prompt: string): Promise<any> => {
  const res = await fetch(`/api/image-request/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prompt)
  })

  return await res.json()
}

export const getChat = async(messages: ChatRequestMessage[]) => {
  return await fetch(`/api/chat-request/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messages)
  })
}
