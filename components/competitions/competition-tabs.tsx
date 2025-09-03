"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompetitionDashboard } from "./competition-dashboard"
import { CompetitionRanking } from "./competition-ranking"
import { CompetitionFeed } from "./competition-feed"

interface CompetitionTabsProps {
  competition: {
    id: string
    name: string
    type: "weight_loss" | "measurement"
    measurement_type: string | null
    start_date: string
    end_date: string
  }
  participants: any[]
  posts: any[]
  userParticipation: any
  userId: string
}

export function CompetitionTabs({ competition, participants, posts, userParticipation, userId }: CompetitionTabsProps) {
  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="ranking">Ranking</TabsTrigger>
        <TabsTrigger value="feed">Feed</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <CompetitionDashboard
          competition={competition}
          participants={participants}
          userParticipation={userParticipation}
          userId={userId}
        />
      </TabsContent>

      <TabsContent value="ranking">
        <CompetitionRanking competition={competition} participants={participants} />
      </TabsContent>

      <TabsContent value="feed">
        <CompetitionFeed competition={competition} posts={posts} userId={userId} />
      </TabsContent>
    </Tabs>
  )
}
