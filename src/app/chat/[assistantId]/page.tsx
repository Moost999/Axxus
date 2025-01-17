'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, ArrowLeft, Trash2, Upload } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function ChatPage() {
  const params = useParams()
  const assistantId = params.assistantId as string
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (assistantId) {
      fetchAssistantAndConversation(assistantId)
    }
  }, [assistantId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchAssistantAndConversation = async (assistantId: string) => {
    try {
      setIsLoading(true)
      const assistantResponse = await fetch(`/api/assistant/${assistantId}`)
      if (!assistantResponse.ok) {
        const errorData = await assistantResponse.json()
        throw new Error(errorData.error || 'Failed to fetch assistant')
      }
      const assistantData = await assistantResponse.json()

      // Create or fetch conversation
      const conversationResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId }),
      })

      if (!conversationResponse.ok) {
        const errorData = await conversationResponse.json()
        throw new Error(errorData.error || 'Failed to create conversation')
      }

      const conversationData = await conversationResponse.json()
      setConversationId(conversationData.conversationId)
      
      if (conversationData.messages) {
        setMessages(conversationData.messages.filter((msg: Message) => msg.role !== 'system'))
      }
    } catch (error: any) {
      console.error('Error loading assistant or conversation:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load chat. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !fileInputRef.current?.files?.length) || !conversationId) return

    setIsLoading(true)
    const currentInput = input.trim()
    setInput('')

    try {
      let response
      let userMessage: Message

      if (fileInputRef.current?.files?.length) {
        const formData = new FormData()
        formData.append('file', fileInputRef.current.files[0])
        formData.append('conversationId', conversationId)

        response = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        })
        userMessage = { role: 'user', content: `Uploaded file: ${fileInputRef.current.files[0].name}` }
      } else {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: currentInput,
            conversationId,
          }),
        })
        userMessage = { role: 'user', content: currentInput }
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      
      if (data.reply) {
        const assistantMessage: Message = { role: 'assistant', content: data.reply }
        setMessages(prev => [...prev, userMessage, assistantMessage])
      }

      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error: any) {
      console.error('Error:', error)
      setInput(currentInput)
      toast({
        title: "Error",
        description: error.message || "Failed to send message or upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (!conversationId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/chat/${conversationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear chat')
      }

      setMessages([])
      toast({
        title: "Success",
        description: "Chat cleared successfully.",
      })
      
      if (assistantId) {
        fetchAssistantAndConversation(assistantId)
      }
    } catch (error: any) {
      console.error('Error clearing chat:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to clear chat. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => router.push('/assistants')}
          variant="outline"
          className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assistants
        </Button>
        <Button
          onClick={handleClearChat}
          variant="destructive"
          disabled={isLoading || !conversationId}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Clear Chat
        </Button>
      </div>

      <Card className="bg-gray-900 border-purple-500/30 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-2xl text-purple-400 font-orbitron">
            Chat with Assistant
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[600px] overflow-y-auto mb-4 space-y-6 p-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                } shadow-md`}
              >
                <ReactMarkdown
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-700 rounded px-1" {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow bg-gray-800 border-purple-500 text-white placeholder-gray-400"
              disabled={isLoading || !conversationId}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleSubmit}
              accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.svg,.pptx,.mp4,.mp3"
            />
            <Button
              type="button"
              onClick={handleFileUpload}
              disabled={isLoading || !conversationId}
              variant="outline"
              className="bg-purple-600 text-white hover:bg-purple-500"
            >
              <Upload className="mr-2 h-4 w-4" />
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !conversationId || (!input.trim() && !fileInputRef.current?.files?.length)}
              className="bg-purple-600 text-white hover:bg-purple-500"
            >
              {isLoading ? (
                <Loader2 className="mr-2 animate-spin h-4 w-4" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

