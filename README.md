# dsh-model-switch

English | [中文](README.zh.md)

Use the right model for each stage of work in DeepSeek Harness.

The main conversation, subagents, and plan execution serve different purposes. `dsh-model-switch` lets each of them use a suitable model without changing the normal DSH workflow.

## Why use it

- **Match models to tasks** — keep your preferred model in the main conversation and use another model for subagents or plan execution.
- **Avoid repeated switching** — save defaults once instead of changing models before every task.
- **Confirm before execution** — review or change the model directly in the plan approval panel.
- **See what subagents use** — display the model, context window, and reasoning effort, such as `GPT-5.6 Sol 1M Max`.
- **Keep the main model unchanged** — after plan execution, DSH restores the previous main-session model.

## Preview

### Configure model defaults

<img src="docs/settings.png" alt="Model switch settings" width="720" />

### Choose the model for plan execution

<table>
  <tr>
    <td width="50%"><img src="docs/plan.png" alt="Plan awaiting review" /></td>
    <td width="50%"><img src="docs/plan-exec.png" alt="Plan execution model" /></td>
  </tr>
</table>

### See the model used by subagents

<table>
  <tr>
    <td width="50%"><img src="docs/subagent.png" alt="Subagent model overview" /></td>
    <td width="50%"><img src="docs/subagent-detail.png" alt="Subagent model details" /></td>
  </tr>
</table>

## Install

Use the GitHub spec. This plugin is not published as an npm package, so do not use `@lincong1987/dsh-model-switch`.

```bash
dsh plugin --profile web add github:lincong1987/dsh-model-switch
```

Replace `web` with the profile DSH is actually running. DeepSeek Harness Desktop typically uses `desktop`.

Restart DSH after installation.

## Update DSH

This plugin requires DeepSeek Harness **0.1.2-rc.1** or later. DSH has no `dsh update` command — install the version you want the same way you originally installed it.

1. Check the installed version and what npm currently publishes:

```bash
dsh --version
npm view @deepseek-ai/dsh dist-tags
```

As of 2026-09-03, `latest` points to `0.1.1-rc.2`, `next` points to `0.1.2-rc.1` (this plugin's current target), and the `alpha` tag points to `0.1.2-alpha.5`. Pin the exact version (`@0.1.2-rc.1`) when reproducibility matters.

2. **npx (Web):**

```bash
npx --yes @deepseek-ai/dsh@0.1.2-rc.1 web
```

3. **Global npm install:**

```bash
npm install -g @deepseek-ai/dsh@0.1.2-rc.1
dsh --version
```

Then restart `dsh web`. DSH needs Node.js `^22.19.0` or `>=24`.

4. **Desktop:** Fully **Exit** from the tray, then use **Check for Updates** in the app (or install a newer Desktop build). Desktop ships its own packaged `dsh`; updating npm or `npx` does not replace that copy. After Desktop finishes updating, restart it.

DSH is still a developer preview and may change on-disk formats between releases. Back up `~/.dsh` (Windows: `%USERPROFILE%\.dsh`) before jumping versions. In particular, 0.1.0-rc.8 changed the SQLite storage format incompatibly, and 0.1.2-alpha.3 removed the optional SQLite session backend entirely (existing data is kept but needs an older version to export); treat local sessions as non-portable when crossing those boundaries. 0.1.2-alpha.5 fixed upgrading from 0.1.1-rc.2 or 0.1.2-alpha.3 (the app now starts and session list titles are kept); 0.1.2-rc.1 is the current release-candidate line that this plugin targets.

After DSH is on a compatible version, reinstall this plugin as described below.

## Reinstall / after a DSH update

Reinstall the plugin when this repository has a new release, or after you upgrade DeepSeek Harness. The plugin tracks a specific DSH version (currently **0.1.2-rc.1** or later), so a host upgrade should be followed by a plugin reinstall.

1. Update DSH first (see [Update DSH](#update-dsh); skip this step if only the plugin changed).
2. Reinstall with `--force` so DSH refreshes the GitHub source:

```bash
dsh plugin --profile web add --force github:lincong1987/dsh-model-switch
```

3. Restart DSH.

On Desktop, run **one** `plugin add` at a time. Fully **Exit** from the tray (closing the window is not enough), wait until Desktop finishes starting, then reinstall, then Exit and reopen again. If install fails with `another plugin install recovery transaction is pending`, quit Desktop, wait, and retry once. If it is still pending, quit Desktop, delete `%APPDATA%\DSH Desktop\plugin-install-recovery`, reopen Desktop, then run a single `add --force`.

To bypass the Desktop wrapper, run the matching DSH CLI in a normal terminal:

```powershell
npx --yes @deepseek-ai/dsh@0.1.2-rc.1 plugin --profile desktop add --force github:lincong1987/dsh-model-switch
```

## Use

1. Open **Settings → Model switch**.
2. Configure the **Subagent model** and **Plan execution model**:
   - **Follow main model** uses the current conversation model.
   - **Custom** lets you choose a model and reasoning effort.
3. When reviewing a plan, confirm or change the execution model before selecting **Approve**.

The model selected in the plan review panel takes priority over the saved plan-execution setting.

## Compatibility

Requires DeepSeek Harness **0.1.2-rc.1** or later. Settings are stored in the host settings document through the plugin's registered `model-switch` namespace.

Subagent model switching applies to in-process subagents such as `spawn` and `fork`. External-process agents may manage their models independently.

DSH 0.1.2-alpha.1 also introduced a native, agent-driven model selection for subagents (the agent picks provider/model/effort within its authorization). This plugin is complementary: it enforces a fixed, user-configured routing policy instead, and adds the plan-execution model switch, restore, and session model badges.

## Community

<img src="docs/wechat.jpg" alt="WeChat" width="160" />

## Links

- [Linux.do](https://linux.do)

## License

MIT
