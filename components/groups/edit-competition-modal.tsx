"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface EditCompetitionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  competition: {
    id: string
    type: "weight_loss" | "measurement"
    measurement_type: string | null
  }
}

export function EditCompetitionModal({ open, onOpenChange, competition }: EditCompetitionModalProps) {
  const [type, setType] = useState<"weight_loss" | "measurement">(competition.type)
  const [measurementType, setMeasurementType] = useState<string>(competition.measurement_type ?? "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()
    try {
      const payload: Record<string, unknown> = { type }
      payload["measurement_type"] = type === "measurement" ? measurementType : null

      const { error } = await supabase.from("competitions").update(payload).eq("id", competition.id)
      if (error) throw error
      onOpenChange(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar alterações")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Competição</DialogTitle>
          <DialogDescription>Altere o tipo e a medida, se aplicável.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Competição</Label>
            <Select value={type} onValueChange={(v: "weight_loss" | "measurement") => setType(v)}>
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
              <Label>Tipo de Medida</Label>
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

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading || (type === "measurement" && !measurementType)} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


