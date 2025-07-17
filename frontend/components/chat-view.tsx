import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { ScrollArea } from "./ui/scroll-area"
import { useToast } from "../hooks/use-toast"
import { ChatMessage as ChatMessageType, ExportFormat } from "../lib/types"
import { generateId, downloadFile } from "../lib/utils"

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleUserQuery = async (message: string) => {
    const userMessage: ChatMessageType = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: 'default',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const aiMessage: ChatMessageType = {
        id: generateId(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        model: data.model,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: ChatMessageType = {
        id: generateId(),
        role: "system",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (messageId: string, format: ExportFormat) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.content,
          format,
          filename: `chat-export-${messageId}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const filename = `chat-export-${messageId}.${format}`
      
      downloadFile(url, filename)
      
      toast({
        title: "Export Successful",
        description: `Message exported as ${format.toUpperCase()}\`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export message. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions and get AI-powered responses
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="space-y-4 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Welcome to CS_APP-KR-1</h3>
                  <p className="text-muted-foreground">
                    Start a conversation by typing a message below.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onExport={handleExport}
                />
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-3 p-4">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <ChatInput onSendMessage={handleUserQuery} disabled={isLoading} />
    </div>
  )
}