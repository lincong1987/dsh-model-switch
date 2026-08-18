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

<table>
  <tr>
    <td width="50%"><img src="docs/subagent.png" alt="子代理模型概览" /></td>
    <td width="50%"><img src="docs/subagent-detail.png" alt="子代理模型详情" /></td>
  </tr>
</table>

## 安装

```bash
dsh plugin --profile web add github:lincong1987/dsh-model-switch
```

安装完成后重启 DSH。

## 使用

1. 打开 **设置 → 模型切换**。
2. 分别配置 **子代理模型** 和 **计划执行模型**：
   - **跟随主模型**：使用当前主会话模型。
   - **自定义**：选择模型和思考等级。
3. 创建计划后，在计划待审面板中确认或调整执行模型，再点击 **确认执行**。

计划待审面板中的选择优先于设置中保存的计划执行模型。

## 兼容性

需要 DeepSeek Harness **0.1.0-rc.7** 或更高版本。设置通过插件注册的 `model-switch` 命名空间写入宿主设置文档。

子代理模型切换适用于 `spawn`、`fork` 等进程内子代理。外部进程代理可能独立管理自己的模型。

## 交流

<img src="docs/wechat.jpg" alt="微信" width="160" />

## 友情链接

- [Linux.do 社区](https://linux.do)

## 许可证

MIT
