import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { LLMSettings } from "./llm-settings"
import { AppConnections } from "./app-connections"

export function SettingsView() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your language models and app integrations
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden p-4">
        <Tabs defaultValue="llm" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="llm">Language Models</TabsTrigger>
            <TabsTrigger value="connections">App Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="llm" className="mt-6 h-full overflow-auto">
            <LLMSettings />
          </TabsContent>
          
          <TabsContent value="connections" className="mt-6 h-full overflow-auto">
            <AppConnections />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}