#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const VERSION = "0.1.0";
const DEFAULT_BASE_URL = "https://apiany.ai";
const MAX_DOCS_CHARS = 12000;

function baseUrl() {
  const raw = process.env.APIANY_BASE_URL || DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, "");
}

function apiKey() {
  return process.env.APIANY_API_KEY || process.env.APIANY_KEY || "";
}

function buildUrl(path, searchParams = {}) {
  const url = new URL(path, `${baseUrl()}/`);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function requestJson(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };
  if (options.body != null) headers["Content-Type"] = "application/json";
  const key = options.apiKey ?? apiKey();
  if (key) headers.Authorization = `Bearer ${key}`;

  const response = await fetch(buildUrl(path, options.searchParams), {
    method: options.method || "GET",
    headers,
    body: options.body == null ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `APIAny request failed: ${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 300)}` : ""}`
    );
  }

  return response.json();
}

async function fetchJson(path, options = {}) {
  return requestJson(path, { ...options, method: "GET" });
}

async function fetchText(path) {
  const response = await fetch(buildUrl(path), {
    method: "GET",
    headers: { Accept: "text/plain" },
  });
  if (!response.ok) {
    throw new Error(`APIAny docs request failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function publicModels(q) {
  const payload = await fetchJson("/api/v1/models", {
    searchParams: q ? { q } : {},
  });
  return Array.isArray(payload?.data) ? payload.data : [];
}

function textContent(data) {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function modelText(model) {
  return [
    model.id,
    model.display_name,
    model.owned_by,
    model.type,
    model.group,
    model.capability,
    model.description,
    ...(model.capability_metadata?.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterModels(models, params = {}) {
  const query = (params.query || params.q || "").trim().toLowerCase();
  const type = params.type || "";
  const provider = (params.provider || "").trim().toLowerCase();

  return models.filter((model) => {
    if (type && model.type !== type) return false;
    if (provider && String(model.owned_by || "").toLowerCase() !== provider) {
      return false;
    }
    if (!query) return true;
    return modelText(model).includes(query);
  });
}

function summarizeModel(model) {
  return {
    id: model.id,
    display_name: model.display_name,
    type: model.type,
    owned_by: model.owned_by,
    group: model.group,
    capability: model.capability,
    description: model.description,
    pricing: model.pricing,
    endpoint_formats: model.capability_metadata?.endpoint_formats,
    execution: model.capability_metadata?.execution,
    tags: model.capability_metadata?.tags,
  };
}

function findModel(models, modelId) {
  const normalized = modelId.trim().toLowerCase();
  return models.find((model) => {
    return (
      String(model.id || "").toLowerCase() === normalized ||
      String(model.display_name || "").toLowerCase() === normalized
    );
  });
}

function estimateCredits(model, params) {
  const pricing = model.pricing || {};
  const requests = Math.max(1, Number(params.requests || 1));
  const inputTokens = Math.max(0, Number(params.input_tokens || 0));
  const outputTokens = Math.max(0, Number(params.output_tokens || 0));
  const cachedInputTokens = Math.max(0, Number(params.cached_input_tokens || 0));

  const perRequest = Number(pricing.credits_per_request ?? pricing.base_credits_per_request ?? 0);
  const inputPer1k = Number(pricing.credits_per_1k_input_tokens || 0);
  const outputPer1k = Number(pricing.credits_per_1k_output_tokens || 0);
  const cachedInputPer1k = Number(pricing.credits_per_1k_cached_input_tokens || 0);
  const minPerRequest = Number(pricing.min_credits_per_request || 0);

  const requestCredits = perRequest * requests;
  const inputCredits = (inputTokens / 1000) * inputPer1k;
  const outputCredits = (outputTokens / 1000) * outputPer1k;
  const cachedInputCredits = (cachedInputTokens / 1000) * cachedInputPer1k;
  const variableTotal = requestCredits + inputCredits + outputCredits + cachedInputCredits;
  const minimumTotal = minPerRequest > 0 ? minPerRequest * requests : 0;
  const totalCredits = Math.max(variableTotal, minimumTotal);

  return {
    model: model.id,
    display_name: model.display_name,
    requests,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cached_input_tokens: cachedInputTokens,
    credits: {
      request: requestCredits,
      input: inputCredits,
      output: outputCredits,
      cached_input: cachedInputCredits,
      minimum: minimumTotal,
      total: totalCredits,
    },
    note: "Estimate only. Actual APIAny billing follows server-side pricing rules and successful request settlement.",
  };
}

function modelEndpoint(model, base, sync = false) {
  if (model.type === "image") {
    return `${base}/v1/images/generations${sync ? "/sync" : ""}`;
  }
  if (model.type === "video") {
    return `${base}/v1/videos/generations${sync ? "/sync" : ""}`;
  }
  return `${base}/v1/chat/completions`;
}

function supportsSync(model) {
  const formats = model.capability_metadata?.endpoint_formats || [];
  return formats.includes("image-generation-sync") || formats.includes("video-generation-sync");
}

function samplePayload(model) {
  if (model.type === "image") {
    return {
      model: model.id,
      prompt: "A clean product photo of a futuristic API gateway dashboard, studio lighting",
      size: "1024x1024",
      n: 1,
    };
  }

  if (model.type === "video") {
    return {
      model: model.id,
      prompt: "A 5-second cinematic shot of data streams flowing through a cloud API gateway",
      duration: 5,
      aspect_ratio: "16:9",
    };
  }

  return {
    model: model.id,
    messages: [{ role: "user", content: "Build an agent workflow with APIAny." }],
  };
}

function integrationExample(language, model, base) {
  const endpoint = modelEndpoint(model, base);
  const key = "<APIANY_API_KEY>";
  const payload = samplePayload(model);
  const json = JSON.stringify(payload, null, 2);

  if (model.type === "chat") {
    const examples = {
      curl: `curl --request POST '${endpoint}' \\
  --header 'Authorization: Bearer ${key}' \\
  --header 'Content-Type: application/json' \\
  --data '${json}'`,
      python: `from openai import OpenAI

client = OpenAI(base_url="${base}/v1", api_key="${key}")

response = client.chat.completions.create(
    model="${model.id}",
    messages=[{"role": "user", "content": "Build an agent workflow with APIAny."}],
)

print(response.choices[0].message.content)`,
      javascript: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${base}/v1",
  apiKey: "${key}",
});

const response = await client.chat.completions.create({
  model: "${model.id}",
  messages: [{ role: "user", content: "Build an agent workflow with APIAny." }],
});

console.log(response.choices[0].message.content);`,
      go: `client := openai.NewClient(
  option.WithBaseURL("${base}/v1"),
  option.WithAPIKey("${key}"),
)

resp, err := client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
  Model: "${model.id}",
  Messages: []openai.ChatCompletionMessageParamUnion{
    openai.UserMessage("Build an agent workflow with APIAny."),
  },
})`,
      java: `OpenAIClient client = OpenAIOkHttpClient.builder()
    .baseUrl("${base}/v1")
    .apiKey("${key}")
    .build();

ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
    .model("${model.id}")
    .addUserMessage("Build an agent workflow with APIAny.")
    .build();`,
      php: `$client = OpenAI::factory()
    ->withBaseUri('${base}/v1')
    ->withApiKey('${key}')
    ->make();

$result = $client->chat()->create([
    'model' => '${model.id}',
    'messages' => [
        ['role' => 'user', 'content' => 'Build an agent workflow with APIAny.'],
    ],
]);`,
    };

    return examples[language] || examples.curl;
  }

  const taskHint =
    model.execution === "async"
      ? `\n\n# Async response returns task_id. Poll: GET ${base}/v1/tasks/{task_id}`
      : "";
  const examples = {
    curl: `curl --request POST '${endpoint}' \\
  --header 'Authorization: Bearer ${key}' \\
  --header 'Content-Type: application/json' \\
  --data '${json}'${taskHint}`,
    python: `import os
import requests

response = requests.post(
    "${endpoint}",
    headers={
        "Authorization": f"Bearer {os.environ['APIANY_API_KEY']}",
        "Content-Type": "application/json",
    },
    json=${JSON.stringify(payload, null, 4)},
    timeout=60,
)
response.raise_for_status()
print(response.json())

# Async models return task_id. Poll: GET ${base}/v1/tasks/{task_id}`,
    javascript: `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.APIANY_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${JSON.stringify(payload, null, 2)}),
});

if (!response.ok) throw new Error(await response.text());
console.log(await response.json());

// Async models return task_id. Poll: GET ${base}/v1/tasks/{task_id}`,
    go: `body := strings.NewReader(\`${json}\`)
req, err := http.NewRequestWithContext(ctx, http.MethodPost, "${endpoint}", body)
req.Header.Set("Authorization", "Bearer ${key}")
req.Header.Set("Content-Type", "application/json")
resp, err := http.DefaultClient.Do(req)`,
    java: `HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${endpoint}"))
    .header("Authorization", "Bearer ${key}")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString("""
${json}
"""))
    .build();`,
    php: `$response = $http->post('${endpoint}', [
    'headers' => [
        'Authorization' => 'Bearer ${key}',
        'Content-Type' => 'application/json',
    ],
    'json' => ${JSON.stringify(payload, null, 4)},
]);`,
  };

  return examples[language] || examples.curl;
}

function modelUsage(model, language) {
  const base = baseUrl();
  const syncEndpoint = supportsSync(model) ? modelEndpoint(model, base, true) : null;
  return {
    model: summarizeModel(model),
    usage: {
      primary_endpoint: modelEndpoint(model, base),
      sync_endpoint: syncEndpoint,
      task_status_endpoint: model.type === "chat" ? null : `${base}/v1/tasks/{task_id}`,
      execution: model.execution || (model.type === "chat" ? "sync" : "async"),
      api_key_env: "APIANY_API_KEY",
      charge_note:
        model.type === "chat"
          ? "Chat requests are charged according to token/request pricing."
          : "Media generation is charged on successful task completion and refunded on failure.",
      sample_payload: samplePayload(model),
      example_language: language,
      example: integrationExample(language, model, base),
    },
  };
}

function apiKeyMissingContent() {
  return textContent({
    error: "missing_api_key",
    message: "Set APIANY_API_KEY before calling paid or user-scoped APIAny tools.",
  });
}

function paidConfirmationMissingContent() {
  return textContent({
    error: "paid_request_not_confirmed",
    message:
      "This tool can create a paid APIAny generation task. Re-run with confirm_paid_request=true after user confirmation.",
  });
}

function requirePaidRequest(params) {
  if (!apiKey()) return apiKeyMissingContent();
  if (params.confirm_paid_request !== true) return paidConfirmationMissingContent();
  return null;
}

function mergePayload(base, extraJson) {
  return {
    ...(extraJson && typeof extraJson === "object" && !Array.isArray(extraJson) ? extraJson : {}),
    ...Object.fromEntries(Object.entries(base).filter(([, value]) => value !== undefined && value !== null)),
  };
}

const server = new McpServer({
  name: "apiany-mcp",
  version: VERSION,
});

server.tool(
  "list_models",
  "List public APIAny models with pricing and capability metadata.",
  {
    q: z.string().optional().describe("Optional model search text."),
    type: z.enum(["chat", "image", "video", "audio"]).optional(),
    provider: z.string().optional().describe("Optional provider name, such as OpenAI or Google."),
    limit: z.number().int().min(1).max(100).default(50),
  },
  async ({ q, type, provider, limit }) => {
    const models = filterModels(await publicModels(q), { q, type, provider }).slice(0, limit);
    return textContent({
      base_url: baseUrl(),
      count: models.length,
      data: models.map(summarizeModel),
    });
  }
);

server.tool(
  "search_models",
  "Search APIAny models by natural-language text, provider, modality, or capability.",
  {
    query: z.string().min(1),
    type: z.enum(["chat", "image", "video", "audio"]).optional(),
    limit: z.number().int().min(1).max(50).default(20),
  },
  async ({ query, type, limit }) => {
    const models = filterModels(await publicModels(), { query, type }).slice(0, limit);
    return textContent({
      query,
      count: models.length,
      data: models.map(summarizeModel),
    });
  }
);

server.tool(
  "get_model",
  "Get one APIAny model by public model id or display name.",
  {
    model: z.string().min(1),
  },
  async ({ model }) => {
    const found = findModel(await publicModels(model), model) || findModel(await publicModels(), model);
    if (!found) {
      return textContent({ error: "model_not_found", model });
    }
    return textContent(summarizeModel(found));
  }
);

server.tool(
  "estimate_cost",
  "Estimate APIAny credits for a model using public pricing metadata.",
  {
    model: z.string().min(1),
    requests: z.number().int().min(1).default(1),
    input_tokens: z.number().int().min(0).default(0),
    output_tokens: z.number().int().min(0).default(0),
    cached_input_tokens: z.number().int().min(0).default(0),
  },
  async (params) => {
    const found = findModel(await publicModels(params.model), params.model) || findModel(await publicModels(), params.model);
    if (!found) {
      return textContent({ error: "model_not_found", model: params.model });
    }
    return textContent(estimateCredits(found, params));
  }
);

server.tool(
  "get_integration_examples",
  "Return APIAny integration examples for a model and language.",
  {
    language: z.enum(["curl", "python", "javascript", "go", "java", "php"]).default("curl"),
    model: z.string().default("gpt-5.5"),
  },
  async ({ language, model }) => {
    const found =
      findModel(await publicModels(model), model) ||
      findModel(await publicModels(), model) || {
        id: model,
        display_name: model,
        type: "chat",
        owned_by: null,
        capability_metadata: { endpoint_formats: ["openai-chat"] },
        execution: "sync",
      };
    return textContent({
      base_url: baseUrl(),
      language,
      model: summarizeModel(found),
      endpoint: modelEndpoint(found, baseUrl()),
      example: integrationExample(language, found, baseUrl()),
    });
  }
);

server.tool(
  "get_model_usage",
  "Return endpoint, payload, async behavior, and language example for one or more APIAny models.",
  {
    model: z.string().optional().describe("Optional model id or display name. Omit to list usage for models."),
    type: z.enum(["chat", "image", "video", "audio"]).optional(),
    language: z.enum(["curl", "python", "javascript", "go", "java", "php"]).default("curl"),
    limit: z.number().int().min(1).max(100).default(20),
  },
  async ({ model, type, language, limit }) => {
    const models = await publicModels(model);
    if (model) {
      const found = findModel(models, model) || findModel(await publicModels(), model);
      if (!found) {
        return textContent({ error: "model_not_found", model });
      }
      return textContent(modelUsage(found, language));
    }

    const filtered = filterModels(models, { type }).slice(0, limit);
    return textContent({
      count: filtered.length,
      type: type || "all",
      language,
      data: filtered.map((item) => modelUsage(item, language)),
    });
  }
);

server.tool(
  "create_image_task",
  "Create a paid APIAny asynchronous image generation task. Requires APIANY_API_KEY and confirm_paid_request=true.",
  {
    model: z.string().min(1),
    prompt: z.string().min(1),
    size: z.string().optional().describe("Aspect ratio such as 1:1 or 16:9, or a pixel size when supported."),
    quality: z.string().optional().describe("Resolution/quality tier such as 1k, 2k, 4k, standard, or hd."),
    image_urls: z.array(z.string()).optional().describe("Optional reference/input images for image-to-image or editing."),
    callback_url: z.string().optional().describe("Optional public HTTPS callback URL."),
    extra_json: z.record(z.string(), z.unknown()).optional().describe("Optional extra request fields to merge into the JSON body."),
    confirm_paid_request: z.boolean().default(false),
  },
  async (params) => {
    const safety = requirePaidRequest(params);
    if (safety) return safety;

    const payload = mergePayload(
      {
        model: params.model,
        prompt: params.prompt,
        size: params.size,
        quality: params.quality,
        image_urls: params.image_urls,
        callback_url: params.callback_url,
      },
      params.extra_json
    );
    const result = await requestJson("/v1/images/generations", {
      method: "POST",
      body: payload,
    });
    return textContent({
      endpoint: `${baseUrl()}/v1/images/generations`,
      request: payload,
      response: result,
      next_step: result?.task_id ? `Poll ${baseUrl()}/v1/tasks/${result.task_id}` : "Inspect response.",
    });
  }
);

server.tool(
  "create_video_task",
  "Create a paid APIAny asynchronous video generation task. Requires APIANY_API_KEY and confirm_paid_request=true.",
  {
    model: z.string().min(1),
    prompt: z.string().min(1),
    duration: z.number().int().min(1).optional(),
    aspect_ratio: z.string().optional().describe("Video aspect ratio such as 16:9 or 9:16."),
    resolution: z.string().optional().describe("Optional video resolution such as 720p or 1080p."),
    image_urls: z.array(z.string()).optional().describe("Optional reference images for image-to-video models."),
    video_urls: z.array(z.string()).optional().describe("Optional reference videos for models that support video input."),
    audio_urls: z.array(z.string()).optional().describe("Optional reference audio for models that support audio input."),
    callback_url: z.string().optional().describe("Optional public HTTPS callback URL."),
    extra_json: z.record(z.string(), z.unknown()).optional().describe("Optional extra request fields to merge into the JSON body."),
    confirm_paid_request: z.boolean().default(false),
  },
  async (params) => {
    const safety = requirePaidRequest(params);
    if (safety) return safety;

    const payload = mergePayload(
      {
        model: params.model,
        prompt: params.prompt,
        duration: params.duration,
        aspect_ratio: params.aspect_ratio,
        resolution: params.resolution,
        image_urls: params.image_urls,
        video_urls: params.video_urls,
        audio_urls: params.audio_urls,
        callback_url: params.callback_url,
      },
      params.extra_json
    );
    const result = await requestJson("/v1/videos/generations", {
      method: "POST",
      body: payload,
    });
    return textContent({
      endpoint: `${baseUrl()}/v1/videos/generations`,
      request: payload,
      response: result,
      next_step: result?.task_id ? `Poll ${baseUrl()}/v1/tasks/${result.task_id}` : "Inspect response.",
    });
  }
);

server.tool(
  "get_task_status",
  "Get an APIAny async generation task status. Requires APIANY_API_KEY.",
  {
    task_id: z.string().min(1),
  },
  async ({ task_id }) => {
    if (!apiKey()) return apiKeyMissingContent();
    const result = await requestJson(`/v1/tasks/${encodeURIComponent(task_id)}`);
    return textContent(result);
  }
);

server.tool(
  "get_docs_context",
  "Return compact APIAny documentation context from llms.txt.",
  {
    max_chars: z.number().int().min(1000).max(MAX_DOCS_CHARS).default(6000),
  },
  async ({ max_chars }) => {
    const docs = await fetchText("/llms.txt");
    return textContent({
      source: `${baseUrl()}/llms.txt`,
      truncated: docs.length > max_chars,
      text: docs.slice(0, max_chars),
    });
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
