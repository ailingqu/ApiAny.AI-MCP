---
name: apiany-integration
description: Use when a user asks to integrate with APIAny, choose or compare APIAny models, estimate APIAny credits or pricing, migrate OpenAI-compatible clients to APIAny, generate APIAny model usage examples, or run confirmed APIAny image and video tasks through the APIAny MCP server.
---

# APIAny Integration Skill

Use this skill when a user asks an agent to integrate with APIAny, choose an APIAny model, compare APIAny pricing, migrate an OpenAI-compatible client to APIAny, or estimate APIAny credits.

## Core Rules

- Prefer APIAny's OpenAI-compatible base URL: `https://apiany.ai/v1`.
- Never reveal or log API keys. Use placeholders such as `<APIANY_API_KEY>`.
- For model discovery, prefer the APIAny MCP server tools when available:
  - `list_models`
  - `search_models`
  - `get_model`
  - `get_model_usage`
  - `estimate_cost`
  - `get_integration_examples`
  - `get_docs_context`
  - `create_image_task`
  - `create_video_task`
  - `get_task_status`
- If MCP is not available, use public docs and `https://apiany.ai/api/v1/models`.
- Treat pricing as an estimate unless returned by the live API at request time.
- For image/video/audio generation, explain async task behavior: create task, poll status or use callback, charge on success, refund on failure.
- Do not call paid generation endpoints unless the user explicitly asks, provides an API key, and confirms the paid request. For MCP tools, pass `confirm_paid_request=true` only after confirmation.

## Workflow

1. Understand the user's target workflow:
   - Chat / text
   - Image generation or editing
   - Video generation
   - Audio or music
   - Cost comparison
   - Migration from OpenAI-compatible client
2. Select candidate models:
   - Search by modality, provider, model family, or capability.
   - Compare model pricing and capabilities.
   - Prefer stable public model ids.
3. Provide integration code:
   - Use `get_model_usage` for the selected model whenever the MCP server is available.
   - Use the OpenAI-compatible SDK for chat models when applicable.
   - Use APIAny media endpoints for image/video models and explain task polling.
   - Set `base_url` / `baseURL` to `https://apiany.ai/v1`.
   - Set API key from environment, not inline.
4. Estimate cost:
   - Use `estimate_cost` when available.
   - Mention that server-side billing rules are authoritative.
5. Provide verification steps:
   - Check API key.
   - Run a small request.
   - Inspect task status or response.
   - Confirm credit usage in dashboard.

## Paid Media Workflow

1. Use `get_model_usage` to show the selected model's endpoint, payload, and expected async behavior.
2. Ask for confirmation before a paid task.
3. Call `create_image_task` or `create_video_task` with `confirm_paid_request=true`.
4. Poll `get_task_status` until the task succeeds or fails.
5. Report `task_id`, status, result links, charged credits, and any error.

## OpenAI-Compatible Examples

Python:

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://apiany.ai/v1",
    api_key=os.environ["APIANY_API_KEY"],
)

response = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": "Write a launch checklist."}],
)

print(response.choices[0].message.content)
```

JavaScript:

```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://apiany.ai/v1",
  apiKey: process.env.APIANY_API_KEY,
});

const response = await client.chat.completions.create({
  model: "gpt-5.5",
  messages: [{ role: "user", content: "Write a launch checklist." }],
});

console.log(response.choices[0].message.content);
```

## Suggested Agent Responses

When asked to choose a model:

1. Search APIAny models.
2. Return 2-4 candidates.
3. Explain tradeoffs: modality, quality, price, speed, provider.
4. Include model ids and a usage example from `get_model_usage`.

When asked to migrate from OpenAI:

1. Keep the existing SDK if possible.
2. Change only `baseURL` and API key.
3. Replace model id with an APIAny public model id.
4. Run a minimal smoke test.

## Required User Inputs

Ask the user for:

- Target modality and desired output.
- Budget or latency preference.
- API key only when they want to run paid requests.
- Preferred language/framework for examples.
