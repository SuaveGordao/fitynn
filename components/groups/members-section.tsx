"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, MoreVertical, Crown, UserMinus, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Member {
  id: string
  user_id: string
  role: "admin" | "member"
  joined_at: string
  profiles: {
    display_name: string
    avatar_url: string | null
  }
}

interface MembersSectionProps {
  members: Member[]
  groupId: string
  userRole: string
}

export function MembersSection({ members, groupId, userRole }: MembersSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const isAdmin = userRole === "admin"

  const handleRoleChange = async (memberId: string, newRole: "admin" | "member") => {
    setLoading(memberId)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("group_members").update({ role: newRole }).eq("id", memberId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error updating member role:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    setLoading(memberId)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("group_members").delete().eq("id", memberId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error removing member:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Members</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {members.length} members
        </Badge>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Group Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profiles.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600">
                      {member.profiles.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{member.profiles.display_name}</p>
                      {member.role === "admin" && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {isAdmin && member.role !== "admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loading === member.id}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, "admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
