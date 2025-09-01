import '../styles/globals.css'
import { UIProvider } from '../components/ui/UIProvider'

export default function App({ Component, pageProps }) {
  return (
    <UIProvider>
      <Component {...pageProps} />
    </UIProvider>
  )
}