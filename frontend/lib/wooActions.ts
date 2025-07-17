import { sendLLMRequest } from "../hooks/useLLM";

// Example function to execute WooCommerce actions
export const executeWooCommerceAction = async (
  actionPrompt: string,
  apiKey: string
) => {
  // Step 1: Use LLM to convert natural language to API call
  const llmResponse = await sendLLMRequest(
    "openai",
    "gpt-4o",
    `Convert this to a WooCommerce API call: "${actionPrompt}". \nReturn ONLY valid JSON with: { "endpoint": "...", "method": "...", "params": {...} }`,
    apiKey
  );

  try {
    const action = JSON.parse(llmResponse);
    // Step 2: Execute the API call
    const response = await fetch(
      `https://your-store.com/wp-json/wc/v3/${action.endpoint}`,
      {
        method: action.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa(`ck_your_consumer_key:cs_your_consumer_secret`)}`
        },
        body: action.params ? JSON.stringify(action.params) : undefined
      }
    );
    if (!response.ok) throw new Error("API request failed");
    // Step 3: Process results
    const data = await response.json();
    // Step 4: Format as CSV if requested
    if (actionPrompt.includes("export as CSV")) {
      const csv = convertToCSV(data);
      return { csv, data };
    }
    return data;
  } catch (error: any) {
    console.error("Action execution failed:", error);
    throw new Error(`Action failed: ${error.message}`);
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data: any[]) => {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header =>
      `"${String(item[header]).replace(/"/g, '""')}"`
    ).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
};