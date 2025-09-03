"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Plus, Calendar, Users, Target, Scale } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { CreateCompetitionModal } from "./create-competition-modal"

interface Competition {
  id: string
  name: string
  description: string | null
  type: "weight_loss" | "measurement"
  measurement_type: string | null
  start_date: string
  end_date: string
  created_at: string
  competition_participants: { count: number }[]
  profiles: {
    display_name: string
  }
}

interface CompetitionsSectionProps {
  competitions: Competition[]
  groupId: string
  userRole: string
}

export function CompetitionsSection({ competitions, groupId, userRole }: CompetitionsSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const isAdmin = userRole === "admin"

  const getCompetitionStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return "upcoming"
    if (now > end) return "completed"
    return "active"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Em Breve
          </Badge>
        )
      case "active":
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            Ativa
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Concluída
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type: string, measurementType: string | null) => {
    if (type === "weight_loss") {
      return <Scale className="w-4 h-4" />
    }
    return <Target className="w-4 h-4" />
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Competições</h2>
          {isAdmin && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Competição
            </Button>
          )}
        </div>

        {competitions.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-gray-200">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma Competição Ainda</h3>
                <p className="text-gray-600 mb-4">
                  {isAdmin
                    ? "Crie sua primeira competição para começar!"
                    : "Aguarde um admin criar a primeira competição."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {competitions.map((competition) => {
              const status = getCompetitionStatus(competition.start_date, competition.end_date)
              const participantCount = competition.competition_participants?.[0]?.count || 0

              return (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(competition.type, competition.measurement_type)}
                          <CardTitle className="text-lg text-gray-900">{competition.name}</CardTitle>
                        </div>
                        {competition.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{competition.description}</p>
                        )}
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Tipo:</span>
                        <span className="font-medium">
                          {competition.type === "weight_loss"
                            ? "Perda de Peso"
                            : `Medida ${competition.measurement_type}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Participantes:</span>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span className="font-medium">{participantCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Duração:</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium">
                            {new Date(competition.start_date).toLocaleDateString()} -{" "}
                            {new Date(competition.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/competitions/${competition.id}`}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Ver Competição</Button>
                    </Link>

                    <div className="text-xs text-gray-500">
                      Criado por {competition.profiles.display_name} em{" "}
                      {new Date(competition.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <CreateCompetitionModal open={showCreateModal} onOpenChange={setShowCreateModal} groupId={groupId} />
    </>
  )
}
