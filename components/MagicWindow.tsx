import { ChatRequestMessage } from "@/types";
import { 
  IconButton,
  InputAdornment,
  Paper, 
  Stack, 
  TextField 
} from "@mui/material";
import { styled } from "@mui/system";
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import { ChatCompletionRequestMessage } from "openai";
import React, { useEffect, useRef, useState } from "react";
import MarkDownContent from "./MarkDownReader";
// import { useRemarkSync } from "react-remark";

interface Props {
  blinkOut: boolean,
  backgroundSize: number,
  loading: boolean,
  hasContent: boolean,
  wishType: string,
  wisdom: string,
  imageryUrl: string,
  chatMessages: ChatRequestMessage[],
  prompt: string,
  handleCloseWindow: () => void,
  handleSubmit: () => void,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function MagicWindow(props: Props) {
  const { 
    blinkOut,
    backgroundSize,
    wishType,
    loading,
    hasContent,
    wisdom,
    imageryUrl,
    chatMessages,
    prompt,
    handleCloseWindow,
    handleSubmit,
    handleChange
  } = props
  const [tempPrompt, setTempPrompt] = useState<string>('')
  const chatScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if(chatScrollRef.current) {
      chatScrollRef.current?.scrollIntoView({behavior: 'smooth'})
    }
  }, [chatMessages, loading])

  const handlePrompt = (e:React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e)
    setTempPrompt(e.target.value)
  }

  const handlePromptSubmit = (): void => {
    handleSubmit()
    setTempPrompt('')
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
      maxWidth: 'fit-content',
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

  const backgroundImageUrl: string = imageryUrl || '/nura-headshot.png'

  const backgroundTransitionTime: string = imageryUrl
    ? '2'
    : '.1'

  return (
    <div
      className={
        `w-[760px] h-[760px] absolute z-10 rounded-3xl top-[150px]
        ${blinkOut ? 'animate-blink_out shadow-2xl shadow-light' : ''}
      `}
      style={{
        transition: `background-size .2s linear, background ${backgroundTransitionTime}s linear`,
        background: 'url(/nura-headshot.png)',
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
        <span 
          className='absolute top-[10px] left-[10px] cursor-pointer'
          onClick={handleCloseWindow}
        >
          X
            {/* <HighlightOffTwoToneIcon fontSize='large'/> */}
        </span>
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
                </Stack>
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
                <div ref={chatScrollRef}></div>
              </div>
            }
            <TextField
              variant='outlined'
              label='prompt'
              onChange={handlePrompt}
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
        <div className="min-h-full flex flex-col justify-center">
          <WisdomBubble>
            <MarkDownContent 
              content={wisdom}
            />
          </WisdomBubble>
        </div>
        }

        {wishType === 'Imagery' &&
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageryUrl}
            alt='your image'
            className="h-full w-full animate-reveal rounded-2xl"
          />
        }

      </div>
    } 
    </div>
  )
}
