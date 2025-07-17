import useLocalStorage from "./use-local-storage";

export const useAppIntegrations = () => {
  const [wooCommerceKey, setWooCommerceKey] = useLocalStorage("wooCommerceKey", "");
  const [merchantGuyKey, setMerchantGuyKey] = useLocalStorage("merchantGuyKey", "");
  const [llmProvider, setLlmProvider] = useLocalStorage("llmProvider", "openai");
  const [llmModel, setLlmModel] = useLocalStorage("llmModel", "gpt-4o");
  const [llmApiKey, setLlmApiKey] = useLocalStorage("llmApiKey", "");

  // Free-tier supported models
  const supportedModels: Record<string, string[]> = {
    openai: ["gpt-3.5-turbo", "gpt-4", "gpt-4o"],
    anthropic: ["claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
    gemini: ["gemini-pro"],
    groq: ["llama3-70b", "mixtral-8x7b"],
    deepseek: ["deepseek-chat", "deepseek-coder"],
    qwen: ["qwen-turbo", "qwen-plus"],
  };

  return {
    wooCommerceKey,
    setWooCommerceKey,
    merchantGuyKey,
    setMerchantGuyKey,
    llmProvider,
    setLlmProvider,
    llmModel,
    setLlmModel,
    llmApiKey,
    setLlmApiKey,
    supportedModels,
  };
};