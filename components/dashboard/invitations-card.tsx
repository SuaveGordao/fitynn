"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Check, X, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Invitation {
  id: string
  group_id: string
  invited_email: string
  expires_at: string
  groups: {
    name: string
    description: string | null
  }
}

interface InvitationsCardProps {
  invitations: Invitation[]
}

export function InvitationsCard({ invitations }: InvitationsCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleInvitation = async (invitationId: string, action: "accept" | "decline") => {
    setLoading(invitationId)
    const supabase = createClient()

    try {
      if (action === "accept") {
        // Update invitation status
        const { error: inviteError } = await supabase
          .from("group_invitations")
          .update({ status: "accepted" })
          .eq("id", invitationId)

        if (inviteError) throw inviteError

        // Add user to group
        const invitation = invitations.find((inv) => inv.id === invitationId)
        if (invitation) {
          const { error: memberError } = await supabase.from("group_members").insert({
            group_id: invitation.group_id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            role: "member",
          })

          if (memberError) throw memberError
        }
      } else {
        // Decline invitation
        const { error } = await supabase.from("group_invitations").update({ status: "declined" }).eq("id", invitationId)

        if (error) throw error
      }

      router.refresh()
    } catch (error) {
      console.error("Error handling invitation:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <Mail className="w-5 h-5" />
          <span>Group Invitations</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {invitations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900">{invitation.groups.name}</h4>
                {invitation.groups.description && (
                  <p className="text-sm text-gray-600">{invitation.groups.description}</p>
                )}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Expires {new Date(invitation.expires_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleInvitation(invitation.id, "accept")}
                  disabled={loading === invitation.id}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInvitation(invitation.id, "decline")}
                  disabled={loading === invitation.id}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
