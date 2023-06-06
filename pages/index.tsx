/* eslint-disable @next/next/no-img-element */
import Image, { StaticImageData } from 'next/image'
import { Inter } from 'next/font/google'
import { Button, Tab, Tabs, TextField, Stack, Paper } from '@mui/material'
import { useEffect, useState } from 'react'
import { useInterval } from '@/hooks/useInterval'
import { ChatCompletionRequestMessage } from 'openai'
// import styled from '@emotion/styled'
import { styled } from "@mui/material/styles";
import { ChatRequestMessage } from '@/types'
import MagicWindow from '@/components/MagicWindow'

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
  const [prompt, setPrompt] = useState<string>('')
  const [wisdom, setWisdom] = useState<string>('')
  const [imageSource, setImageSource] = useState<string>('')
  const [wishType, setWishType] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [welcome, setWelcome] = useState<boolean>(true)
  const [hasContent, setHasContent] = useState<boolean>(false)
  const [multiImageSources, setMultiImageSources] = useState<Wisdom[] | null>()
  const [blinkOut, setBlinkout] = useState<boolean>(false)
  const [backgroundSize, setBackgroundSize] = useState<number>(100)
  const [chatMessages, setChatMessages] = useState<ChatRequestMessage[]>([{role: '', content: ''}])

  const systemMessageContent = process.env.CHAT_SYSTEM_MESSAGE_CONTENT || ''
  
  const systemMessage = {
    role: 'system',
    content: systemMessageContent
  }

  useEffect(() => {
    setTimeout(() => {
      setBlinkout(true)
    }, 2000)
    setTimeout(() => {
      setWelcome(false)
      setBlinkout(false)
    }, 2500)

    setChatMessages([systemMessage])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const manageBlinkOut = () => {
    setBlinkout(true)
    setTimeout(() => {
      setLoading(false)
      setHasContent(false)
      setBlinkout(false)
      setBackgroundSize(100)
    }, 500)
  }

  const showMagicWindow: boolean = welcome || loading || hasContent

  const handleCloseMagicWindow = (): void => {
    manageBlinkOut()
    setChatMessages([systemMessage])
  }

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
    2: 'Multi Images',
    3: 'Conversation'
  }

  useInterval(() => {
    // console.log('counter => ', backgroundSize)
    setBackgroundSize(backgroundSize + .3)
  }, !hasContent && (loading || welcome) ? 100 : 0)

  const handleCompletionSubmit = (): void => {
    setBackgroundSize(100)
    setLoading(true)
    fetch(`/api/completion-request/${prompt}`)
      .then(res => {
        if(res.ok) {
          res.json()
            .then(res => {
              console.log('res after calling JSON ', res)
              setWisdom(res.choices[0].text)
              manageBlinkOut()
            })
        } else {
          console.log('why the error? ', res)
        }
      })
  }
  
  const handleChatSubmit = (): void => {  
    const newMessage = {role: 'user', content: prompt}
    const messages = [...chatMessages, newMessage]
    // setChatMessages(messages)
    console.log('new messages => ', messages)
    console.log('messages before fetch => ', chatMessages)
    // setBackgroundSize(100)
    setLoading(true)
    fetch(`/api/chat-request/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messages)
    })
      .then(res => {
        if(res.ok) {
          res.json()
            .then(res => {
              console.log('res after calling JSON ', res)
              console.log('mesages after fetch => ', chatMessages)
              setChatMessages([
                ...chatMessages,
                newMessage,
                res.choices[0].message as ChatCompletionRequestMessage
              ])
              // manageBlinkOut()
            })
            .finally(() => {
              setHasContent(true)
              setLoading(false)
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
              manageBlinkOut()
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

  // const NuraBubble = styled(Paper)(({ theme }) => ({
  //   backgroundColor: '#d66b02',
  //   textAlign: 'left',
  //   maxWidth: 'fit-content',
  //   padding: '10px 15px',
  //   borderRadius: '14px',
  //   alignSelf: 'start'
  // }))

  // const UserBubble = styled(Paper)(({ theme }) => ({
  //   backgroundColor: '#21a5d9',
  //   textAlign: 'right',
  //   maxWidth: 'fit-content',
  //   padding: '10px 15px',
  //   borderRadius: '14px',
  //   alignSelf: 'end'
  // }))

  // const chatBubbles = chatMessages.map((message, i) => {
  //   if(message.role === 'assistant') {
  //     return (
  //       <NuraBubble key={`${i}- ${message.role}`}>
  //         {message.content}
  //       </NuraBubble>
  //     )
  //   } else if(message.role === 'user') {
  //     return (
  //       <UserBubble key={`${i}-${message.role}`}>
  //         {message.content}
  //       </UserBubble>
  //     )
  //   }
  // }) 

  const handlers: CallBackDict = {
    0: handleCompletionSubmit,
    1: handleImageSubmit,
    2: handleImageSubmit,
    3: handleChatSubmit
  }

  const handleSubmit = () => {
    console.log('initial handler')
    handlers[wishType]()
  }


  return (
    <main
      className={`flex min-h-screen flex-col items-center p-16 bg-gray-900 relative ${inter.className}`}
    >
      <div className='mb-36 flex flex-col items-center'>
        <p className='text-6xl text-blaze text-center mb-12 main-nura'>
          NURA
        </p>
        <p className='text-center text-gray-200 mb-3'>
          Select a type of wish
        </p>
        <Tabs value={wishType} onChange={handleWishTypeChange}>
          <Tab label='wisdom'/>
          <Tab label='imagery'/>
          <Tab label='multi image'/>
          <Tab label='conversation'/>
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

          <MagicWindow
            blinkOut={blinkOut}
            backgroundSize={backgroundSize}
            wishType={wishTypes[wishType]}
            loading={loading}
            hasContent={hasContent}
            wisdom={wisdom}
            imageryUrl={imageSource}
            chatMessages={chatMessages}
            handleCloseWindow={handleCloseMagicWindow}
            handleSubmit={handleChatSubmit}
            handleChange={handlePromptChange}
          />
          {/* <div 
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
          </div> */}
        </>
      }

      
        {/* <div 
          className='flex flex-col absolute w-[1024px] h-[1024px] items-center z-10'
          style={{
            background: `${magicBackground}`
          }}
        > */}
        <div>
          {wisdom &&
            <p className='text-gray-300'>OLD  {wisdom}</p>
          }
          
          {/* {chatBubbles.length &&
            <Stack spacing={4}>
              {chatBubbles}
            </Stack>
          } */}

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
