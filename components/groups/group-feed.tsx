"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Heart, Send, Trophy } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface GroupFeedProps {
  groupId: string
  posts: any[]
  userId: string
}

export function GroupFeed({ groupId, posts, userId }: GroupFeedProps) {
  const router = useRouter()
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    setIsPosting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("posts").insert({
        group_id: groupId,
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

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    const supabase = createClient()

    try {
      if (isLiked) {
        // Unlike post
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId)
      } else {
        // Like post
        await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: userId,
        })
      }
      router.refresh()
    } catch (error) {
      console.error("Error toggling like:", error)
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
            <span>Share with Your Group</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea
              placeholder="Share your thoughts, progress, or motivate your group..."
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
                <p className="text-gray-600">Be the first to share something with your group!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const isLiked = post.post_likes?.some((like: any) => like.user_id === userId)
            const likesCount = post.post_likes?.length || 0

            return (
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
                          {post.competition_id && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              <Trophy className="w-3 h-3 mr-1" />
                              Competition Update
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
                      </div>

                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

                      {post.photo_url && (
                        <div className="mt-3">
                          <img
                            src={post.photo_url || "/placeholder.svg"}
                            alt="Post photo"
                            className="rounded-lg max-w-sm max-h-64 object-cover"
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id, isLiked)}
                          className={`flex items-center space-x-1 ${
                            isLiked ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-red-600"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                          <span>{likesCount}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
                          <MessageSquare className="w-4 h-4" />
                          <span>Comment</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
