import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">Fitynn</h1>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {params?.error ? (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{params.error}</p>
            ) : (
              <p className="text-sm text-gray-600">An unexpected error occurred during authentication.</p>
            )}
            <div className="pt-4 space-x-4">
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                Try Again
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/auth/signup" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
