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
