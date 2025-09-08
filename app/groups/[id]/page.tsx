import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GroupHeader } from "@/components/groups/group-header"
import { CompetitionsSection } from "@/components/groups/competitions-section"
import { MembersSection } from "@/components/groups/members-section"

interface GroupPageProps {
  params: { id: string }
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { id } = params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch group details with user's membership
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select(`
      *,
      group_members!inner(role)
    `)
    .eq("id", id)
    .eq("group_members.user_id", user.id)
    .single()

  if (groupError || !group) {
    redirect("/dashboard")
  }

  // Fetch all group members
  const { data: members } = await supabase
    .from("group_members")
    .select(`
      *,
      profiles(display_name, avatar_url)
    `)
    .eq("group_id", id)

  // Fetch group competitions
  const { data: competitions } = await supabase
    .from("competitions")
    .select(`
      *,
      competition_participants(count)
    `)
    .eq("group_id", id)
    .order("created_at", { ascending: false })

  const userRole = group.group_members[0]?.role

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <GroupHeader group={group} userRole={userRole} memberCount={members?.length || 0} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <CompetitionsSection competitions={competitions || []} groupId={id} userRole={userRole} />

        <MembersSection members={members || []} groupId={id} userRole={userRole} />
      </main>
    </div>
  )
}
