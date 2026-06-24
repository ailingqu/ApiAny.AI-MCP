# APIAny MCP Submission Materials

Last updated: 2026-06-24

This document stores reusable submission copy, configuration, and channel notes for publishing APIAny MCP across MCP directories, registries, and marketplaces.

## Canonical Project Information

- Product name: `APIAny MCP`
- Type: `MCP Server`
- Maintainer / publisher: `@ailingqu`
- Official website: `https://apiany.ai`
- GitHub repository: `https://github.com/ailingqu/ApiAny.AI-MCP`
- npm package: `https://www.npmjs.com/package/@apiany-ai/mcp`
- npm install command: `npx -y @apiany-ai/mcp`
- License: `MIT`
- Runtime: `Node.js >= 20`
- Transport: `stdio`
- Suggested categories: `AI`, `Developer Tools`, `API`, `LLM`, `Image Generation`, `Video Generation`
- Suggested tags: `apiany`, `mcp`, `model-context-protocol`, `ai`, `api`, `llm`, `openai-compatible`, `image-generation`, `video-generation`

## Short Description

Official APIAny MCP server for discovering AI models, estimating credits, reading APIAny docs context, and generating OpenAI-compatible integration examples.

## Directory Description

APIAny gives teams one OpenAI-compatible API gateway for leading LLM, image, video, and multimodal models. Compare APIAny API pricing, read APIAny API docs, and start building production apps, agents, and workflows.

## Long Overview

```md
## APIAny MCP

APIAny MCP is the official Model Context Protocol server for [APIAny](https://apiany.ai), an OpenAI-compatible API gateway for leading LLM, image, video, and multimodal AI models.

It helps AI agents and developer tools discover APIAny models, compare pricing metadata, read compact documentation context, and generate production-ready integration examples without leaving the MCP client.

### What You Can Do

- Discover available APIAny models by provider, modality, capability, and pricing metadata.
- Search for chat, image, video, and multimodal models.
- Estimate APIAny credits before choosing a model or running a workflow.
- Generate OpenAI-compatible examples for cURL, Python, JavaScript, Go, Java, and PHP.
- Fetch compact APIAny documentation context from `llms.txt`.
- Create image or video generation tasks with explicit paid-request confirmation.
- Poll async media task status.

### MCP Tools

- `list_models`
- `search_models`
- `get_model`
- `estimate_cost`
- `get_model_usage`
- `get_integration_examples`
- `get_docs_context`
- `create_image_task`
- `create_video_task`
- `get_task_status`

### Installation

`npx -y @apiany-ai/mcp`

### Configuration

Read-only model discovery, pricing, docs, and integration examples work without an API key.

For paid image or video task tools, set `APIANY_API_KEY` in your MCP client environment and pass `confirm_paid_request=true` when creating a task.

### Links

- Website: https://apiany.ai
- GitHub: https://github.com/ailingqu/ApiAny.AI-MCP
- npm: https://www.npmjs.com/package/@apiany-ai/mcp
```

## Standard MCP Client Config

Use this public config for directories. It avoids exposing or requiring an API key for read-only tools.

```json
{
  "mcpServers": {
    "apiany": {
      "command": "npx",
      "args": ["-y", "@apiany-ai/mcp"],
      "env": {
        "APIANY_BASE_URL": "https://apiany.ai"
      }
    }
  }
}
```

If the platform supports optional secret placeholders, use:

```json
{
  "mcpServers": {
    "apiany": {
      "command": "npx",
      "args": ["-y", "@apiany-ai/mcp"],
      "env": {
        "APIANY_BASE_URL": "https://apiany.ai",
        "APIANY_API_KEY": "<YOUR_APIANY_API_KEY>"
      }
    }
  }
}
```

## Tools

