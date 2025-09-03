"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingDown, TrendingUp, Target, Calendar, Zap, Award } from "lucide-react"

interface ProgressAnalyticsProps {
  userMeasurements: Array<{
    weight?: number
    measurement_value?: number
    recorded_at: string
  }>
  competition: {
    type: "weight_loss" | "measurement"
    measurement_type: string | null
    start_date: string
    end_date: string
  }
  initialValue: number
}

export function ProgressAnalytics({ userMeasurements, competition, initialValue }: ProgressAnalyticsProps) {
  const isWeightLoss = competition.type === "weight_loss"

  // Prepare chart data
  const chartData = userMeasurements.map((measurement, index) => ({
    day: index + 1,
    value: isWeightLoss ? measurement.weight : measurement.measurement_value,
    date: new Date(measurement.recorded_at).toLocaleDateString(),
    change: initialValue - (isWeightLoss ? measurement.weight || 0 : measurement.measurement_value || 0),
  }))

  // Calculate analytics
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : initialValue
  const totalChange = initialValue - (latestValue || initialValue)
  const percentageChange = initialValue ? (totalChange / initialValue) * 100 : 0

  // Calculate trend
  const recentMeasurements = chartData.slice(-3)
  let trend = "stable"
  if (recentMeasurements.length >= 2) {
    const recentChange = recentMeasurements[recentMeasurements.length - 1].value - recentMeasurements[0].value
    trend = recentChange < 0 ? "improving" : recentChange > 0 ? "declining" : "stable"
  }

  // Calculate consistency score
  const expectedMeasurements = Math.floor(
    (new Date().getTime() - new Date(competition.start_date).getTime()) / (1000 * 60 * 60 * 24 * 3),
  ) // Every 3 days
  const consistencyScore = expectedMeasurements > 0 ? Math.min(100, (chartData.length / expectedMeasurements) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {totalChange > 0 ? "-" : "+"}
              {Math.abs(totalChange).toFixed(1)}
            </div>
            <p className="text-sm text-gray-500">{isWeightLoss ? "kg" : "cm"} change</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {percentageChange > 0 ? "-" : "+"}
              {Math.abs(percentageChange).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500">Percentage</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              {trend === "improving" ? (
                <TrendingDown className="w-6 h-6 text-emerald-600" />
              ) : trend === "declining" ? (
                <TrendingUp className="w-6 h-6 text-red-600" />
              ) : (
                <Target className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 capitalize">{trend}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{consistencyScore.toFixed(0)}%</div>
            <p className="text-sm text-gray-500">Consistency</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5" />
              <span>Progress Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => `Day ${value}`}
                    formatter={(value: any, name) => [
                      `${value} ${isWeightLoss ? "kg" : "cm"}`,
                      isWeightLoss ? "Weight" : "Measurement",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Progress */}
      {chartData.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="w-5 h-5" />
              <span>Weekly Changes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.filter((_, index) => index % 7 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [
                      `${value > 0 ? "-" : "+"}${Math.abs(value).toFixed(1)} ${isWeightLoss ? "kg" : "cm"}`,
                      "Change",
                    ]}
                  />
                  <Bar dataKey="change" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Badges */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {percentageChange >= 5 && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-yellow-800">5% Milestone</p>
                <p className="text-sm text-yellow-600">Great progress!</p>
              </div>
            )}

            {consistencyScore >= 80 && (
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Consistency Star</p>
                <p className="text-sm text-blue-600">Regular tracker!</p>
              </div>
            )}

            {chartData.length >= 10 && (
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <Calendar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-medium text-emerald-800">Dedicated Logger</p>
                <p className="text-sm text-emerald-600">10+ measurements!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
