"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CreateCompetitionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
}

export function CreateCompetitionModal({ open, onOpenChange, groupId }: CreateCompetitionModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"weight_loss" | "measurement">("weight_loss")
  const [measurementType, setMeasurementType] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
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

      // Validate dates
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end <= start) {
        throw new Error("End date must be after start date")
      }

      // Create the competition
      const { data: competition, error: competitionError } = await supabase
        .from("competitions")
        .insert({
          group_id: groupId,
          name: name.trim(),
          description: description.trim() || null,
          type,
          measurement_type: type === "measurement" ? measurementType : null,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          created_by: user.id,
        })
        .select()
        .single()

      if (competitionError) throw competitionError

      // Reset form and close modal
      setName("")
      setDescription("")
      setType("weight_loss")
      setMeasurementType("")
      setStartDate("")
      setEndDate("")
      onOpenChange(false)
      router.refresh()
      router.push(`/competitions/${competition.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create competition")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Nova Competição</DialogTitle>
          <DialogDescription>Configure uma nova competição fitness para os membros do seu grupo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Competição</Label>
            <Input
              id="name"
              placeholder="ex: Desafio de Perda de Peso de 30 Dias"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva os objetivos e regras da competição..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Competição</Label>
              <Select value={type} onValueChange={(value: "weight_loss" | "measurement") => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Perda de Peso</SelectItem>
                  <SelectItem value="measurement">Medida Corporal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "measurement" && (
              <div className="space-y-2">
                <Label htmlFor="measurementType">Tipo de Medida</Label>
                <Select value={measurementType} onValueChange={setMeasurementType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a medida" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waist">Cintura</SelectItem>
                    <SelectItem value="chest">Peito</SelectItem>
                    <SelectItem value="arms">Braços</SelectItem>
                    <SelectItem value="legs">Pernas</SelectItem>
                    <SelectItem value="hips">Quadris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || !name.trim() || !startDate || !endDate || (type === "measurement" && !measurementType)
              }
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "Criando..." : "Criar Competição"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
