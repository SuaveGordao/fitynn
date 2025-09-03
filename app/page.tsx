import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Users, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-600">Fitynn</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-600 hover:text-emerald-600">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
            Compete, Motivate, and Transform Together
          </h2>
          <p className="text-xl text-gray-600 mb-8 text-pretty">
            Join fitness competitions with friends, track your progress, and achieve your health goals through friendly
            competition and mutual support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Group Competitions</h3>
              <p className="text-sm text-gray-600">
                Create or join fitness groups and compete with friends in weight loss and measurement challenges.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Goal Tracking</h3>
              <p className="text-sm text-gray-600">
                Set specific targets for weight loss or body measurements and track your progress over time.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Progress Analytics</h3>
              <p className="text-sm text-gray-600">
                Visualize your journey with detailed charts and rankings to stay motivated.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Social Feed</h3>
              <p className="text-sm text-gray-600">
                Share achievements, photos, and encourage each other through an integrated social feed.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Competing?</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are achieving their fitness goals through friendly competition and community
            support.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
