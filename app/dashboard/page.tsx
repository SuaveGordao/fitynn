import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { GroupsGrid } from "@/components/dashboard/groups-grid"
import { InvitationsCard } from "@/components/dashboard/invitations-card"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's groups
  const { data: groups } = await supabase
    .from("groups")
    .select(`
      *,
      group_members!inner(role),
      competitions(count)
    `)
    .eq("group_members.user_id", user.id)

  // Fetch pending invitations
  const { data: invitations } = await supabase
    .from("group_invitations")
    .select(`
      *,
      groups(name, description)
    `)
    .eq("invited_user_id", user.id)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Invitations Section */}
        {invitations && invitations.length > 0 && <InvitationsCard invitations={invitations} />}

        {/* Groups Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Seus Grupos</h2>
          </div>
          <GroupsGrid groups={groups || []} />
        </div>
      </main>
    </div>
  )
}
