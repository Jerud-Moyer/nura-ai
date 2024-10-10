import { ChatRequestMessage } from "@/types";
import { 
  IconButton,
  InputAdornment,
  Paper, 
  Stack, 
  TextField,
  Button
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import { styled } from "@mui/system";
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import React, { 
  useEffect, 
  useRef, 
  useState 
} from "react";
import MarkDownContent from "./MarkDownReader";
import { getTTS } from "@/utils/api";
import { useAudio } from "@/hooks/useAudio";

interface Props {
  blinkOut: boolean,
  backgroundSize: number,
  magicBackground: string,
  loading: boolean,
  hasContent: boolean,
  wishType: string,
  wisdom: string,
  imageryUrl: string,
  chatMessages: ChatRequestMessage[],
  prompt: string,
  magicWindowHeight: number,
  error: string,
  handleCloseWindow: () => void,
  handleSubmit: () => void,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function MagicWindow(props: Props) {
  const { 
    blinkOut,
    backgroundSize,
    magicBackground,
    wishType,
    loading,
    hasContent,
    wisdom,
    imageryUrl,
    chatMessages,
    prompt,
    magicWindowHeight,
    error,
    handleCloseWindow,
    handleSubmit,
    handleChange,
    handleKeyPress
  } = props
  
  const [tempPrompt, setTempPrompt] = useState<string>('')
  const [showCloseIcon, setShowCloseIcon] = useState<boolean>(true)
  const [ttsLoading, setTtsLoading] = useState<boolean>(false)
  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const hasError: boolean = error.length > 0
  const audioPlayer = useAudio()

  useEffect(() => {
    if(chatScrollRef.current) {
      chatScrollRef.current?.scrollIntoView({behavior: 'smooth'})
    }
  }, [chatMessages, loading])

  useEffect(() => {
    if(imageRef.current) {
      setShowCloseIcon(true)
    }
  }, [imageRef])

  const handlePrompt = (e:React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e)
    setTempPrompt(e.target.value)
  }

  const handlePromptSubmit = (): void => {
    // getBackgroundImage()
    handleSubmit()
    setTempPrompt('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if(e.key === 'Enter') {
      handleKeyPress(e)
      setTempPrompt('')
    }
  } 

  const handleTTS = (): void => {
    let text: string = ''

    setTtsLoading(true)
    
    if(wishType == 'Conversation') {
      text = chatMessages[chatMessages.length - 1].content
    } else if(wishType == 'Wisdom') {
      text = wisdom
    }

    if(text.length) {
      getTTS(text)
        .then(mp3 => {
          audioPlayer.playAudio(mp3)
          setTtsLoading(false)
        })
    }
  }

  const buildABubble = (
    message: ChatRequestMessage,
    i: number = 0
  ) => {
    const { content, role } = message
    const isUser = role === 'user'

    const ChatBubble = styled(Paper)(({ theme }) => ({
      backgroundColor: isUser ? '#21a5d9' : '#d66b02',
      textAlign: isUser ? 'right' : 'left',
      maxWidth: '100%',
      padding: '10px 15px',
      borderRadius: '14px',
      alignSelf: isUser ? 'end' : 'start',
      overflowX: 'auto'
    }))

    if(role !== 'system') {
      return (
        <ChatBubble key={`${i}-${role}`}>
          <MarkDownContent 
            content={content}
          />
        </ChatBubble>
      )
    }
  }

  const chatBubbles = chatMessages?.map((message, i) => (
    buildABubble(message, i)
  ))

  const WisdomBubble = styled(Paper)(({ theme }) => ({
    backgroundColor: '#d66b02',
    maxWidth: 'fit-content',
    padding: '20px',
    borderRadius: '14px',
    overflowX: 'auto'
  }))

  const backgroundTransitionTime: string = imageryUrl
    ? '2'
    : '.1'

  const handleCloseMagicWindow = () => {
    setShowCloseIcon(false)
    handleCloseWindow()
  }

  return (
    <div
      className={
        `absolute z-10 rounded-3xl top-[150px]
        ${blinkOut ? 'animate-blink_out shadow-2xl shadow-light' : ''}
      `}
      style={{
        height: `${magicWindowHeight}px`,
        width: `${magicWindowHeight}px`,
        background: `url(${magicBackground})`,
        transition: `background-size .2s linear, background ${backgroundTransitionTime}s linear`,
        backgroundSize: `${backgroundSize}%`,
        backgroundPosition: 'center'
      }}
    >
    {hasContent &&
      <div 
        className={`relative h-full w-full flex flex-col
        justify-between bg-gray-900/50 rounded-2xl
        ${wishType === 'Imagery' ? '' : 'p-8'}`}
      >
        {showCloseIcon && wishType !== 'Imagery' &&
          <span 
            className='absolute top-[10px] left-[10px] cursor-pointer bg-gray-600 rounded-full animate-reveal'
            onClick={handleCloseMagicWindow}
          >
              <HighlightOffTwoToneIcon fontSize='large'/>
          </span>
        }
        {hasError && wishType !== 'Imagery' &&
          buildABubble({
            role: '',
            content: error
          })
        }
        {wishType === 'Conversation' &&
          <>
            {chatBubbles.length &&
              <div className='h-[85%] overflow-y-auto scrollbar-thin scrollbar-track-gray-200/50'>
                <Stack 
                  spacing={4}
                  sx={{
                    minHeight: '100%',
                    
                  }}
                >
                  {chatBubbles}
                  {loading &&
                    buildABubble({
                      role: 'user',
                      content: prompt
                    })
                  }
                  {loading && 
                    <div className="w-[85px] h-[40px] bg-blaze flex flex-row items-center justify-center rounded-3xl mt-6">
                      <div className='w-[12px] h-[12px] bg-white animate-flubble_1 rounded-full mx-1'>
                      </div>
                      <div className='w-[12px] h-[12px] bg-white animate-flubble_2  rounded-full mx-1'>
                      </div>
                      <div className='w-[12px] h-[12px] bg-white animate-flubble_3  rounded-full mx-1'>
                      </div>
                    </div>
                  }
                </Stack>
                <div ref={chatScrollRef}></div>
              </div>
            }
            <div className="relative flex justify-center w-full my-2">
              <LoadingButton
                size='small'
                variant='contained'
                onClick={handleTTS}
                loading={ttsLoading}
              >
                hear the voice of nura
              </LoadingButton>
            </div>
            <TextField
              variant='outlined'
              label='prompt'
              onChange={handlePrompt}
              onKeyDown={handleKeyDown}
              value={tempPrompt}
              InputProps={{
                endAdornment: <InputAdornment
                  position='end'
                >
                  <IconButton onClick={handlePromptSubmit}>
                    <SendOutlinedIcon/>
                  </IconButton>
                </InputAdornment>
              }}
            />

          </>        
        }

        {wishType === 'Wisdom' &&
        <>
        <div className="min-h-[90%] flex flex-col justify-center">
          <WisdomBubble>
            <MarkDownContent 
              content={wisdom}
            />
          </WisdomBubble>
        </div>
        <div className="relative flex justify-center w-full mt-4">
          <LoadingButton
            size='small'
            variant='contained'
            onClick={handleTTS}
            loading={ttsLoading}
          >
            hear the voice of nura
          </LoadingButton>
        </div>
        </>
        }

        {wishType === 'Imagery' && !blinkOut && hasContent &&
        <>
          {showCloseIcon &&
            <span 
              className='absolute top-[10px] left-[10px] cursor-pointer bg-gray-600 rounded-full animate-reveal_slower'
              onClick={handleCloseMagicWindow}
            >
                <HighlightOffTwoToneIcon fontSize='large'/>
            </span>
          }
          {hasError &&
          <div className='p-8 mt-32'>
            {
              buildABubble({
                role: '',
                content: error
              })
            }
          </div>
          }
          { imageryUrl &&
          // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageryUrl}
              alt='your image'
              ref={imageRef}
              className="h-full w-full animate-reveal rounded-2xl"
            />
          }
        </>
        }

      </div>
    } 
    </div>
  )
}
