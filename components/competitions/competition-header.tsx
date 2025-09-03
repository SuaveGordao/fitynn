"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Trophy, Target, Scale, UserPlus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CompetitionHeaderProps {
  competition: {
    id: string
    name: string
    description: string | null
    type: "weight_loss" | "measurement"
    measurement_type: string | null
    start_date: string
    end_date: string
    groups: {
      id: string
      name: string
    }
    profiles: {
      display_name: string
    }
  }
  userRole: string
  isParticipating: boolean
  participantCount: number
}

export function CompetitionHeader({
  competition,
  userRole,
  isParticipating,
  participantCount,
}: CompetitionHeaderProps) {
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)

  const getCompetitionStatus = () => {
    const now = new Date()
    const start = new Date(competition.start_date)
    const end = new Date(competition.end_date)

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

  const handleJoinCompetition = async () => {
    setIsJoining(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("competition_participants").insert({
        competition_id: competition.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error joining competition:", error)
    } finally {
      setIsJoining(false)
    }
  }

  const status = getCompetitionStatus()
  const canJoin = status !== "completed" && !isParticipating

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/groups/${competition.groups.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center space-x-2">
                  {competition.type === "weight_loss" ? (
                    <Scale className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Target className="w-6 h-6 text-blue-600" />
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">{competition.name}</h1>
                </div>
                {getStatusBadge(status)}
              </div>

              {competition.description && <p className="text-gray-600 mb-2">{competition.description}</p>}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>
                    {competition.type === "weight_loss" ? "Perda de Peso" : `Medida ${competition.measurement_type}`}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{participantCount} participantes</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(competition.start_date).toLocaleDateString()} -{" "}
                    {new Date(competition.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                <Link href={`/groups/${competition.groups.id}`} className="hover:text-emerald-600">
                  {competition.groups.name}
                </Link>{" "}
                • Criado por {competition.profiles.display_name}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canJoin && (
              <Button
                onClick={handleJoinCompetition}
                disabled={isJoining}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isJoining ? "Participando..." : "Participar da Competição"}
              </Button>
            )}

            {isParticipating && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                Participando
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
