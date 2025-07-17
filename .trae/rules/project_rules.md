## ✅ 1. Auto-Fix Mode Required
Claude (or any AI assistant) must **auto-fix** all issues without asking for confirmation.
> ❌ No “Accept?” prompts  
> ✅ Fix and finalize code immediately

---

## ✅ 2. Do Not Skip Any Step
All steps from the AI prompt must be followed **exactly** and marked as completed only after full implementation.

---

## ✅ 3. 13-Step LLM Integration Compliance
Ensure every part of the 13-step LLM logic checklist is completed:
- `sendLLMRequest(...)` routing logic
- Dynamic headers
- Model-specific endpoints
- Error handling
- Response parsing for each provider

---

## ✅ 4. Required LLM Providers
Each of the following must be supported with:
- API key input
- Save and Validate buttons

| Provider     | Required |
|--------------|----------|
| OpenAI       | ✅       |
| Claude       | ✅       |
| Gemini       | ✅       |
| Groq         | ✅       |
| DeepSeek     | ✅       |
| Qwen         | ✅       |

---

## ✅ 5. .env Integration (Pre-Connected Apps)
WooCommerce and MerchantGuy must be connected via `.env` files:

```env
# woo.env
WOO_CONSUMER_KEY=ck_XXXX
WOO_CONSUMER_SECRET=cs_XXXX

# Merchantguy.env
MERCHANTGUY_API_KEY=your-key-here
