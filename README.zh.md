# dsh-model-switch

[English](README.md) | 中文

DeepSeek Harness 插件：让**子代理**与**计划执行**可以独立于主会话切换模型。

## 功能

1. **设置 → 模型切换**
   - 子代理模型：跟随主模型 / 自定义（类似对话栏模型选择）
   - 计划执行模型：跟随主模型 / 自定义
2. **计划待审面板**
   - 在「确认执行」按钮前提供执行模型选择
   - 优先级：面板选择 > 设置 > 跟随主模型

## 安装

```bash
dsh plugin --profile <你的profile> add github:lincong1987/dsh-model-switch
# 重启该 profile / host
```

本地开发：

```bash
pnpm install --ignore-workspace
pnpm build
dsh plugin --profile <你的profile> add link:/绝对路径/dsh-model-switch
```

设置经 host 路由 `/_dsh/model-switch/config` 持久化（第三方 settings namespace 不在 Web `settings.*` 白名单内）。

若 `github:` 安装后没有出现设置页签，请确认 profile 的 `cordis.patch.yml` 已插入：

```yaml
- insert:
    - id: model-switch
      name: dsh-model-switch
```

## 行为说明

- 子代理覆盖主要对 **in-process** 后端（`spawn` / `fork`）生效；ACP / Codex / Claude Code 等外进程子代理通常不读 `agentOptions`。
- 组合里 `tool-subagent` 已显式配置的 `agentOptions` 优先于本插件设置。
- 计划确认执行时若选用自定义模型，会先 `session.selectModel` 再回答 `exit_plan_mode`（等价于先切会话模型再确认）。

## 发布

仓库：https://github.com/lincong1987/dsh-model-switch

```bash
cd /path/to/dsh-model-switch
git init   # 如需要
git add .
git commit -m "feat: initial dsh-model-switch plugin"
git remote add origin https://github.com/lincong1987/dsh-model-switch.git
git pull origin main --allow-unrelated-histories   # 保留已有 LICENSE
git push -u origin main
git tag v0.1.0 && git push origin v0.1.0
```

可选 npm：`pnpm build` 后 `npm publish`。

## 许可证

MIT
