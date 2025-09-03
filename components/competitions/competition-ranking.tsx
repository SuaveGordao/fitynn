"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, Award, TrendingDown, TrendingUp, Target, BarChart3, Users, Zap } from "lucide-react"
import { CompetitionScoring } from "@/lib/scoring"
import { useMemo } from "react"

interface CompetitionRankingProps {
  competition: {
    type: "weight_loss" | "measurement"
    measurement_type: string | null
  }
  participants: any[]
}

export function CompetitionRanking({ competition, participants }: CompetitionRankingProps) {
  const isWeightLoss = competition.type === "weight_loss"

  const { rankedParticipants, competitionStats } = useMemo(() => {
    const scoring = new CompetitionScoring(competition.type, competition.measurement_type || undefined)

    const scoredParticipants = participants.map((participant) => {
      const measurements = (participant.measurements || []).map((m: any) => ({
        initial: isWeightLoss ? participant.initial_weight : participant.initial_measurement,
        current: isWeightLoss ? m.weight : m.measurement_value,
        recordedAt: m.recorded_at,
      }))

      const initialValue = isWeightLoss ? participant.initial_weight : participant.initial_measurement
      const scoreData = scoring.calculateParticipantScore(initialValue || 0, measurements)

      return {
        userId: participant.user_id,
        displayName: participant.profiles?.display_name || "Unknown User",
        avatarUrl: participant.profiles?.avatar_url,
        ...scoreData,
      }
    })

    const ranked = scoring.rankParticipants(scoredParticipants)
    const stats = scoring.calculateCompetitionStats(ranked)

    return { rankedParticipants: ranked, competitionStats: stats }
  }, [participants, competition.type, competition.measurement_type, isWeightLoss])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</div>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">1st Place</Badge>
      case 2:
        return <Badge className="bg-gray-400 hover:bg-gray-500">2nd Place</Badge>
      case 3:
        return <Badge className="bg-amber-600 hover:bg-amber-700">3rd Place</Badge>
      default:
        return <Badge variant="outline">#{rank}</Badge>
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingDown className="w-4 h-4 text-emerald-600" />
      case "declining":
        return <TrendingUp className="w-4 h-4 text-red-600" />
      default:
        return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-emerald-600"
      case "declining":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{competitionStats.totalParticipants}</div>
            <p className="text-sm text-gray-500">Total Participants</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{competitionStats.averageImprovement.toFixed(1)}%</div>
            <p className="text-sm text-gray-500">Avg Improvement</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{competitionStats.topImprovement.toFixed(1)}%</div>
            <p className="text-sm text-gray-500">Best Result</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {(competitionStats.consistencyRate * 100).toFixed(0)}%
            </div>
            <p className="text-sm text-gray-500">Consistency</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankedParticipants.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No participants yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rankedParticipants.map((participant) => {
                const rank = participant.rank
                const progressColor =
                  participant.percentageChange > 0
                    ? "text-emerald-600"
                    : participant.percentageChange < 0
                      ? "text-red-600"
                      : "text-gray-500"

                return (
                  <div
                    key={participant.userId}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      rank <= 3
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(rank)}
                        {rank <= 3 && getRankBadge(rank)}
                      </div>

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-600">
                          {participant.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{participant.displayName}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(participant.trend)}
                            <span className={`text-xs font-medium ${getTrendColor(participant.trend)}`}>
                              {participant.trend}
                            </span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">
                              {(participant.consistency * 100).toFixed(0)}% consistent
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 ${progressColor}`}>
                          <span className="font-semibold">
                            {participant.percentageChange > 0 ? "-" : participant.percentageChange < 0 ? "+" : ""}
                            {Math.abs(participant.percentageChange).toFixed(1)}%
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {participant.score.toFixed(0)} pts
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {participant.currentValue
                          ? `${participant.currentValue} ${isWeightLoss ? "kg" : "cm"}`
                          : "No data"}
                      </p>
                      {participant.measurements.length > 0 && (
                        <div className="w-20">
                          <Progress
                            value={Math.min(100, Math.abs(participant.percentageChange) * 10)}
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {rankedParticipants.length >= 3 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {rankedParticipants.slice(0, 3).map((participant) => {
                const rank = participant.rank
                const bgColor =
                  rank === 1
                    ? "bg-yellow-50 border-yellow-200"
                    : rank === 2
                      ? "bg-gray-50 border-gray-200"
                      : "bg-amber-50 border-amber-200"

                return (
                  <div key={participant.userId} className={`text-center p-4 rounded-lg border ${bgColor}`}>
                    <div className="mb-3">{getRankIcon(rank)}</div>
                    <Avatar className="h-12 w-12 mx-auto mb-2">
                      <AvatarImage src={participant.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        {participant.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-gray-900 mb-1">{participant.displayName}</p>
                    <p className="text-sm text-emerald-600 font-semibold mb-1">
                      -{participant.percentageChange.toFixed(1)}%
                    </p>
                    <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                      <span>{participant.score.toFixed(0)} pts</span>
                      <span>•</span>
                      <span>{participant.measurements.length} logs</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
