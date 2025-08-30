import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Join() {
  const router = useRouter()

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Join LocalGuide</h1>
        
        <div className="space-y-6">
          <Card className="text-center">
            <h2 className="text-xl font-semibold mb-4">Choose how you want to join</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/traveler')}
                  className="w-full"
                  size="lg"
                >
                  Join as Traveler
                </Button>
                <p className="text-sm text-gray-600">
                  Connect with locals and explore destinations like a local
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/local')}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  Join as Local
                </Button>
                <p className="text-sm text-gray-600">
                  Help travelers discover your city's hidden gems
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button 
                onClick={() => router.push('/login')}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Already have an account? Login here
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}