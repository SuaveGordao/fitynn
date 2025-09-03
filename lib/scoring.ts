// Advanced scoring algorithms for Fitynn competitions

export interface MeasurementData {
  initial: number
  current: number
  recordedAt: string
}

export interface ParticipantScore {
  userId: string
  displayName: string
  avatarUrl?: string
  initialValue: number
  currentValue: number
  absoluteChange: number
  percentageChange: number
  score: number
  rank: number
  trend: "melhorando" | "piorando" | "estavel"
  consistency: number
  measurements: MeasurementData[]
}

export class CompetitionScoring {
  private competitionType: "perda_peso" | "medicao"
  private measurementType?: string

  constructor(competitionType: "perda_peso" | "medicao", measurementType?: string) {
    this.competitionType = competitionType
    this.measurementType = measurementType
  }

  // Calculate comprehensive score for a participant
  calculateParticipantScore(
    initialValue: number,
    measurements: MeasurementData[],
  ): Omit<ParticipantScore, "userId" | "displayName" | "avatarUrl" | "rank"> {
    if (!measurements.length) {
      return {
        initialValue,
        currentValue: initialValue,
        absoluteChange: 0,
        percentageChange: 0,
        score: 0,
        trend: "estavel",
        consistency: 0,
        measurements: [],
      }
    }

    const latestMeasurement = measurements[measurements.length - 1]
    const currentValue = latestMeasurement.current
    const absoluteChange = initialValue - currentValue
    const percentageChange = (absoluteChange / initialValue) * 100

    // Base score from percentage improvement
    let score = Math.max(0, percentageChange * 10)

    // Consistency bonus (regular measurements)
    const consistency = this.calculateConsistency(measurements)
    score += consistency * 5

    // Trend analysis
    const trend = this.analyzeTrend(measurements)
    if (trend === "melhorando") {
      score += 10
    } else if (trend === "piorando") {
      score -= 5
    }

    // Measurement type specific bonuses
    if (this.competitionType === "medicao") {
      score = this.applyMeasurementTypeBonus(score, percentageChange)
    }

    return {
      initialValue,
      currentValue,
      absoluteChange,
      percentageChange,
      score: Math.max(0, score),
      trend,
      consistency,
      measurements,
    }
  }

  // Calculate consistency score based on measurement frequency
  private calculateConsistency(measurements: MeasurementData[]): number {
    if (measurements.length < 2) return 0

    const dates = measurements.map((m) => new Date(m.recordedAt).getTime())
    const intervals = []

    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i] - dates[i - 1])
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const variance =
      intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
    const standardDeviation = Math.sqrt(variance)

    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 1 - standardDeviation / avgInterval)
    return Math.min(1, consistencyScore)
  }

  // Analyze improvement trend
  private analyzeTrend(measurements: MeasurementData[]): "melhorando" | "piorando" | "estavel" {
    if (measurements.length < 3) return "estavel"

    const recent = measurements.slice(-3)
    const values = recent.map((m) => m.current)

    let improvingCount = 0
    let decliningCount = 0

    for (let i = 1; i < values.length; i++) {
      if (values[i] < values[i - 1]) improvingCount++
      else if (values[i] > values[i - 1]) decliningCount++
    }

    if (improvingCount > decliningCount) return "melhorando"
    if (decliningCount > improvingCount) return "piorando"
    return "estavel"
  }

  // Apply measurement type specific scoring bonuses
  private applyMeasurementTypeBonus(baseScore: number, percentageChange: number): number {
    const bonusMultipliers: Record<string, number> = {
      cintura: 1.2, // Redução da cintura é altamente valorizada
      peito: 1.0, // Pontuação padrão
      bracos: 0.9, // Ligeiramente menor pois é mais fácil de reduzir
      pernas: 1.1, // Bom indicador de fitness geral
      quadris: 1.15, // Importante para métricas de saúde
    }

    const multiplier = bonusMultipliers[this.measurementType || "peito"] || 1.0
    return baseScore * multiplier
  }

  // Rank participants based on their scores
  rankParticipants(participants: Omit<ParticipantScore, "rank">[]): ParticipantScore[] {
    const sorted = participants
      .sort((a, b) => b.score - a.score)
      .map((participant, index) => ({
        ...participant,
        rank: index + 1,
      }))

    return sorted
  }

  // Calculate competition statistics
  calculateCompetitionStats(participants: ParticipantScore[]) {
    if (!participants.length) {
      return {
        totalParticipants: 0,
        averageImprovement: 0,
        topImprovement: 0,
        activeParticipants: 0,
        consistencyRate: 0,
      }
    }

    const activeParticipants = participants.filter((p) => p.measurements.length > 0)
    const improvements = activeParticipants.map((p) => p.percentageChange).filter((p) => p > 0)

    return {
      totalParticipants: participants.length,
      averageImprovement: improvements.length
        ? improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length
        : 0,
      topImprovement: Math.max(...improvements, 0),
      activeParticipants: activeParticipants.length,
      consistencyRate: activeParticipants.length
        ? activeParticipants.reduce((sum, p) => sum + p.consistency, 0) / activeParticipants.length
        : 0,
    }
  }
}
