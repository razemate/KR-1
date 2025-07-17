import { useState } from "react"
import { Eye, EyeOff, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import useLocalStorage from "../hooks/use-local-storage"
import { useToast } from "../hooks/use-toast"
import { LLMProvider } from "../lib/types"

const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4, GPT-3.5 Turbo",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    description: "Claude 3 Opus, Sonnet, Haiku",
    keyUrl: "https://console.anthropic.com/",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Gemini Pro, Gemini Ultra",
    keyUrl: "https://makersuite.google.com/app/apikey",
  },
  {
    id: "groq",
    name: "Groq",
    description: "Llama 2, Mixtral",
    keyUrl: "https://console.groq.com/keys",
  },
  {
    id: "qwen",
    name: "Qwen",
    description: "Qwen models",
    keyUrl: "https://dashscope.aliyun.com/",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek models",
    keyUrl: "https://platform.deepseek.com/",
  },
]

export function LLMSettings() {
  const [apiKeys, setApiKeys] = useLocalStorage<Record<string, string>>("llm-api-keys", {})
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleSaveKey = async (providerId: string, key: string) => {
    try {
      const newKeys = { ...apiKeys, [providerId]: key }
      setApiKeys(newKeys)
      
      toast({
        title: "API Key Saved",
        description: `${LLM_PROVIDERS.find(p => p.id === providerId)?.name} API key saved successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleValidateKey = async (providerId: string, key: string) => {
    if (!key.trim()) {
      toast({
        title: "No API Key",
        description: "Please enter an API key before validating.",
        variant: "destructive",
      })
      return
    }

    try {
      // Validate the key with the backend
      const response = await fetch('/api/llm/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: providerId,
          apiKey: key,
        }),
      })
      
      if (response.ok) {
        toast({
          title: "API Key Valid",
          description: `${LLM_PROVIDERS.find(p => p.id === providerId)?.name} API key is valid and working.`,
        })
      } else {
        toast({
          title: "Invalid API Key",
          description: "The API key appears to be invalid. Please check and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate API key. Please check your connection and try again.",
        variant: "destructive",
      })
    }
  }

  const toggleKeyVisibility = (providerId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Language Model Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your API keys for different language model providers.
        </p>
      </div>
      
      <div className="grid gap-4">
        {LLM_PROVIDERS.map((provider) => {
          const currentKey = apiKeys[provider.id] || ""
          const isVisible = visibleKeys[provider.id]
          
          return (
            <Card key={provider.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(provider.keyUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Get Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-key`}>API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`${provider.id}-key`}
                        type={isVisible ? "text" : "password"}
                        value={currentKey}
                        onChange={(e) => {
                          const newKeys = { ...apiKeys, [provider.id]: e.target.value }
                          setApiKeys(newKeys)
                        }}
                        placeholder="Enter your API key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleKeyVisibility(provider.id)}
                      >
                        {isVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleSaveKey(provider.id, currentKey)}
                      disabled={!currentKey.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleValidateKey(provider.id, currentKey)}
                      disabled={!currentKey.trim()}
                    >
                      Validate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}