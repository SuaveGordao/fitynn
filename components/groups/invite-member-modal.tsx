"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
}

export function InviteMemberModal({ open, onOpenChange, groupId, groupName }: InviteMemberModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single()

      if (!existingMember) {
        throw new Error("You don't have permission to invite members")
      }

      // Check if invitation already exists
      const { data: existingInvite } = await supabase
        .from("group_invitations")
        .select("id")
        .eq("group_id", groupId)
        .eq("invited_email", email.toLowerCase())
        .eq("status", "pending")
        .single()

      if (existingInvite) {
        throw new Error("An invitation has already been sent to this email")
      }

      // Create invitation
      const { error: inviteError } = await supabase.from("group_invitations").insert({
        group_id: groupId,
        invited_by: user.id,
        invited_email: email.toLowerCase(),
      })

      if (inviteError) throw inviteError

      setSuccess(true)
      setEmail("")
      setTimeout(() => {
        setSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send invitation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Membro</DialogTitle>
          <DialogDescription>
            Envie um convite para participar de "{groupName}" para alguém via e-mail.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Convite Enviado!</h3>
            <p className="text-gray-600">O convite foi enviado com sucesso.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Endereço de E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="amigo@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Enviando..." : "Enviar Convite"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
