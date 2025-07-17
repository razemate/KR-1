import { useState } from "react"
import { Eye, EyeOff, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import useLocalStorage from "../hooks/use-local-storage"
import { useToast } from "../hooks/use-toast"

interface Integration {
  id: string
  name: string
  description: string
  keyUrl: string
  isDefault?: boolean
  status?: "connected" | "disconnected"
}

const INTEGRATIONS: Integration[] = [
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Website analytics and reporting",
    keyUrl: "https://console.developers.google.com/",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Advertising campaign management",
    keyUrl: "https://console.developers.google.com/",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Social media marketing",
    keyUrl: "https://developers.facebook.com/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form video marketing",
    keyUrl: "https://developers.tiktok.com/",
  },
  {
    id: "x",
    name: "X (Twitter)",
    description: "Social media engagement",
    keyUrl: "https://developer.twitter.com/",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Video content management",
    keyUrl: "https://console.developers.google.com/",
  },
]

const DEFAULT_CONNECTIONS: Integration[] = [
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "E-commerce platform integration",
    keyUrl: "",
    isDefault: true,
    status: "connected",
  },
  {
    id: "merchantguy",
    name: "MerchantGuy",
    description: "Payment processing integration",
    keyUrl: "",
    isDefault: true,
    status: "connected",
  },
]

export function AppConnections() {
  const [apiKeys, setApiKeys] = useLocalStorage<Record<string, string>>("integration-api-keys", {})
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleSaveKey = async (integrationId: string, key: string) => {
    try {
      const newKeys = { ...apiKeys, [integrationId]: key }
      setApiKeys(newKeys)
      
      toast({
        title: "API Key Saved",
        description: `${INTEGRATIONS.find(i => i.id === integrationId)?.name} API key saved successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleValidateKey = async (integrationId: string, key: string) => {
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
      const response = await fetch('/api/integrations/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integration: integrationId,
          apiKey: key,
        }),
      })
      
      if (response.ok) {
        toast({
          title: "API Key Valid",
          description: `${INTEGRATIONS.find(i => i.id === integrationId)?.name} API key is valid and working.`,
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

  const toggleKeyVisibility = (integrationId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">App Connections</h3>
        <p className="text-sm text-muted-foreground">
          Manage your integrations with various platforms and services.
        </p>
      </div>
      
      {/* Default Connections */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Default Connections</h4>
        <div className="grid gap-4">
          {DEFAULT_CONNECTIONS.map((connection) => (
            <Card key={connection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {connection.name}
                      {connection.status === "connected" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{connection.description}</CardDescription>
                  </div>
                  <Badge variant={connection.status === "connected" ? "default" : "secondary"}>
                    {connection.status === "connected" ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Custom Integrations */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Custom Integrations</h4>
        <div className="grid gap-4">
          {INTEGRATIONS.map((integration) => {
            const currentKey = apiKeys[integration.id] || ""
            const isVisible = visibleKeys[integration.id]
            
            return (
              <Card key={integration.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(integration.keyUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Get Key
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${integration.id}-key`}>API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`${integration.id}-key`}
                          type={isVisible ? "text" : "password"}
                          value={currentKey}
                          onChange={(e) => {
                            const newKeys = { ...apiKeys, [integration.id]: e.target.value }
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
                          onClick={() => toggleKeyVisibility(integration.id)}
                        >
                          {isVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleSaveKey(integration.id, currentKey)}
                        disabled={!currentKey.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleValidateKey(integration.id, currentKey)}
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
    </div>
  )
}