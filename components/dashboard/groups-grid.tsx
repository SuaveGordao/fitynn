"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Calendar, Settings } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

interface Group {
  id: string
  name: string
  description: string | null
  created_at: string
  group_members: { role: string }[]
  competitions: { count: number }[]
}

interface GroupsGridProps {
  groups: Group[]
}

export function GroupsGrid({ groups }: GroupsGridProps) {
  const { t } = useTranslation()

  if (groups.length === 0) {
    return (
      <Card className="text-center py-12 border-dashed border-2 border-gray-200">
        <CardContent className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("noGroupsYet")}</h3>
            <p className="text-gray-600 mb-4">{t("createFirstGroup")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => {
        const memberCount = group.group_members.length
        const competitionCount = group.competitions?.[0]?.count || 0
        const userRole = group.group_members[0]?.role
        const isAdmin = userRole === "admin"

        return (
          <Card key={group.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-gray-900">{group.name}</CardTitle>
                  {group.description && <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>}
                </div>
                {isAdmin && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    {t("admin")}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {memberCount} {t("members")}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>
                    {competitionCount} {t("competitions")}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link href={`/groups/${group.id}`} className="flex-1">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">{t("viewGroup")}</Button>
                </Link>
                {isAdmin && (
                  <Link href={`/groups/${group.id}/settings`}>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>

              <div className="text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {t("createdOn")} {new Date(group.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
