"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Settings, UserPlus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { InviteMemberModal } from "./invite-member-modal"

interface GroupHeaderProps {
  group: {
    id: string
    name: string
    description: string | null
    created_at: string
    profiles: {
      display_name: string
    }
  }
  userRole: string
  memberCount: number
}

export function GroupHeader({ group, userRole, memberCount }: GroupHeaderProps) {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const isAdmin = userRole === "admin"

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                  {isAdmin && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      Admin
                    </Badge>
                  )}
                </div>

                {group.description && <p className="text-gray-600 mb-2">{group.description}</p>}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{memberCount} membros</span>
                  </div>
                  <span>•</span>
                  <span>Criado por {group.profiles.display_name}</span>
                  <span>•</span>
                  <span>{new Date(group.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowInviteModal(true)}
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Convidar Membros
              </Button>

              {isAdmin && (
                <Link href={`/groups/${group.id}/settings`}>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        groupId={group.id}
        groupName={group.name}
      />
    </>
  )
}
