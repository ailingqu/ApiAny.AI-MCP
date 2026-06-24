<h1 align="center">APIAny MCP</h1>

<p align="center">
  <strong>Official MCP server for APIAny model discovery, pricing context, documentation lookup, and OpenAI-compatible integration examples.</strong>
</p>

<p align="center">
  <a href="https://apiany.ai">APIAny</a> connects agents and developers to 100+ AI models for chat, image, video, and multimodal workflows.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@apiany-ai/mcp"><img alt="npm version" src="https://img.shields.io/npm/v/@apiany-ai/mcp?style=flat-square&color=174CFF"></a>
  <a href="https://www.npmjs.com/package/@apiany-ai/mcp"><img alt="npm package" src="https://img.shields.io/badge/npm-%40apiany--ai%2Fmcp-CB3837?style=flat-square"></a>
  <a href="https://github.com/ailingqu/ApiAny.AI-MCP/releases"><img alt="release" src="https://img.shields.io/github/v/release/ailingqu/ApiAny.AI-MCP?style=flat-square&color=12B76A"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-344054?style=flat-square"></a>
  <img alt="Node.js" src="https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square">
  <img alt="MCP server" src="https://img.shields.io/badge/type-MCP%20Server-7C3AED?style=flat-square">
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#visual-setup">Visual Setup</a> ·
  <a href="#mcp-tools">MCP Tools</a> ·
  <a href="#agent-skill">Agent Skill</a> ·
  <a href="#development">Development</a>
</p>

<p align="center">
  <strong>English</strong> | <a href="README.zh-CN.md">中文</a>
</p>

<p align="center">
  <img src="assets/readme/overview.svg" alt="APIAny MCP overview" width="920">
</p>

## What This Repository Provides

APIAny MCP gives AI agents a structured way to understand and use [APIAny](https://apiany.ai):

- Discover public APIAny models by provider, modality, capability, and pricing metadata.
- Estimate APIAny credits before choosing a model or running a workflow.
- Fetch compact documentation context from APIAny docs and `llms.txt`.
- Generate OpenAI-compatible cURL, Python, JavaScript, Go, Java, and PHP examples.
- Create image or video generation tasks only when an API key is configured and the user explicitly confirms paid usage.
- Package an agent skill at `skills/apiany-integration` so supported agents can learn the APIAny workflow.

## Quick Start

Run the server directly with npm:

```bash
npx -y @apiany-ai/mcp
```

Or install and run it from this repository:

```bash
git clone git@github.com:ailingqu/ApiAny.AI-MCP.git
cd ApiAny.AI-MCP
npm install
npm start
```

## Visual Setup

### 1. Install and Start the MCP Server

<p align="center">
  <img src="assets/readme/install.svg" alt="Install APIAny MCP with npx" width="900">
</p>

### 2. Add APIAny MCP to Your Agent Client

Use this configuration in Claude Code, Cursor, VS Code, or another MCP-compatible client:

<p align="center">
  <img src="assets/readme/config.svg" alt="APIAny MCP client configuration" width="900">
</p>

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

For paid image or video task tools, also set `APIANY_API_KEY`:

```json
{
  "APIANY_BASE_URL": "https://apiany.ai",
  "APIANY_API_KEY": "your_apiany_api_key"
}
```

### 3. Ask Your Agent to Use APIAny

<p align="center">
  <img src="assets/readme/tools.svg" alt="APIAny MCP tool usage in an agent conversation" width="900">
</p>

Example prompts:

```text
Use APIAny MCP to find an image model for product photos, compare pricing, and show JavaScript integration code.
```

```text
Use APIAny MCP to estimate credits for 20 gpt-style chat requests with 10k input tokens and 5k output tokens.
```

```text
Use APIAny MCP to show JavaScript usage for nano-banana-pro and Python usage for veo3-1-fast.
```

## MCP Tools

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

## Agent Skill

The APIAny Integration skill lives in [`skills/apiany-integration`](skills/apiany-integration).

It helps agents:

- Choose APIAny models by modality, provider, pricing, and capability.
- Generate examples for chat, image, video, and media workflows.
- Explain async task creation and polling.
- Require explicit confirmation before paid generation tasks.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `APIANY_BASE_URL` | No | APIAny base URL. Defaults to `https://apiany.ai`. |
| `APIANY_API_KEY` | Only for paid tools | API key used for paid image/video task creation and task polling. |

## Safety Model

Read-only tools work without an API key. Paid generation tools require both:

- `APIANY_API_KEY`
- `confirm_paid_request=true`

The server does not persist API keys. It only reads them from the current process environment.

## Development

```bash
npm install
npm run check
npx -y @modelcontextprotocol/inspector node src/server.js
```

Useful files:

- [`src/server.js`](src/server.js): MCP server implementation.
- [`examples/mcp.json`](examples/mcp.json): client configuration example.
- [`docs/distribution.md`](docs/distribution.md): release checklist for npm, MCP directories, and skill marketplaces.
- [`CHANGELOG.md`](CHANGELOG.md): release history.

## Links

- Website: [https://apiany.ai](https://apiany.ai)
- GitHub: [https://github.com/ailingqu/ApiAny.AI-MCP](https://github.com/ailingqu/ApiAny.AI-MCP)
- npm: [https://www.npmjs.com/package/@apiany-ai/mcp](https://www.npmjs.com/package/@apiany-ai/mcp)
- Models: [https://apiany.ai/models](https://apiany.ai/models)
- Docs context: [https://apiany.ai/llms.txt](https://apiany.ai/llms.txt)

## License

MIT
