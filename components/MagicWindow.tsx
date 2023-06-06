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
import { ChatCompletionRequestMessage } from "openai";
import { useEffect, useRef } from "react";
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
  const chatScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if(chatScrollRef.current) {
      chatScrollRef.current?.scrollIntoView({behavior: 'smooth'})
    }
  }, [chatMessages, loading])

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


  return (
    <div
      className={
        `w-[760px] h-[760px] absolute z-10 rounded-3xl top-[150px]
        ${blinkOut ? 'animate-blink_out' : ''}
      `}
      style={{
        transition: 'background-size .2s linear, background .1s linear',
        background: `url('/nura-headshot.png')`,
        backgroundSize: `${backgroundSize}%`,
        backgroundPosition: 'center'
      }}
    >
    {hasContent &&
      <div 
        className='relative h-full w-full flex flex-col
        justify-between bg-gray-900/50 rounded-2xl p-8'
      >
        <span 
          className='absolute top-[10px] left-[10px] cursor-pointer'
          onClick={handleCloseWindow}>X</span>
        {/* {wishType === 'conversation' && */}
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
                  <div className="w-[85px] h-[40px] bg-blaze flex flex-row items-center space-around rounded-3xl mt-6">
                    <div className='w-[15px] h-[15px] bg-gray-400 animate-flubble rounded-full mx-1'>
                    </div>
                    <div className='w-[15px] h-[15px] bg-gray-400 animate-flubble  rounded-full mx-1 delay-one'>
                    </div>
                    <div className='w-[15px] h-[15px] bg-gray-400 animate-flubble  rounded-full mx-1 delay-two'>
                    </div>
                  </div>
                }
                <div ref={chatScrollRef}></div>
              </div>
            }
            <TextField
              variant='outlined'
              label='prompt'
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment
                  position='end'
                >
                  <IconButton onClick={handleSubmit}>
                    <SendOutlinedIcon/>
                  </IconButton>
                </InputAdornment>
              }}
            />

          </>        
        

      </div>
    } 
    </div>
  )
}
