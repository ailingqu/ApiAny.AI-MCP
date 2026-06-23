# APIAny MCP + Skills Implementation Plan

## Objective

Build an APIAny agent distribution layer so AI coding agents and assistant hosts can discover APIAny models, compare pricing, generate integration examples, and eventually call APIAny media/task APIs through a standard MCP server plus reusable agent skills.

## Product Shape

- `@apiany/mcp`: an MCP server package installable by `npx`, usable from Claude Code, Cursor, VS Code, Windsurf, Roo, and other MCP-compatible hosts.
- `skills/apiany-integration`: a reusable agent skill that teaches Codex/agent runtimes how to select APIAny models, migrate OpenAI-compatible clients, and estimate costs.
- Documentation pages: installation guide, host configuration examples, tool reference, publishing guide, and safety notes.
- Distribution metadata: README badges, platform descriptions, screenshots, example configs, and submission copy for MCP registries.

## Phase 1: Read-Only MCP MVP

Scope:
- No paid generation.
- No database writes.
- No local credential storage.
- Uses public APIAny endpoints and public docs by default.

Tools:
- `list_models`: list public APIAny models, optionally filtered by query or model type.
- `search_models`: search by model name, provider, modality, capability, or natural-language query.
- `get_model`: fetch one model's public details.
- `get_model_usage`: return endpoint, payload, async behavior, and language examples for one or more models.
- `estimate_cost`: estimate credits for token/request-based models using public pricing metadata.
- `get_integration_examples`: return cURL, Python, JavaScript, Go, Java, and PHP examples.
- `get_docs_context`: return a compact APIAny docs context from `/llms.txt`.

Configuration:
- `APIANY_BASE_URL`, default `https://apiany.ai`.
- `APIANY_API_KEY`, optional. Read-only tools work without it when public endpoints are enough.

Acceptance:
- MCP server starts from `npx @apiany/mcp`.
- `tools/list` exposes the MVP tools.
- `tools/call` returns structured text/JSON.
- No secrets are printed.
- Works with a local MCP inspector or at least has a smoke command.

## Phase 2: Agent Skills

Skills:
- `apiany-integration`: migrate apps from OpenAI base URL to APIAny.
- `apiany-model-selection`: choose a model by modality, cost, latency, and workflow.
- `apiany-media-generation`: use image/video/task endpoints safely.
- `apiany-cost-optimizer`: estimate and reduce credit usage.

Acceptance:
- Each skill has `SKILL.md` with trigger description, workflow, safety rules, and examples.
- Skills reference MCP tools when available, but also work from docs if MCP is not installed.
- Skills avoid telling agents to expose user API keys.

## Phase 3: Paid/Write Tools

Add only after read-only MCP is validated:
- `create_image_task`
- `create_video_task`
- `get_task_status`
- `cancel_task` if API supports it

Safety:
- Require `APIANY_API_KEY`.
- Clearly mark paid tools.
- Add optional confirmation instructions for agent hosts that support confirmation.
- Never persist API keys.
- Mask keys in logs and returned errors.

## Phase 4: Distribution

Targets:
- npm: `@apiany/mcp`
- GitHub Releases
- Official MCP Registry
- Smithery
- Glama
- MCP.so
- PulseMCP
- APIAny documentation site

Required assets:
- Package README
- Tool list
- Host config snippets
- Logo/icon
- Short description
- Long description
- Demo screenshots or GIF
- Security notes
- Example prompts

## Required User Cooperation

- Confirm npm package scope/name: confirmed `@apiany/mcp`.
- Public package license confirmed as MIT for this project.
- Provide npm publish access or publish token when ready.
- Provide access to MCP registry accounts if submissions should be done by the agent.
- Confirm whether paid generation tools are allowed in Phase 3: confirmed, include model-specific usage and generation workflows.
- Confirm APIAny public base URL and docs URL for final package metadata.
- Provide preferred logo/icon assets for registry listings: use official website assets unless replaced later.

## Current Progress

- Plan document created.
- Read-only MCP package scaffolded at the repository root.
- Public model discovery, pricing estimation, docs context, integration examples, and model usage examples implemented.
- Paid image/video task creation tools implemented with explicit confirmation guard.
- User-scoped task status lookup implemented.
- Initial `apiany-integration` skill created with standard Skill frontmatter and OpenAI UI metadata.
- Official website logo/favicon copied into the skill assets folder for distribution.
- Distribution checklist added at `docs/distribution.md`.
- MCP package license set to MIT.
- NPM package name confirmed as `@apiany/mcp`.
- Registry publishing is waiting for user-provided account access.

## Implementation Order

1. Add this plan document.
2. Add standalone MCP package skeleton at the repository root.
3. Implement read-only tools against public APIAny endpoints.
4. Add smoke test and README install examples.
5. Add initial `skills/apiany-integration/SKILL.md`.
6. Validate locally.
7. Add paid task tools and skill distribution metadata.
8. Validate locally.
9. Commit to `dev`, deploy docs/site changes if any.
10. Publish to npm and target MCP/Skill registries after account access is available.