| Tool | Purpose | API key |
| --- | --- | --- |
| `list_models` | List public APIAny models with pricing and capability metadata. | No |
| `search_models` | Search models by text, provider, modality, or capability. | No |
| `get_model` | Get one public model by model id or display name. | No |
| `estimate_cost` | Estimate credits from public pricing metadata. | No |
| `get_model_usage` | Return endpoint, payload, async behavior, and language examples for models. | No |
| `get_integration_examples` | Return cURL, Python, JavaScript, Go, Java, or PHP examples. | No |
| `get_docs_context` | Return compact APIAny documentation context from `/llms.txt`. | No |
| `create_image_task` | Create a paid async image task after explicit confirmation. | Yes |
| `create_video_task` | Create a paid async video task after explicit confirmation. | Yes |
| `get_task_status` | Read async media task status. | Yes |

## Current Submission Status

| Channel | Status | Notes |
| --- | --- | --- |
| GitHub | Done | Repository published at `https://github.com/ailingqu/ApiAny.AI-MCP`. |
| npm | Done | Package published as `@apiany-ai/mcp`. |
| GitHub Releases | Done | Releases `v0.1.0` and `v0.1.1` exist; `v0.1.2` is prepared for registry metadata validation fixes. |
| mcp.so | Submitted | Listing is live, but the Overview tab is currently empty. Use the Long Overview above if the listing can be edited. |
| Official MCP Registry | Prepared | `mcpName` and `server.json` are prepared for the `0.1.2` release; publish after npm `0.1.2` is live. |

## Recommended Submission Channels

### 1. Official MCP Registry

- URL: `https://registry.modelcontextprotocol.io`
- Docs: `https://modelcontextprotocol.io/registry/quickstart`
- Priority: High
- Status: Prepared, not submitted
- Why it matters: This is the official metadata registry. PulseMCP and other downstream registries can ingest from it.

Important: the already-published npm package `0.1.0` does not include the required `mcpName` field. Version `0.1.2` is prepared for registry publishing with:

- `package.json` field:

```json
"mcpName": "io.github.ailingqu/apiany-mcp"
```

- top-level `server.json`
- npm package version `0.1.2`

After npm `0.1.2` is live, publish with:

1. Authenticate with `mcp-publisher login github`.
2. Publish with `mcp-publisher publish`.

Suggested `server.json`:

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  "name": "io.github.ailingqu/apiany-mcp",
  "description": "APIAny MCP server for model discovery, pricing, docs, and integration examples.",
  "repository": {
    "url": "https://github.com/ailingqu/ApiAny.AI-MCP",
    "source": "github"
  },
  "version": "0.1.2",
  "packages": [
    {
      "registryType": "npm",
      "identifier": "@apiany-ai/mcp",
      "version": "0.1.2",
      "transport": {
        "type": "stdio"
      },
      "environmentVariables": [
        {
          "name": "APIANY_BASE_URL",
          "description": "APIAny base URL. Defaults to https://apiany.ai.",
          "isRequired": false,
          "format": "string"
        },
        {
          "name": "APIANY_API_KEY",
          "description": "Optional APIAny API key for paid image/video task tools and task polling.",
          "isRequired": false,
          "format": "string",
          "isSecret": true
        }
      ]
    }
  ]
}
```

### 2. PulseMCP

- URL: `https://www.pulsemcp.com/submit`
- Priority: High
- Status: Not submitted
- Notes: PulseMCP says it ingests entries from the Official MCP Registry daily and processes them weekly. It also has a submit form that accepts a GitHub repository, subfolder, or standalone website URL.
- Recommended action: publish to Official MCP Registry first, then submit/verify the GitHub URL on PulseMCP.

### 3. Glama

