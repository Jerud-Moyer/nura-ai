/* eslint-disable @next/next/no-img-element */
import Image, { StaticImageData } from 'next/image'
import { Inter } from 'next/font/google'
import { Button, Tab, Tabs, TextField } from '@mui/material'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

type MultiImageResponseItem = {
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
  const [multiImageSources, setMultiImageSources] = useState<MultiImageResponseItem[] | null>()

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

  const handleChatSubmit = (): void => {
    fetch(`/api/chat-request/${prompt}`)
      .then(res => {
        if(res.ok) {
          res.json()
            .then(res => {
              console.log('res after calling JSON ', res)
              setReply(res.choices[0].text)
            })
        } else {
          console.log('why the error? ', res)
        }
      })
  }
  const handleImageSubmit = () => {
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
      className={`flex min-h-screen flex-col items-center p-24 bg-gray-900 ${inter.className}`}
    >
      <div className='mb-36 flex flex-col items-center'>
        <p className='text-6xl text-gray-200 text-center mb-12'>
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
      <div 
        className='flex flex-col items-center border-2'
      >
        {/* <TextField
          label='Enter Wish'
          multiline
          variant='outlined'
          rows={6}
          onChange={handlePromptChange}
        /> */}
        <p className='text-gray-300'>{reply}</p>
        {/* <Button
          variant='outlined'
          onClick={() => handleSubmit()}
        >
          {wishTypes[wishType]}
        </Button> */}
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
