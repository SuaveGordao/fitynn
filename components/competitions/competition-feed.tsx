"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Camera, Scale, Target, Send } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CompetitionFeedProps {
  competition: {
    id: string
    type: "weight_loss" | "measurement"
    measurement_type: string | null
  }
  posts: any[]
  userId: string
}

export function CompetitionFeed({ competition, posts, userId }: CompetitionFeedProps) {
  const router = useRouter()
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    setIsPosting(true)
    const supabase = createClient()

    try {
      // Get group ID from competition
      const { data: competitionData } = await supabase
        .from("competitions")
        .select("group_id")
        .eq("id", competition.id)
        .single()

      if (!competitionData) throw new Error("Competition not found")

      const { error } = await supabase.from("posts").insert({
        group_id: competitionData.group_id,
        user_id: userId,
        content: newPost.trim(),
      })

      if (error) throw error

      setNewPost("")
      router.refresh()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsPosting(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Share Your Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea
              placeholder="Share your progress, motivation, or encourage others..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">{newPost.length}/500 characters</p>
              <Button
                type="submit"
                disabled={isPosting || !newPost.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-gray-200">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                <p className="text-gray-600">Be the first to share your progress and motivate others!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600">
                      {post.profiles?.display_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{post.profiles?.display_name || "Unknown User"}</p>
                        {post.measurements && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                            <Camera className="w-3 h-3 mr-1" />
                            Progress Update
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
                    </div>

                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

                    {/* Measurement Data */}
                    {post.measurements && (
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                        <div className="flex items-center space-x-4">
                          {competition.type === "weight_loss" ? (
                            <div className="flex items-center space-x-2">
                              <Scale className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-medium">Weight: {post.measurements.weight} kg</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-medium">
                                {competition.measurement_type}: {post.measurements.measurement_value} cm
                              </span>
                            </div>
                          )}
                        </div>

                        {post.measurements.photo_url && (
                          <div className="mt-3">
                            <img
                              src={post.measurements.photo_url || "/placeholder.svg"}
                              alt="Progress photo"
                              className="rounded-lg max-w-sm max-h-64 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Photo without measurement */}
                    {post.photo_url && !post.measurements && (
                      <div className="mt-3">
                        <img
                          src={post.photo_url || "/placeholder.svg"}
                          alt="Post photo"
                          className="rounded-lg max-w-sm max-h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
