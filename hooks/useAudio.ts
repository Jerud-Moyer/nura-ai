import  { useEffect, useRef } from 'react';

export function useAudio() {
  const audioRef = useRef<AudioContext>()

  const createAudioSource = async(mp3: ArrayBuffer): Promise<{audioBuffer: AudioBuffer, reverbBuffer: AudioBuffer} | null> => {
      if(audioRef.current) {
        const buffer = await audioRef.current.decodeAudioData(mp3)

        const verb = await fetch('/sounds/ethereal-growling-in-a-cave.mp3')
        const verbArrayBuffer = await verb.arrayBuffer()
        
        const verbBuffer = await audioRef.current.decodeAudioData(verbArrayBuffer)

        return {
          audioBuffer: buffer,
          reverbBuffer: verbBuffer
        }
      } 

      else return null
  }
  
  const playAudio = async(mp3: ArrayBuffer): Promise<void> => {
    const buffers = await createAudioSource(mp3)

    if(audioRef.current && buffers) {
      const { audioBuffer, reverbBuffer } = buffers
      
      // primary audio source
      const audioSource = audioRef.current.createBufferSource()
      audioSource.buffer = audioBuffer
      const audioGain = audioRef.current.createGain()
      audioGain.gain.value = 1
      audioSource.connect(audioGain)

      const highShelfFilter = audioRef.current.createBiquadFilter()
      highShelfFilter.type = 'highshelf'
      highShelfFilter.frequency.setValueAtTime(1600, audioRef.current.currentTime)
      highShelfFilter.gain.setValueAtTime(12, audioRef.current.currentTime)
      
      const lowShelfFilter = audioRef.current.createBiquadFilter()
      lowShelfFilter.type = 'lowshelf'
      lowShelfFilter.frequency.setValueAtTime(1600, audioRef.current.currentTime)
      lowShelfFilter.gain.setValueAtTime(-12, audioRef.current.currentTime)

      const highPassFilter = audioRef.current.createBiquadFilter()
      highPassFilter.type = 'highpass'
      highPassFilter.frequency.value = 800

      audioGain.connect(highShelfFilter)
      highShelfFilter.connect(lowShelfFilter)
      lowShelfFilter.connect(highPassFilter)

      audioSource.connect(highPassFilter)
      audioSource.connect(audioRef.current.destination)
     
      // echo source
      const echoSource = audioRef.current.createBufferSource()
      echoSource.buffer = audioBuffer
      const synthDelay = audioRef.current.createDelay(5)
      synthDelay.delayTime.setValueAtTime(1, audioRef.current.currentTime)
      const echoGain = audioRef.current.createGain()
      echoGain.gain.setValueAtTime(0.1, audioRef.current.currentTime)
      
      const convolver = audioRef.current.createConvolver()
      if(reverbBuffer) convolver.buffer = reverbBuffer

      echoSource.connect(echoGain)
      echoGain.connect(convolver)
      convolver.connect(audioRef.current.destination)
      
      // delay source
      const delaySource = audioRef.current.createBufferSource()
      const delayGain = audioRef.current.createGain()
      delaySource.buffer = audioBuffer
      delayGain.gain.setValueAtTime(0.2, audioRef.current.currentTime)
      delaySource.connect(delayGain)
      delayGain.connect(synthDelay)
      synthDelay.connect(audioRef.current.destination)

      audioSource.start(0)
      echoSource.start(0)
      delaySource.start(0)
      
    }
  }
  
  useEffect(() => {
    const audioCtx = new AudioContext()
    audioRef.current = audioCtx

    if(audioRef.current) console.log('audio ref initiated')

  }, [])

  return {
    playAudio
  }

}
