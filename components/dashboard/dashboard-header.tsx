"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trophy, Plus, Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CreateGroupModal } from "./create-group-modal"

interface DashboardHeaderProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      display_name?: string
      avatar_url?: string
    }
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User"
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-emerald-600" />
                <h1 className="text-2xl font-bold text-emerald-600">Fitynn</h1>
              </div>
              <div className="hidden sm:block">
                <p className="text-gray-600">Bem-vindo de volta, {displayName}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowCreateGroup(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Grupo
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{displayName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <CreateGroupModal open={showCreateGroup} onOpenChange={setShowCreateGroup} />
    </>
  )
}
