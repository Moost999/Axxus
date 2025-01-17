'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConversationList } from '../conversations/conversation-list'
import { ConversationView } from '../conversations/conversation-view'
import { Conversation } from '../types/conversation'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      setConversations(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gradient font-orbitron mb-8">Conversations</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
              />
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent>
            {selectedConversation ? (
              <ConversationView conversation={selectedConversation} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Select a conversation to view messages</p>
                <Button onClick={() => router.push('/create-assistant')}>
                  Start a New Conversation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

