import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface SettingsPageProps {
  params: Promise<{ id: string }>
}

export default async function GroupSettingsPage({ params }: SettingsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) redirect("/auth/login")

  const { data: group, error } = await supabase
    .from("groups")
    .select("* , group_members!inner(role)")
    .eq("id", id)
    .eq("group_members.user_id", user.id)
    .single()

  if (error || !group) redirect(`/groups/${id}`)

  const role = group.group_members?.[0]?.role
  if (role !== "admin") redirect(`/groups/${id}`)

  async function updateGroup(formData: FormData) {
    "use server"
    const name = String(formData.get("name") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const supabase = await createClient()
    await supabase.from("groups").update({ name, description }).eq("id", id)
    redirect(`/groups/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Configurações do Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateGroup} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input name="name" defaultValue={group.name} required />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea name="description" defaultValue={group.description || ""} rows={4} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => redirect(`/groups/${id}`)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


