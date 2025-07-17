import { Download } from "lucide-react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Badge } from "./ui/badge"
import { cn, formatDate } from "../lib/utils"
import { ChatMessage as ChatMessageType, ExportFormat } from "../lib/types"

interface ChatMessageProps {
  message: ChatMessageType
  onExport?: (messageId: string, format: ExportFormat) => void
}

export function ChatMessage({ message, onExport }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(message.id, format)
    }
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-4",
        isUser && "flex-row-reverse",
        isSystem && "justify-center"
      )}
    >
      {!isSystem && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {isUser ? "U" : "AI"}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex-1 space-y-2", isUser && "text-right", isSystem && "text-center")}>
        <div className="flex items-center gap-2">
          {!isSystem && (
            <span className="text-sm font-medium">
              {isUser ? "You" : "Assistant"}
            </span>
          )}
          {message.timestamp && (
            <span className="text-xs text-muted-foreground">
              {formatDate(message.timestamp)}
            </span>
          )}
          {message.model && (
            <Badge variant="outline" className="text-xs">
              {message.model}
            </Badge>
          )}
        </div>
        
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            isUser
              ? "bg-primary text-primary-foreground ml-12"
              : isSystem
              ? "bg-muted text-muted-foreground inline-block"
              : "bg-muted mr-12"
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        
        {!isUser && !isSystem && onExport && (
          <div className="flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("txt")}>
                  Export as TXT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                  Export as XLSX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("docx")}>
                  Export as DOCX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}