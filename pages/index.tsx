/* eslint-disable @next/next/no-img-element */
import Image, { StaticImageData } from 'next/image'
import { Inter } from 'next/font/google'
import { Button, Tab, Tabs, TextField, Stack, Paper, Dialog, Icon, Tooltip } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useInterval } from '@/hooks/useInterval'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { ChatRequestMessage } from '@/types'
import MagicWindow from '@/components/MagicWindow'
import { getChat, getCompletion, getImage } from '@/utils/api'

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
  const [error, setError] = useState<string>('')
  const appRef = useRef<HTMLElement>(null)


  const systemMessageContent: string = process.env.NEXT_PUBLIC_SYSTEM_MESSAGE as string
  const wisdomPrepromp: string = process.env.NEXT_PUBLIC_WISDOM_PRE_PROMPT as string
  
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
    setWisdom('')
    setImageSource('')
    setError('')
  }

  const handlePromptChange = (e:React.ChangeEvent<HTMLInputElement>): void => {
    setPrompt(e.target.value)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('event key? => ', e)
    if(e.key === 'Enter') handleChatSubmit()
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
    const imageIdx = Math.floor(Math.random() * 19) + 1
    const newImageUrl = `${preImageUrl}nura_${imageIdx}`
    setMagicBackground(newImageUrl)
  }

  const handleCompletionSubmit = (): void => {
    getBackgroundImage()
    setBackgroundSize(100)
    setLoading(true)

    getCompletion(`${wisdomPrepromp}${prompt}`)
      .then(res => {
        if(!res.ok) {
          console.error(`ERROR => ${res.statusText}`)
          throw new Error(res.statusText)
        }

        const data = res.body
        if(!data) {
          return
        }
        const reader = data.getReader()
        const decoder = new TextDecoder()
        let done = false
        let counter = 0

        setHasContent(true)
        setLoading(false)

        while(!done && counter < 1001) {
          counter ++
          
          reader.read()
            .then(({ value, done: doneReading }) => {
              done = doneReading
              const chunkValue = decoder.decode(value) 
              setWisdom(prev => prev + chunkValue)
            })
        }
      })
  }

  
  const handleChatSubmit = (attempts: number = 0): void => {  
    const newMessage = {role: 'user', content: prompt}
    const messages = [...chatMessages, newMessage]
    setLoading(true)
    if (messages.length === 2) getBackgroundImage()
    
    getChat(messages)
      .then(res => {
        if(res.ok) {
          res.json()
            .then(res => {
              setChatMessages([
                ...chatMessages,
                newMessage,
                res[0].message
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
            res.json()
            console.log('why the error? ', res)
            setError(`a ${res.status} error has occurred - ${res.statusText}`)
          }
        }
      })
  }

  const handleImageSubmit = () => {
    getBackgroundImage()
    setBackgroundSize(100)
    setLoading(true)
    
    getImage(prompt)
      .then(res => {
        if(!res.error) {
          console.log('we get here then? ', res)
              if(wishType === 2) {
                // only if multi image reinstated!
                setMultiImageSources(res)
              } else {
                setImageSource(res[0].url)
              }
        } else if(res.error) {
          console.log('error front A => ', res)
          setError(`a ${res.error.code} error has occurred - ${res.error.message}`)
        } else {
          console.log('error fron B => ', res)
          setError(`a ${res.status} error has occured. - ${res.statusText} - please try again`)
        }
      }).finally(() => {
        setHasContent(true)
        setLoading(false)
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
              Nura came about quite simply as an exploration into OpenAI&rsquo;s API. The <span className='text-blaze'>WISDOM</span> mode utilizes GPT-3.5-turbo-instruct and prompt engineering do deliver a singular answer to a given prompt. Best thought of as the philosopher-mode of Nura, Wisdom produces sometimes whimsical answers to a user&rsquo;s questions. <span className='text-blaze'>CONVERSATION</span> utilizes GPT-3.5-turbo model and is designed for chat. Conversation should present a similar persona as Wisdom but can be counted on for providing better responses to real world questions, so for anything regarding code or the sciences, for example, it would be the better option.&nbsp; <span className='text-blaze'>IMAGERY</span> comes courtesy of the DALL-E-3 imaging model. 
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
        <p className='text-center mb-3 text-blaze relative -translate-x-3'>
          Select a type of wish &nbsp;
          <Tooltip title='see ABOUT NURA for info.' placement='top'>
            <span className='absolute -top-[2px] -translate-x-[2px] scale-80'>
              <HelpOutlineIcon text-size='small' />
            </span>
          </Tooltip>
        </p>
        <Tabs value={wishType} onChange={handleWishTypeChange}>
          <Tab label='wisdom'/>
          <Tab label='imagery'/>
          {/* <Tab label='multi image'/> */}
          <Tab label='conversation'/>
        </Tabs>
        <div className='mt-12 w-[500px] max-w-[90vw]'>
          <TextField
            label='Enter a prompt for your wish'
            multiline
            variant='outlined'
            fullWidth
            rows={6}
            onChange={handlePromptChange}
          />
        </div>
        <p className='mt-12 text-blaze'>
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
            error={error}
            handleCloseWindow={handleCloseMagicWindow}
            handleSubmit={handleChatSubmit}
            handleChange={handlePromptChange}
            handleKeyPress={handleKeyPress}
          />
          {blinkOut &&
            <>
              <div className={`
                absolute top-[55%] h-[1px] w-[1px] border border-color-blaze shadow-md shadow-bright_light
                ${blinkOut ? 'animate-flare_x' : ''}
              `}>
              </div>
              <div className={`
                absolute top-[45%] h-[2px] w-[1px] border border-color-blaze shadow-md shadow-bright_light
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
