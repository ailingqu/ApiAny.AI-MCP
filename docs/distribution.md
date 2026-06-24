# APIAny MCP and Skill Distribution

This document is the release checklist for publishing the APIAny MCP server and APIAny Integration skill.

## Artifacts

- MCP package: repository root
- npm package name: `@apiany-ai/mcp`
- Skill package: `skills/apiany-integration`
- Planning doc: `docs/plan.md`

## MCP Package

The MCP server exposes public APIAny model discovery and safe paid media task helpers.

Tools:

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

Paid tools require `APIANY_API_KEY` and `confirm_paid_request=true`.

## Local Install Example

```json
{
  "mcpServers": {
    "apiany": {
      "command": "npx",
      "args": ["-y", "@apiany-ai/mcp"],
      "env": {
        "APIANY_API_KEY": "<optional-for-paid-tools>"
      }
    }
  }
}
```

## Skill Package

The skill teaches an agent how to:

- Choose APIAny models by modality, provider, pricing, and capability.
- Generate OpenAI-compatible integration examples.
- Use image and video task endpoints safely.
- Poll task status and report credits/results.

Skill UI metadata is stored in `skills/apiany-integration/agents/openai.yaml`.

## Release Checklist

1. Confirm npm organization and token for `@apiany`.
2. Confirm npm registry package visibility and release account.
3. Run MCP validation:
   - `npm install`
   - `npm run check`
   - smoke-test `list_models` against `https://apiany.ai/api/v1/models`
4. Publish MCP package:
   - `npm publish --access public`
5. Package the skill folder for target Skill marketplaces.
6. Update marketplace listings with:
   - Display name: `APIAny Integration`
   - Short description: `Use APIAny models, pricing, and media tasks`
   - Official logo assets from `skills/apiany-integration/assets`
7. After publishing, add the marketplace/install URLs back into this document.

## Blockers

- npm publish requires an APIAny-owned npm account/token.
- Public distribution uses the project MIT license.
- Skill marketplace submission requires platform-specific account access.
- Paid endpoint live tests require an APIAny API key and explicit spend approval.
