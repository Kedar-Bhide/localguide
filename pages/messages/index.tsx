import Head from 'next/head'
import ChatLayout from '../../components/chat/ChatLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'

export default function Messages() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Messages - LocalGuide</title>
        <meta name="description" content="Your conversations with local experts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChatLayout>
        <></>
      </ChatLayout>
    </ProtectedRoute>
  )
}