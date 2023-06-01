/* eslint-disable @next/next/no-img-element */
import Image, { StaticImageData } from 'next/image'
import { Inter } from 'next/font/google'
import { Button, Tab, Tabs, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { useInterval } from '@/hooks/useInterval'

const inter = Inter({ subsets: ['latin'] })

type Wisdom = {
  [k: string]: string
}

type NumIndexed = {
  [k: number]: string
}

type CallBackDict = {
  [k: number]: () => void
}

export default function Home() {
  const [prompt, setPrompt] = useState<string>()
  const [reply, setReply] = useState<string>()
  const [imageSource, setImageSource] = useState<string | null>()
  const [wishType, setWishType] = useState<number>(0)
  const [wisdom, setWisdom] = useState<Wisdom>({
    wisdom: '',
    imagery: ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [welcome, setWelcome] = useState<boolean>(true)
  const [multiImageSources, setMultiImageSources] = useState<Wisdom[] | null>()
  const [blinkOut, setBlinkout] = useState<boolean>(false)
  const [backgroundSize, setBackgroundSize] = useState<number>(100)

  useEffect(() => {
    setTimeout(() => {
      setBlinkout(true)
    }, 2000)
    setTimeout(() => {
      setWelcome(false)
      setBlinkout(false)
    }, 2500)
  }, [])

  const manageLoadingBlinkOut = () => {
    setBlinkout(true)
    setTimeout(() => {
      setLoading(false)
      setBlinkout(false)
    }, 500)
  }

  const showMagicWindow: boolean = welcome || loading

  const magicBackground = '' // todo set this up

  const handlePromptChange = (e:React.ChangeEvent<HTMLInputElement>): void => {
    setPrompt(e.target.value)
  }

  const handleWishTypeChange = (e: React.SyntheticEvent, newVal: number) => {
    setWishType(newVal)
  }

  const wishTypes: NumIndexed = {
    0: 'Wisdom',
    1: 'Imagery',
    2: 'Multi Images'
  }

  useInterval(() => {
    console.log('counter => ', backgroundSize)
    setBackgroundSize(backgroundSize + .3)
  }, loading || welcome ? 100 : 0)

  const handleChatSubmit = (): void => {
    setBackgroundSize(100)
    setLoading(true)
    fetch(`/api/chat-request/${prompt}`)
      .then(res => {
        if(res.ok) {
          res.json()
            .then(res => {
              console.log('res after calling JSON ', res)
              setReply(res.choices[0].text)
              manageLoadingBlinkOut()
            })
        } else {
          console.log('why the error? ', res)
        }
      })
  }
  const handleImageSubmit = () => {
    setBackgroundSize(100)
    setLoading(true)
    fetch(`/api/image-request/${prompt}`)
      .then(res => {
        if(res.ok) {
          res.json()
            .then(res => {
              console.log('res after calling JSON ', res)
              if(wishType === 2) {
                setMultiImageSources(res.data)
              } else {
                setImageSource(res.data[0].url)
              }
              manageLoadingBlinkOut()
            })
        } else {
          console.log('why the error? ', res)
        }
      })
  }

  const multiImages = multiImageSources?.map(imageSrc => (
    <div className='w-[400px]' key={imageSrc.url}>
      <img 
        src={imageSrc.url} 
        alt='AI image' 
        width='400'
        height='400'
      />
    </div>
  ))

  const handlers: CallBackDict = {
    0: handleChatSubmit,
    1: handleImageSubmit,
    2: handleImageSubmit,
  }

  const handleSubmit = () => {
    console.log('initial handler')
    handlers[wishType]()
  }


  return (
    <main
      className={`flex min-h-screen flex-col items-center p-24 bg-gray-900 relative ${inter.className}`}
    >
      <div className='mb-36 flex flex-col items-center'>
        <p className='text-6xl text-blaze text-center mb-12'>
          NURA
        </p>
        <p className='text-center text-gray-200 mb-3'>
          Select a type of wish
        </p>
        <Tabs value={wishType} onChange={handleWishTypeChange}>
          <Tab label='wisdom'/>
          <Tab label='imagery'/>
          <Tab label='mutli image'/>
        </Tabs>
        <div className='mt-12 w-[500px] max-w-[90%]'>
          <TextField
            label='Enter your Wish'
            multiline
            variant='outlined'
            fullWidth
            rows={6}
            onChange={handlePromptChange}
          />
        </div>
        <p className='mt-12'>
          ask Nura for {wishTypes[wishType]}
        </p>
        <div className='mt-3'>
          <Button
            variant='outlined'
            onClick={() => handleSubmit()}
          >
            ask
          </Button>
        </div>
      </div>

       
      {showMagicWindow &&
      <>
        <div 
          className={
            `w-[760px] h-[760px] absolute z-10 rounded-3xl top-[200px]
            ${blinkOut ? 'animate-blink_out' : ''}
          `}
          style={{
            transition: 'background-size .2s linear, background .1s linear',
            background: `url('/nura-headshot.png')`,
            backgroundSize: `${backgroundSize}%`,
            backgroundPosition: 'center'
          }}
        >
        </div>
        <div className={`
          absolute top-[50%]
          ${blinkOut ? 'animate-flare_x' : ''}
        `}>
        </div>
        <div className={`
          absolute top-[40%]
          ${blinkOut ? 'animate-flare_y' : ''}
        `}>
        </div>
      </>
      }

      
        {/* <div 
          className='flex flex-col absolute w-[1024px] h-[1024px] items-center z-10'
          style={{
            background: `${magicBackground}`
          }}
        > */}
        <div>
          {reply &&
            <p className='text-gray-300'>{reply}</p>
          }
          
          {imageSource &&
            <div className='w-[800px]'>
              <img 
                src={imageSource} 
                alt='AI image' 
                width='800'
                height='800'
              />
            </div>
          }
        </div>
      
      {multiImageSources &&
        <div>
          {multiImages}
        </div>
      }
    </main>
  )
}
