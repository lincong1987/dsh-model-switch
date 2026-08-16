# dsh-model-switch

English | [中文](README.zh.md)

DeepSeek Harness plugin: choose models for **subagents** and **plan execution** separately from the main session model.

## Features

1. **Settings → Model switch**
   - Subagent model: follow main / custom (picker like the composer model seat)
   - Plan execution model: follow main / custom
2. **Plan review panel**
   - Model picker immediately before **Approve**
   - Panel choice overrides settings; settings override “follow main”

## Install

```bash
dsh plugin --profile <your-profile> add github:lincong1987/dsh-model-switch
# restart the profile / host
```

Local development:

```bash
pnpm install --ignore-workspace
pnpm build
dsh plugin --profile <your-profile> add link:/absolute/path/to/dsh-model-switch
```

Settings are persisted through the host route `/_dsh/model-switch/config` (third-party namespaces are not on the Web `settings.*` allowlist).

If the settings tab does not appear after a `github:` install, ensure the bundle patch row is present in the profile `cordis.patch.yml`:

```yaml
- insert:
    - id: model-switch
      name: dsh-model-switch
```

## Behaviour notes

- Subagent override targets **in-process** backends (`spawn` / `fork`). Out-of-process ACP / Codex / Claude Code children typically ignore `agentOptions`.
- Explicit `tool-subagent` `agentOptions` in the composition still win over this plugin’s settings.
- Approving a plan with a custom execution model calls `session.selectModel` before answering `exit_plan_mode` (same effect as switching the session model, then approving).

## Publish

Repository: https://github.com/lincong1987/dsh-model-switch

```bash
cd /path/to/dsh-model-switch
git init   # if needed
git add .
git commit -m "feat: initial dsh-model-switch plugin"
git remote add origin https://github.com/lincong1987/dsh-model-switch.git
git pull origin main --allow-unrelated-histories   # keep existing LICENSE
git push -u origin main
git tag v0.1.0 && git push origin v0.1.0
```

Optional npm: `npm publish` after `pnpm build`.

## License

MIT
