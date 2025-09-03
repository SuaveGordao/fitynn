"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Scale, Target, TrendingDown, Calendar } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CompetitionDashboardProps {
  competition: {
    id: string
    type: "weight_loss" | "measurement"
    measurement_type: string | null
    start_date: string
    end_date: string
  }
  participants: any[]
  userParticipation: any
  userId: string
}

export function CompetitionDashboard({
  competition,
  participants,
  userParticipation,
  userId,
}: CompetitionDashboardProps) {
  const router = useRouter()
  const [isLogging, setIsLogging] = useState(false)
  const [weight, setWeight] = useState("")
  const [measurementValue, setMeasurementValue] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const isWeightLoss = competition.type === "weight_loss"
  const now = new Date()
  const startDate = new Date(competition.start_date)
  const endDate = new Date(competition.end_date)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysPassed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const progress = Math.min(100, (daysPassed / totalDays) * 100)

  const handleLogMeasurement = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLogging(true)

    const supabase = createClient()

    try {
      let photoUrl = null

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("measurements")
          .upload(fileName, photoFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("measurements").getPublicUrl(fileName)

        photoUrl = publicUrl
      }

      // Insert measurement
      const { error } = await supabase.from("measurements").insert({
        competition_id: competition.id,
        user_id: userId,
        weight: isWeightLoss ? Number.parseFloat(weight) : null,
        measurement_value: !isWeightLoss ? Number.parseFloat(measurementValue) : null,
        photo_url: photoUrl,
      })

      if (error) throw error

      // Reset form
      setWeight("")
      setMeasurementValue("")
      setPhotoFile(null)
      router.refresh()
    } catch (error) {
      console.error("Error logging measurement:", error)
    } finally {
      setIsLogging(false)
    }
  }

  const getCompetitionStatus = () => {
    if (now < startDate) return "upcoming"
    if (now > endDate) return "completed"
    return "active"
  }

  const status = getCompetitionStatus()

  return (
    <div className="space-y-6">
      {/* Competition Progress */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Competition Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>
              Day {Math.min(daysPassed, totalDays)} of {totalDays}
            </span>
            <Badge
              variant="secondary"
              className={
                status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "upcoming"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
              }
            >
              {status === "active" ? "Active" : status === "upcoming" ? "Upcoming" : "Completed"}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{startDate.toLocaleDateString()}</span>
            <span>{endDate.toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Log Measurement */}
        {userParticipation && status === "active" && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {isWeightLoss ? <Scale className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                <span>Log {isWeightLoss ? "Weight" : "Measurement"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogMeasurement} className="space-y-4">
                {isWeightLoss ? (
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 70.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="measurement">{competition.measurement_type} (cm)</Label>
                    <Input
                      id="measurement"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 85.5"
                      value={measurementValue}
                      onChange={(e) => setMeasurementValue(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo (Optional)</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLogging || (!weight && !measurementValue)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isLogging ? "Logging..." : "Log Measurement"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Your Progress */}
        {userParticipation && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {isWeightLoss
                    ? userParticipation.initial_weight
                      ? `${userParticipation.initial_weight} kg`
                      : "No initial weight"
                    : userParticipation.initial_measurement
                      ? `${userParticipation.initial_measurement} cm`
                      : "No initial measurement"}
                </div>
                <p className="text-sm text-gray-500">Starting {isWeightLoss ? "weight" : "measurement"}</p>
              </div>

              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-emerald-600">
                  <TrendingDown className="w-4 h-4" />
                  <span>Goal: Reduce</span>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500">
                Joined {new Date(userParticipation.joined_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competition Stats */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Competition Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                <p className="text-sm text-gray-500">Participants</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalDays}</div>
                <p className="text-sm text-gray-500">Days Total</p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-600">
                {isWeightLoss ? "Weight Loss" : `${competition.measurement_type} Reduction`}
              </div>
              <p className="text-sm text-gray-500">Competition Type</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
