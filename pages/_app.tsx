import createEmotionCache from '@/mui-config/createEmotionCache'
import '@/styles/globals.css'
import { CacheProvider, EmotionCache, ThemeProvider } from '@emotion/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import theme from '../mui-config/theme'

const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache: EmotionCache;
}

export default function App({ 
  Component, 
  emotionCache = clientSideEmotionCache, 
  pageProps 
}: MyAppProps
) {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta 
          name="viewport" 
          content="initial-scale=1, 
          width=device-width" 
        />
      </Head>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}
