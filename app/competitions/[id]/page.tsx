import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompetitionHeader } from "@/components/competitions/competition-header"
import { CompetitionTabs } from "@/components/competitions/competition-tabs"

interface CompetitionPageProps {
  params: Promise<{ id: string }>
}

export default async function CompetitionPage({ params }: CompetitionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch competition details
  const { data: competition, error: competitionError } = await supabase
    .from("competitions")
    .select(`
      *,
      groups(name, id),
      profiles!competitions_created_by_fkey(display_name),
      group_members!inner(role)
    `)
    .eq("id", id)
    .eq("group_members.user_id", user.id)
    .single()

  if (competitionError || !competition) {
    redirect("/dashboard")
  }

  // Check if user is participating
  const { data: participation } = await supabase
    .from("competition_participants")
    .select("*")
    .eq("competition_id", id)
    .eq("user_id", user.id)
    .single()

  // Fetch participants with their latest measurements
  const { data: participants } = await supabase
    .from("competition_participants")
    .select(`
      *,
      profiles(display_name, avatar_url),
      measurements(weight, measurement_value, recorded_at)
    `)
    .eq("competition_id", id)

  // Fetch posts for this competition
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles(display_name, avatar_url),
      measurements(weight, measurement_value, photo_url)
    `)
    .eq("group_id", competition.groups.id)
    .order("created_at", { ascending: false })

  const userRole = competition.group_members[0]?.role

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <CompetitionHeader
        competition={competition}
        userRole={userRole}
        isParticipating={!!participation}
        participantCount={participants?.length || 0}
      />

      <main className="container mx-auto px-4 py-8">
        <CompetitionTabs
          competition={competition}
          participants={participants || []}
          posts={posts || []}
          userParticipation={participation}
          userId={user.id}
        />
      </main>
    </div>
  )
}
