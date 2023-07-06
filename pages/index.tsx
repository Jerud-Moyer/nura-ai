/* eslint-disable @next/next/no-img-element */
import Image, { StaticImageData } from 'next/image'
import { Inter } from 'next/font/google'
import { Button, Tab, Tabs, TextField, Stack, Paper, Dialog } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useInterval } from '@/hooks/useInterval'
import { ChatCompletionRequestMessage } from 'openai'
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
  const preImageUrl = process.env.NEXT_PUBLIC_IMAGE_URL
  const initialImageUrl = `${preImageUrl}nura_1`
  const [magicBackground, setMagicBackground] = useState<string>(initialImageUrl)
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
  const [showAboutDialog, setShowAboutDialog] = useState<boolean>(false)
  const [showMoreDialog, setShowMoreDialog] = useState<boolean>(false)
  const [magicWindowHeight, setMagicWindowHeight] = useState<number>(0)
  const appRef = useRef<HTMLElement>(null)

  const systemMessageContent: string = process.env.NEXT_PUBLIC_SYSTEM_MESSAGE as string
  
 const systemMessage = useMemo(() => ({
    role: 'system',
    content: systemMessageContent
  }),  [systemMessageContent])


  useEffect(() => {
    setTimeout(() => {
      setBlinkout(true)
    }, 2000)
    setTimeout(() => {
      setWelcome(false)
      setBlinkout(false)
    }, 2500)

  }, [])

  useEffect(() => {
    const windowWidth = window.screen.width
    if(appRef.current) {
      const magicHeight = appRef.current.clientHeight - 200
      if(windowWidth > magicHeight) {
        setMagicWindowHeight(magicHeight)
      } else {
        setMagicWindowHeight(windowWidth - 50)
      }
    }
  }, [appRef.current?.clientHeight])
  
  useEffect(() => {
    setChatMessages([systemMessage])
  }, [systemMessageContent, systemMessage])

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
    setImageSource('')
  }

 // const magicBackground = ''  todo set this up

  const handlePromptChange = (e:React.ChangeEvent<HTMLInputElement>): void => {
    setPrompt(e.target.value)
  }

  const handleWishTypeChange = (e: React.SyntheticEvent, newVal: number) => {
    setWishType(newVal)
  }

  const wishTypes: NumIndexed = {
    0: 'Wisdom',
    1: 'Imagery',
    // 2: 'Multi Images',
    2: 'Conversation'
  }

  useInterval(() => {
    setBackgroundSize(backgroundSize + .3)
  }, !hasContent && (loading || welcome) ? 100 : 0)

  const getBackgroundImage = () => {
    const imageIdx = Math.floor(Math.random() * 22) + 1
    const newImageUrl = `${preImageUrl}nura_${imageIdx}`
    setMagicBackground(newImageUrl)
  }

  const handleCompletionSubmit = (): void => {
    console.log('completion submit')
    getBackgroundImage()
    setBackgroundSize(100)
    setLoading(true)
    fetch(`/api/completion-request/${prompt} ->`)
      .then(res => {
        if(res.ok) {
          res.json()
            .then(res => {
              console.log('res after calling JSON ', res)
              setWisdom(res.choices[0].text)
            }).finally(() => {
              console.log('FINALLY!')
              setHasContent(true)
              setLoading(false)
            })
        } else {
          console.log('why the error? ', res.json())
        }
      })
  }

  
  const handleChatSubmit = (attempts: number = 0): void => {  
    console.log('chat submit')
    const newMessage = {role: 'user', content: prompt}
    const messages = [...chatMessages, newMessage]
    setLoading(true)
    if (messages.length === 2) getBackgroundImage()
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
              setChatMessages([
                ...chatMessages,
                newMessage,
                res.choices[0].message as ChatCompletionRequestMessage
              ])
            })
            .finally(() => {
              setHasContent(true)
              setLoading(false)
            })
        } else {
          if(attempts <= 3) {
            console.log(`error - waiting for re-attempt number ${attempts + 1}`)
            handleChatSubmit(attempts + 1)
          } else {
            console.log('why the error? ', res)
          }
        }
      })
  }

  const handleImageSubmit = () => {
    console.log('image submit')
    getBackgroundImage()
    setBackgroundSize(100)
    setLoading(true)
    fetch(`/api/image-request/${prompt}`)
      .then(res => {
        if(res.ok) {
          res.json()
            .then(res => {
              console.log('res after calling JSON ', res)
              if(wishType === 2) {
                // only if multi image reinstated!
                console.log('wishtype 2? ', wishType)
                setMultiImageSources(res.data)
              } else {
                console.log('oooor not ', wishType)
                setImageSource(res.data[0].url)
              }
              setHasContent(true)
              setLoading(false)
              // manageBlinkOut()
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
    0: handleCompletionSubmit,
    1: handleImageSubmit,
    // 2: handleImageSubmit,
    2: handleChatSubmit
  }

  const handleSubmit = () => {
    handlers[wishType]()
  }


  return (
    <main
      ref={appRef}
      className={`main-box flex flex-col items-center p-16 bg-gray-900 relative ${inter.className}`}
    >
      <div className='mb-36 flex flex-col items-center'>
        <div className='absolute top-2 right-12 flex flex-row'>
          <div className='mx-2'>
            <Button
              variant='text'
              onClick={() => setShowAboutDialog(true)}
            >
              about Nura
            </Button>
          </div>
          <div className='mx-2'>
            <Button
              variant='text'
              onClick={() => setShowMoreDialog(true)}
            >
              more like this
            </Button>
          </div>
        </div>
        <Dialog 
          open={showAboutDialog}
          onClose={() => setShowAboutDialog(false)}  
        >
          <Paper
            sx={{
              padding: '40px',
              borderRadius: '10px'
            }}
          >
            <p className='text-2xl text-blaze text-center'>
              About Nura
            </p>
            <p className='text-nura_blue my-2'>
              Nura came about quite simply as an exploration into OpenAI&rsquo;s API. The Wisdom function is built on a custom fine-tuned version of the Davinci model, while conversation utilizes the same GPT-3-turbo model as Chat-GPT. The Imagery comes courtesy of the DALL-E imaging model. 
            </p>
            <p className='text-nura_blue'>
              As a developer I wanted to utilize Nura&rsquo;s abilities as much as possible during the development process. All images in the app where created by Nura, it helped me through a couple of interesting coding problems, and it even named itself.
            </p>
          </Paper>
        </Dialog>
        <Dialog 
          open={showMoreDialog}
          onClose={() => setShowMoreDialog(false)}  
        >
          <Paper
            sx={{
              padding: '40px',
              borderRadius: '10px'
            }}
          >
            <div className='flex flex-col items-center'>
              <a 
                className='text-xl text-nura_blue my-3'
                href='https://nerdmeme.fun'
                target='blank'  
              >
                nerdMeme.fun
              </a>
              <a 
                className='text-xl text-nura_blue my-3'
                href='https://jerud-moyer.dev' 
                target='blank' 
              >
                jerud-moyer.dev
              </a>
            </div>
          </Paper>
        </Dialog>
        <p className='text-6xl text-blaze text-center mb-20 main-nura'>
          NURA
        </p>
        <p className='text-center text-gray-200 mb-3'>
          Select a type of wish
        </p>
        <Tabs value={wishType} onChange={handleWishTypeChange}>
          <Tab label='wisdom'/>
          <Tab label='imagery'/>
          {/* <Tab label='multi image'/> */}
          <Tab label='conversation'/>
        </Tabs>
        <div className='mt-12 w-[500px] max-w-[90vw]'>
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
            magicBackground={magicBackground}
            wishType={wishTypes[wishType]}
            loading={loading}
            hasContent={hasContent}
            wisdom={wisdom}
            imageryUrl={imageSource}
            chatMessages={chatMessages}
            prompt={prompt}
            magicWindowHeight={magicWindowHeight}
            handleCloseWindow={handleCloseMagicWindow}
            handleSubmit={handleChatSubmit}
            handleChange={handlePromptChange}
          />
          {blinkOut &&
            <>
              <div className={`
                absolute top-[50%] h-[1px] w-[1px] border border-color-blaze shadow-md shadow-bright_light
                ${blinkOut ? 'animate-flare_x' : ''}
              `}>
              </div>
              <div className={`
                absolute top-[50%] h-[2px] w-[1px] border border-color-blaze shadow-md shadow-bright_light
                ${blinkOut ? 'animate-flare_y' : ''}
              `}>
              </div> 
            </>
          }
        </>
      }
      
      {multiImageSources &&
        <div>
          {multiImages}
        </div>
      }
    </main>
  )
}
