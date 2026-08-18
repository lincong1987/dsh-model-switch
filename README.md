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

```bash
dsh plugin --profile web add github:lincong1987/dsh-model-switch
```

Restart DSH after installation.

## Use

1. Open **Settings → Model switch**.
2. Configure the **Subagent model** and **Plan execution model**:
   - **Follow main model** uses the current conversation model.
   - **Custom** lets you choose a model and reasoning effort.
3. When reviewing a plan, confirm or change the execution model before selecting **Approve**.

The model selected in the plan review panel takes priority over the saved plan-execution setting.

## Compatibility

Requires DeepSeek Harness **0.1.0-rc.7** or later. Settings are stored in the host settings document through the plugin's registered `model-switch` namespace.

Subagent model switching applies to in-process subagents such as `spawn` and `fork`. External-process agents may manage their models independently.

## Community

<img src="docs/wechat.jpg" alt="WeChat" width="160" />

## Links

- [Linux.do](https://linux.do)

## License

MIT
