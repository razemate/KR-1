import { MessageCircle, Settings } from "lucide-react"
import { cn } from "../lib/utils"
import { Logo } from "./icons"

interface MainNavProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function MainNav({ currentView, onViewChange }: MainNavProps) {
  const navItems = [
    {
      id: "chat",
      label: "Chat",
      icon: MessageCircle,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <Logo className="h-6 w-6 mr-2" />
        <span className="font-semibold">CS_APP-KR-1</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                currentView === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}