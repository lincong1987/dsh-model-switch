# dsh-model-switch

[English](README.md) | 中文

为 DeepSeek Harness 的不同工作阶段选择更合适的模型。

主会话、子代理和计划执行承担的任务不同，一个模型未必适合所有场景。`dsh-model-switch` 让它们可以分别使用合适的模型，同时保留原有的 DSH 使用流程。

## 为什么使用

- **按任务选择模型**：主会话保留熟悉的模型，子代理和计划执行可使用更适合各自任务的模型。
- **减少重复切换**：设置一次默认选项，不必在每次任务开始前手动改模型。
- **执行前仍可确认**：在计划待审面板中查看或调整本次执行使用的模型。
- **清楚子代理在用什么**：显示模型、上下文窗口和思考等级，例如 `GPT-5.6 Sol 1M Max`。
- **不影响主会话选择**：计划执行结束后，DSH 会恢复原来的主会话模型。

## 使用效果

### 设置默认模型

<img src="docs/settings.png" alt="模型切换设置" width="720" />

### 选择计划执行模型

<table>
  <tr>
    <td width="50%"><img src="docs/plan.png" alt="计划待审" /></td>
    <td width="50%"><img src="docs/plan-exec.png" alt="计划执行模型" /></td>
  </tr>
</table>

### 查看子代理使用的模型

打开子代理会话后，可在会话标题栏查看模型、上下文窗口和思考等级。

<img src="docs/subagent-detail.png" alt="会话标题栏中的子代理模型徽标" width="720" />

## 安装

请使用 GitHub 安装源。本插件未发布到 npm，不要使用 `@lincong1987/dsh-model-switch`。

```bash
dsh plugin --profile web add github:lincong1987/dsh-model-switch
```

将 `web` 换成 DSH 实际正在使用的 profile。DeepSeek Harness Desktop 一般是 `desktop`。

安装完成后重启 DSH。

## 如何更新 DSH

本插件已在 DeepSeek Harness **0.2.0-rc.2** 上构建并通过类型检查；清单声明的 peer 范围为 `^0.2.0-rc.2`，本次没有对范围外版本做运行时验证。

更新 DSH 时请使用你当前安装渠道提供的版本。Desktop 自带打包版 `dsh`，应通过应用内更新；更新 npm / `npx` 不会替换 Desktop 内置版本。跨越可能改变磁盘格式的 DSH 版本前，先按发行说明操作并备份 `~/.dsh`（Windows：`%USERPROFILE%\.dsh`）。

升级 DSH 后，按下一节用 `--force` 重装本插件。

## 重装 / DSH 更新后如何安装

本仓库更新或升级 DSH 后，请重装插件。本次改动已在 **0.2.0-rc.2** 上构建并通过类型检查；后续版本未在本次修改中进行运行时验证。

1. 先更新 DSH（见 [如何更新 DSH](#如何更新-dsh)；如果只是插件更新，可跳过这一步）。
2. 使用 `--force` 重装，让 DSH 重新拉取 GitHub 源：

```bash
dsh plugin --profile web add --force github:lincong1987/dsh-model-switch
```

3. 重启 DSH。

在 Desktop 上，一次只执行 **一条** `plugin add`。请从托盘完全 **退出**（只关窗口不够），等 Desktop 启动完成后再重装，然后再次退出并重新打开。如果安装报错 `another plugin install recovery transaction is pending`，先退出 Desktop，等它完成启动后再试一次。若仍然卡住，退出 Desktop，删除 `%APPDATA%\DSH Desktop\plugin-install-recovery`，重新打开后再执行一次 `add --force`。

若要绕过 Desktop 包装器，可在普通终端里直接跑对应版本的 DSH CLI：

```powershell
dsh plugin --profile desktop add --force github:lincong1987/dsh-model-switch
```

## 使用

1. 打开 **设置 → 模型切换**。
2. 分别配置 **子代理模型** 和 **计划执行模型**：
   - **跟随主模型**：使用当前主会话模型。
   - **自定义**：选择模型和思考等级。
3. 创建计划后，在计划待审面板中确认或调整执行模型，再点击 **确认执行**。

计划待审面板中的选择优先于设置中保存的计划执行模型。

## 兼容性

本版本在 DeepSeek Harness **0.2.0-rc.2** 上构建并通过类型检查（peer 范围 `^0.2.0-rc.2`）。设置属于插件入口经过校验的 `Config`，通过 DSH settings Remote 写入 id 为 `model-switch` 的 Loader 项。

子代理模型切换适用于 `spawn`、`fork` 等进程内子代理。外部进程代理可能独立管理自己的模型。

DSH 0.1.2-alpha.1 起官方也原生支持了子代理模型选择（由 Agent 在授权范围内自主挑选提供方 / 模型 / 思考等级）。本插件与其互补：这里强制的是用户固定配置的路由策略，并提供计划执行模型切换与恢复、会话模型徽标等增量能力。

## 交流

<img src="docs/wechat.jpg" alt="微信" width="160" />

## 友情链接

- [Linux.do 社区](https://linux.do)

## 许可证

MIT
