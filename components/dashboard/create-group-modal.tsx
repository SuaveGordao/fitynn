"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CreateGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Add creator as admin member
      const { error: memberError } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: user.id,
        role: "admin",
      })

      if (memberError) throw memberError

      // Reset form and close modal
      setName("")
      setDescription("")
      onOpenChange(false)
      router.refresh()
      router.push(`/groups/${group.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create group")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>Start a new fitness competition group and invite your friends to join.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="e.g., Summer Fitness Challenge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your group's goals and rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
