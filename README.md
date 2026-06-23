# APIAny MCP

Official APIAny MCP server and agent skill package for model discovery, pricing lookup, documentation context, and OpenAI-compatible integration examples.

## What Is Included

- `src/server.js`: MCP server for APIAny public model discovery, docs context, usage examples, and confirmed paid media tasks.
- `skills/apiany-integration`: Agent skill for choosing APIAny models, estimating credits, and generating safe integration code.
- `examples/mcp.json`: MCP client configuration example.
- `docs/distribution.md`: Release checklist for npm, MCP registries, and skill marketplaces.

## Install MCP

```bash
npx @apiany/mcp
```

During local development from this repository:

```bash
npm install
npm start
```

## Configuration

Environment variables:

- `APIANY_BASE_URL`: APIAny site/API base URL. Defaults to `https://apiany.ai`.
- `APIANY_API_KEY`: optional APIAny API key. Read-only public tools work without it.

## Claude Code / Cursor / VS Code Config Example

```json
{
  "mcpServers": {
    "apiany": {
      "command": "npx",
      "args": ["-y", "@apiany/mcp"],
      "env": {
        "APIANY_BASE_URL": "https://apiany.ai"
      }
    }
  }
}
```

## Tools

- `list_models`: list public APIAny models with pricing and capability metadata.
- `search_models`: search models by text, provider, modality, or capability.
- `get_model`: get one public model by model id or display name.
- `estimate_cost`: estimate credits from public pricing metadata.
- `get_integration_examples`: return cURL, Python, JavaScript, Go, Java, or PHP examples for chat, image, or video models.
- `get_model_usage`: return endpoint, payload, async behavior, and language example for one or more models.
- `get_docs_context`: return compact APIAny documentation context from `/llms.txt`.
- `create_image_task`: create a paid async image task. Requires `APIANY_API_KEY` and `confirm_paid_request=true`.
- `create_video_task`: create a paid async video task. Requires `APIANY_API_KEY` and `confirm_paid_request=true`.
- `get_task_status`: read async task status. Requires `APIANY_API_KEY`.

## Agent Skill

The APIAny Integration skill lives in `skills/apiany-integration`.

It helps agents:

- Choose APIAny models by modality, provider, pricing, and capability.
- Generate examples for chat, image, video, and media workflows.
- Explain async task creation and polling.
- Require explicit confirmation before paid generation tasks.

## Prompt Examples

Ask an agent:

```text
Use the APIAny MCP server to find an image model for product photos, compare pricing, and show a JavaScript integration example.
```

```text
Use APIAny MCP to estimate the credits for 20 requests to gpt-5.5 with 10k input tokens and 5k output tokens.
```

```text
Use APIAny MCP to show JavaScript usage for nano-banana-pro and Python usage for veo3-1-fast.
```

```text
Use APIAny MCP to create an image task with nano-banana-pro after I confirm the paid request, then poll the task status.
```

## Safety

Read-only tools work without an API key. Paid generation tools require `APIANY_API_KEY` and `confirm_paid_request=true`; the server does not persist API keys.

## Development

```bash
npm install
npm run check
```

## License

MIT
