import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">Fitynn</h1>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Verifique seu E-mail</CardTitle>
            <CardDescription>Enviamos um link de confirmação para completar seu cadastro</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Por favor, verifique seu e-mail e clique no link de confirmação para ativar sua conta. Após a confirmação,
              você poderá começar a criar e participar de competições fitness!
            </p>
            <div className="pt-4">
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                Voltar para Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