- URL: `https://glama.ai/mcp/servers`
- Methodology: `https://glama.ai/mcp/methodology`
- Priority: High
- Status: Not submitted
- Notes: Glama lists servers from GitHub repositories and verifies maintainers via GitHub OAuth/write access. It can index tools, schemas, and annotations.
- Recommended action: submit the GitHub repo and claim/verify ownership.
- Optional repo metadata file:

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["ailingqu"]
}
```

### 4. Smithery

- URL: `https://smithery.ai`
- Publish docs: `https://smithery.ai/docs/build/publish`
- Priority: Medium
- Status: Not ready
- Notes: Smithery publishing currently emphasizes public HTTPS Streamable HTTP servers, or local MCPB bundles. Our current package is stdio over npm, so it may need either an MCPB bundle or a hosted Streamable HTTP wrapper before submission.
- Recommended action: defer until we decide whether to offer a hosted APIAny MCP endpoint or package an MCPB bundle.

### 5. Docker MCP Catalog

- URL: `https://mcp.docker.com`
- Registry repo: `https://github.com/docker/mcp-registry`
- Priority: Medium
- Status: Not ready
- Notes: Docker Catalog is useful for Docker Desktop MCP Toolkit discovery, but typically expects containerized MCP servers / Docker catalog metadata.
- Recommended action: add a Dockerfile and publish a container image before submitting.

### 6. Cline MCP Marketplace

- Marketplace: `https://cline.bot/mcp-marketplace`
- Repo: `https://github.com/cline/mcp-marketplace`
- Priority: Medium
- Status: Not submitted
- Notes: Submit via Cline's marketplace flow / repository. One-click install quality matters.
- Recommended action: prepare entry using the Standard MCP Client Config and submit a PR or marketplace form.

### 7. mcpservers.org

- Submit URL: `https://mcpservers.org/submit`
- Priority: Medium
- Status: Not submitted
- Notes: Free listing is available; premium review is optional.
- Suggested fields:
  - Server Name: `APIAny MCP`
  - Short Description: use the Short Description above.
  - Link: `https://github.com/ailingqu/ApiAny.AI-MCP`
  - Category: `Development` or `Other`; use `AI` if available.

### 8. MCP Market

- Submit URL: `https://mcpmarket.com/submit`
- Priority: Medium / Paid
- Status: Not submitted
- Notes: Accepts MCP servers and Agent Skills via GitHub repository URL. The page advertises a paid "Get Listed Now" option.
- Recommended action: submit only if paid listing is acceptable.

### 9. Awesome MCP Servers

- Repo: `https://github.com/punkpeye/awesome-mcp-servers`
- Priority: Low / Medium
- Status: Not submitted
- Notes: Community list, usually via pull request. Good for GitHub discoverability.
- Recommended action: submit after Official MCP Registry + Glama + PulseMCP, when the project has more stars/downloads or a stronger listing footprint.

## Recommended Next Steps

1. Update the mcp.so Overview if their listing can be edited.
2. Publish npm `0.1.2`, then publish to the Official MCP Registry with `mcp-publisher`.
3. Submit/verify on PulseMCP.
4. Submit/claim on Glama.
5. Submit to mcpservers.org.
6. Decide whether to support Smithery/Docker by adding hosted HTTP or Docker packaging.

## Sources Checked

- mcp.so: `https://mcp.so`
- Official MCP Registry: `https://modelcontextprotocol.io/registry/about`
- Official MCP Registry quickstart: `https://modelcontextprotocol.io/registry/quickstart`
- PulseMCP submit page: `https://www.pulsemcp.com/submit`
- PulseMCP directory: `https://www.pulsemcp.com/servers`
- Glama: `https://glama.ai`
- Glama methodology: `https://glama.ai/mcp/methodology`
- Smithery publish docs: `https://smithery.ai/docs/build/publish`
- Docker MCP Catalog: `https://mcp.docker.com`
- Docker MCP Registry: `https://github.com/docker/mcp-registry`
- Cline MCP Marketplace: `https://cline.bot/mcp-marketplace`
- Cline marketplace repo: `https://github.com/cline/mcp-marketplace`
- mcpservers.org submit: `https://mcpservers.org/submit`
- MCP Market submit: `https://mcpmarket.com/submit`
- Awesome MCP Servers: `https://github.com/punkpeye/awesome-mcp-servers`
