import { Conversation } from '../types/conversation'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ConversationListProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  selectedConversation: Conversation | null
}

export function ConversationList({
  conversations,
  onSelectConversation,
  selectedConversation,
}: ConversationListProps) {
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2">
        {conversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant={selectedConversation?.id === conversation.id ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{conversation.assistant.name}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(conversation.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

