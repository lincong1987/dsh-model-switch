window.__ModuleLoader__.load({
	id: "dsh-model-switch",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/client/locales.js
		/** Locale copy for dsh-model-switch. */
		const zh = {
			nav: "模型切换",
			title: "模型切换",
			intro: "分别为子代理与计划执行选择模型。默认跟随主会话模型。",
			subagentTitle: "子代理模型",
			subagentHint: "in-process 子代理（spawn / fork）启动时生效。调用方已显式指定的 agentOptions 优先。",
			planTitle: "计划执行模型",
			planHint: "确认执行计划时的默认模型。评审面板上的选择优先级更高。",
			modeFollow: "跟随主模型",
			modeCustom: "自定义",
			modelLabel: "模型",
			effortLabel: "推理档位",
			effortDefault: "提供方默认",
			noSession: "请先打开一个普通会话以加载模型列表。",
			loadError: "无法加载模型列表",
			saveError: "保存失败",
			planHeader: "计划待审",
			planDiscuss: "去聊天里说",
			planDecline: "拒绝",
			planApprove: "确认执行",
			planModelLabel: "执行模型"
		};
		const en = {
			nav: "Model switch",
			title: "Model switch",
			intro: "Choose models for subagents and plan execution. Defaults follow the main session model.",
			subagentTitle: "Subagent model",
			subagentHint: "Applies when an in-process subagent (spawn / fork) starts. Explicit tool agentOptions still win.",
			planTitle: "Plan execution model",
			planHint: "Default model when approving a plan. The review-panel picker takes priority.",
			modeFollow: "Follow main model",
			modeCustom: "Custom",
			modelLabel: "Model",
			effortLabel: "Reasoning effort",
			effortDefault: "Provider default",
			noSession: "Open an ordinary session to load the model catalog.",
			loadError: "Failed to load models",
			saveError: "Failed to save",
			planHeader: "Plan awaiting review",
			planDiscuss: "Discuss in chat",
			planDecline: "Decline",
			planApprove: "Approve",
			planModelLabel: "Execution model"
		};
		//#endregion
		//#region lib/client/config-store.js
		/**
		* Browser client for the host config HTTP surface.
		*/
		/** Must match host `CONFIG_ROUTE`. */
		const CONFIG_ROUTE = "/_dsh/model-switch/config";
		/** Simple reactive config store over same-origin HTTP. */
		var ConfigStore = class {
			snapshot = {
				status: "loading",
				value: {},
				error: null
			};
			listeners = /* @__PURE__ */ new Set();
			getSnapshot() {
				return this.snapshot;
			}
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			publish(next) {
				this.snapshot = next;
				for (const listener of this.listeners) listener();
			}
			async load() {
				this.publish({
					...this.snapshot,
					status: "loading",
					error: null
				});
				try {
					const response = await fetch(CONFIG_ROUTE, { credentials: "same-origin" });
					const body = await response.json();
					if (!response.ok || !body.ok || body.value === void 0) throw new Error(body.error?.message ?? `HTTP ${response.status}`);
					this.publish({
						status: "ready",
						value: body.value,
						error: null
					});
				} catch (error) {
					this.publish({
						status: "error",
						value: this.snapshot.value,
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}
			async save(next) {
				this.publish({
					...this.snapshot,
					status: "loading",
					error: null
				});
				try {
					const response = await fetch(CONFIG_ROUTE, {
						method: "POST",
						credentials: "same-origin",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ value: next })
					});
					const body = await response.json();
					if (!response.ok || !body.ok || body.value === void 0) throw new Error(body.error?.message ?? `HTTP ${response.status}`);
					this.publish({
						status: "ready",
						value: body.value,
						error: null
					});
				} catch (error) {
					this.publish({
						status: "error",
						value: this.snapshot.value,
						error: error instanceof Error ? error.message : String(error)
					});
					throw error;
				}
			}
		};
		//#endregion
		//#region \0dsh-css:D:\projects\mini-code\reference\dsh-model-switch\src\client\styles.module.css.mjs
		const css = "._8ziUHW_section{flex-direction:column;gap:1.25rem;max-width:40rem;padding:.25rem 0 1.5rem;display:flex}._8ziUHW_intro{color:var(--dsh-color-text-secondary,#666);margin:0;font-size:.875rem;line-height:1.45}._8ziUHW_block{border-top:1px solid var(--dsh-color-border,#00000014);flex-direction:column;gap:.65rem;padding:.85rem 0 0;display:flex}._8ziUHW_blockTitle{margin:0;font-size:.95rem;font-weight:600}._8ziUHW_hint{color:var(--dsh-color-text-secondary,#666);margin:0;font-size:.8rem;line-height:1.4}._8ziUHW_modes{flex-wrap:wrap;gap:.75rem 1.25rem;display:flex}._8ziUHW_mode{cursor:pointer;align-items:center;gap:.4rem;font-size:.875rem;display:inline-flex}._8ziUHW_picker{flex-direction:column;gap:.5rem;display:flex}._8ziUHW_row{flex-direction:column;gap:.25rem;display:flex}._8ziUHW_label{color:var(--dsh-color-text-secondary,#666);font-size:.75rem}._8ziUHW_select{appearance:none;border:1px solid var(--dsh-color-border,#00000026);background:var(--dsh-color-surface,#fff);color:inherit;border-radius:6px;padding:.4rem .55rem;font-size:.875rem}._8ziUHW_select:disabled{opacity:.55}._8ziUHW_muted{color:var(--dsh-color-text-secondary,#666);margin:0;font-size:.8rem}._8ziUHW_error{color:var(--dsh-color-danger,#c0392b);margin:0;font-size:.8rem}._8ziUHW_frame{width:100%}._8ziUHW_card{border:1px solid var(--dsh-color-border,#0000001a);background:var(--dsh-color-surface,#fff);border-radius:12px;overflow:hidden}._8ziUHW_strip{background:color-mix(in srgb, var(--dsh-color-accent,#3b82f6) 12%, transparent);align-items:center;gap:.45rem;padding:.65rem .9rem;font-size:.8rem;font-weight:600;display:flex}._8ziUHW_dot{background:var(--dsh-color-accent,#3b82f6);border-radius:50%;width:.45rem;height:.45rem}._8ziUHW_body{max-height:min(42vh,28rem);padding:.85rem 1rem;overflow:auto}._8ziUHW_footer{border-top:1px solid var(--dsh-color-border,#00000014);flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.65rem;padding:.7rem .9rem;display:flex}._8ziUHW_feedback{min-height:1.1rem;color:var(--dsh-color-danger,#c0392b);font-size:.75rem}._8ziUHW_actions{flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:.5rem;margin-left:auto;display:flex}._8ziUHW_planPicker{min-width:11rem}";
		const tagId = "dsh-model-switch/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var styles_module_css_default = {
			"actions": "_8ziUHW_actions",
			"block": "_8ziUHW_block",
			"blockTitle": "_8ziUHW_blockTitle",
			"body": "_8ziUHW_body",
			"card": "_8ziUHW_card",
			"dot": "_8ziUHW_dot",
			"error": "_8ziUHW_error",
			"feedback": "_8ziUHW_feedback",
			"footer": "_8ziUHW_footer",
			"frame": "_8ziUHW_frame",
			"hint": "_8ziUHW_hint",
			"intro": "_8ziUHW_intro",
			"label": "_8ziUHW_label",
			"mode": "_8ziUHW_mode",
			"modes": "_8ziUHW_modes",
			"muted": "_8ziUHW_muted",
			"picker": "_8ziUHW_picker",
			"planPicker": "_8ziUHW_planPicker",
			"row": "_8ziUHW_row",
			"section": "_8ziUHW_section",
			"select": "_8ziUHW_select",
			"strip": "_8ziUHW_strip"
		};
		//#endregion
		//#region lib/client/ModelPicker.js
		/**
		* Compact model catalog picker (settings + plan panel). Loads via session.models.
		*/
		function sameSelection(a, b) {
			return a?.provider === b.provider && a.model === b.model && (a.reasoningEffort ?? void 0) === (b.reasoningEffort ?? void 0);
		}
		function ModelPicker({ sessionId, api, value, onChange, t, disabled, className }) {
			const [catalog, setCatalog] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (sessionId === void 0) {
					setCatalog(null);
					setError(null);
					return;
				}
				let cancelled = false;
				setLoading(true);
				setError(null);
				api.sessions.models({ sessionId }).then(({ result }) => {
					if (cancelled) return;
					setLoading(false);
					if (!result.ok) {
						setError(`${result.error.code}: ${result.error.message}`);
						return;
					}
					setCatalog(result.value);
					if (value === void 0) {
						const current = result.value.current;
						if (current.provider && current.model) onChange({
							provider: current.provider,
							model: current.model,
							...current.reasoningEffort === void 0 ? {} : { reasoningEffort: current.reasoningEffort }
						});
					}
				}).catch((cause) => {
					if (cancelled) return;
					setLoading(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
				return () => {
					cancelled = true;
				};
			}, [sessionId, api]);
			const choices = (0, react.useMemo)(() => {
				if (catalog === null) return [];
				return catalog.groups.flatMap((group) => group.models.map((model) => ({
					provider: group.id,
					providerName: group.name,
					model: model.id,
					modelName: model.name,
					reasoning: model.reasoning
				})));
			}, [catalog]);
			const selected = choices.find((c) => c.provider === value?.provider && c.model === value?.model);
			const efforts = selected?.reasoning?.efforts ?? [];
			if (sessionId === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: styles_module_css_default.muted,
				children: t("noSession")
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: [styles_module_css_default.picker, className].filter(Boolean).join(" "),
				children: [
					error !== null ? (0, react_jsx_runtime.jsxs)("p", {
						className: styles_module_css_default.error,
						children: [
							t("loadError"),
							": ",
							error
						]
					}) : null,
					(0, react_jsx_runtime.jsxs)("label", {
						className: styles_module_css_default.row,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: styles_module_css_default.label,
							children: t("modelLabel")
						}), (0, react_jsx_runtime.jsx)("select", {
							className: styles_module_css_default.select,
							disabled: disabled || loading || choices.length === 0,
							value: selected ? `${selected.provider}\0${selected.model}` : "",
							onChange: (event) => {
								const [provider, model] = event.target.value.split("\0");
								if (!provider || !model) return;
								const defaultEffort = choices.find((c) => c.provider === provider && c.model === model)?.reasoning?.defaultEffort;
								onChange({
									provider,
									model,
									...defaultEffort === void 0 ? {} : { reasoningEffort: defaultEffort }
								});
							},
							children: choices.length === 0 ? (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: loading ? "…" : "—"
							}) : choices.map((c) => (0, react_jsx_runtime.jsxs)("option", {
								value: `${c.provider}\0${c.model}`,
								children: [
									c.providerName,
									" / ",
									c.modelName
								]
							}, `${c.provider}/${c.model}`))
						})]
					}),
					efforts.length > 0 ? (0, react_jsx_runtime.jsxs)("label", {
						className: styles_module_css_default.row,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: styles_module_css_default.label,
							children: t("effortLabel")
						}), (0, react_jsx_runtime.jsxs)("select", {
							className: styles_module_css_default.select,
							disabled: disabled || loading,
							value: value?.reasoningEffort ?? "",
							onChange: (event) => {
								if (value === void 0) return;
								const effort = event.target.value;
								onChange({
									provider: value.provider,
									model: value.model,
									...effort.length === 0 ? {} : { reasoningEffort: effort }
								});
							},
							children: [selected?.reasoning?.defaultEffort === void 0 ? (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: t("effortDefault")
							}) : null, efforts.map((effort) => (0, react_jsx_runtime.jsx)("option", {
								value: effort.id,
								children: effort.name
							}, effort.id))]
						})]
					}) : null,
					catalog !== null && value !== void 0 && !sameSelection(value, catalog.current) ? null : null
				]
			});
		}
		//#endregion
		//#region lib/client/SettingsSection.js
		/**
		* Settings section: 模型切换 — subagent + plan-execute routes.
		*/
		function RouteBlock(props) {
			const { field, title, hint, route, onChange, sessionId, api, t, busy } = props;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: styles_module_css_default.block,
				children: [
					(0, react_jsx_runtime.jsx)("h3", {
						className: styles_module_css_default.blockTitle,
						children: title
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: styles_module_css_default.hint,
						children: hint
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: styles_module_css_default.modes,
						role: "radiogroup",
						"aria-label": title,
						children: [(0, react_jsx_runtime.jsxs)("label", {
							className: styles_module_css_default.mode,
							children: [(0, react_jsx_runtime.jsx)("input", {
								type: "radio",
								name: `model-switch-${field}`,
								checked: route.mode !== "custom",
								disabled: busy,
								onChange: () => {
									onChange({
										mode: "follow-main",
										selection: route.selection
									});
								}
							}), t("modeFollow")]
						}), (0, react_jsx_runtime.jsxs)("label", {
							className: styles_module_css_default.mode,
							children: [(0, react_jsx_runtime.jsx)("input", {
								type: "radio",
								name: `model-switch-${field}`,
								checked: route.mode === "custom",
								disabled: busy,
								onChange: () => {
									onChange({
										mode: "custom",
										selection: route.selection
									});
								}
							}), t("modeCustom")]
						})]
					}),
					route.mode === "custom" ? (0, react_jsx_runtime.jsx)(ModelPicker, {
						sessionId,
						api,
						value: route.selection,
						disabled: busy,
						t,
						onChange: (selection) => {
							onChange({
								mode: "custom",
								selection
							});
						}
					}) : null
				]
			});
		}
		function SettingsSection(props) {
			const { store, api, currentSessionId, t } = props;
			if (store === void 0 || api === void 0 || currentSessionId === void 0 || t === void 0) return null;
			const snap = (0, react.useSyncExternalStore)((listener) => store.subscribe(listener), () => store.getSnapshot());
			const value = snap.value;
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [sessionId, setSessionId] = (0, react.useState)(currentSessionId());
			(0, react.useEffect)(() => {
				store.load();
			}, [store]);
			(0, react.useEffect)(() => {
				const tick = () => {
					setSessionId(currentSessionId());
				};
				tick();
				const id = window.setInterval(tick, 1e3);
				return () => {
					window.clearInterval(id);
				};
			}, [currentSessionId]);
			const subagent = (0, react.useMemo)(() => value.subagent ?? { mode: "follow-main" }, [value.subagent]);
			const planExecute = (0, react.useMemo)(() => value.planExecute ?? { mode: "follow-main" }, [value.planExecute]);
			const writeRoute = (field, next) => {
				setBusy(true);
				setError(null);
				const payload = {
					...value,
					[field]: next
				};
				store.save(payload).then(() => {
					setBusy(false);
				}).catch((cause) => {
					setBusy(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: styles_module_css_default.section,
				children: [
					(0, react_jsx_runtime.jsx)("h2", {
						style: {
							margin: 0,
							fontSize: "1.1rem"
						},
						children: t("title")
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: styles_module_css_default.intro,
						children: t("intro")
					}),
					error !== null || snap.error !== null ? (0, react_jsx_runtime.jsxs)("p", {
						className: styles_module_css_default.error,
						children: [
							t("saveError"),
							": ",
							error ?? snap.error
						]
					}) : null,
					(0, react_jsx_runtime.jsx)(RouteBlock, {
						field: "subagent",
						title: t("subagentTitle"),
						hint: t("subagentHint"),
						route: subagent,
						sessionId,
						api,
						t,
						busy: busy || snap.status === "loading",
						onChange: (next) => {
							writeRoute("subagent", next);
						}
					}),
					(0, react_jsx_runtime.jsx)(RouteBlock, {
						field: "planExecute",
						title: t("planTitle"),
						hint: t("planHint"),
						route: planExecute,
						sessionId,
						api,
						t,
						busy: busy || snap.status === "loading",
						onChange: (next) => {
							writeRoute("planExecute", next);
						}
					})
				]
			});
		}
		//#endregion
		//#region lib/shared.js
		/** Resolve a route to an explicit selection, or undefined when following main. */
		function resolveCustomSelection(route) {
			if (route?.mode !== "custom") return void 0;
			const selection = route.selection;
			if (selection === void 0) return void 0;
			const provider = selection.provider.trim();
			const model = selection.model.trim();
			if (provider.length === 0 || model.length === 0) return void 0;
			const effort = selection.reasoningEffort?.trim();
			return {
				provider,
				model,
				...effort !== void 0 && effort.length > 0 ? { reasoningEffort: effort } : {}
			};
		}
		/** Effective selection for plan execute: panel override > settings custom > undefined (main). */
		function resolvePlanExecuteSelection(settings, panelOverride) {
			if (panelOverride !== void 0) {
				const provider = panelOverride.provider.trim();
				const model = panelOverride.model.trim();
				if (provider.length > 0 && model.length > 0) {
					const effort = panelOverride.reasoningEffort?.trim();
					return {
						provider,
						model,
						...effort !== void 0 && effort.length > 0 ? { reasoningEffort: effort } : {}
					};
				}
			}
			return resolveCustomSelection(settings?.planExecute);
		}
		//#endregion
		//#region lib/client/PlanReviewPanel.js
		/**
		* Enhanced plan-review panel with execution-model picker before Approve.
		*/
		function tooltip(description) {
			return description === void 0 ? {} : { title: description };
		}
		function PlanReviewPanel({ pending, review, store, api, t }) {
			const snap = (0, react.useSyncExternalStore)((listener) => store.subscribe(listener), () => store.getSnapshot());
			const settingsSelection = (0, react.useMemo)(() => resolveCustomSelection(snap.value.planExecute), [snap.value.planExecute]);
			const [panelSelection, setPanelSelection] = (0, react.useState)(void 0);
			const [initialized, setInitialized] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				store.load();
			}, [store]);
			(0, react.useEffect)(() => {
				if (initialized) return;
				if (settingsSelection !== void 0) {
					setPanelSelection(settingsSelection);
					setInitialized(true);
					return;
				}
				setInitialized(true);
			}, [initialized, settingsSelection]);
			const settle = (send) => {
				setBusy(true);
				setError(null);
				send().catch((cause) => {
					setBusy(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
			};
			const approve = () => {
				settle(async () => {
					const effective = resolvePlanExecuteSelection(snap.value, panelSelection);
					if (effective !== void 0) {
						const { result } = await api.sessions.selectModel({
							sessionId: pending.sessionId,
							provider: effective.provider,
							model: effective.model,
							...effective.reasoningEffort === void 0 ? {} : { reasoningEffort: effective.reasoningEffort }
						});
						if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
					}
					await pending.answer({ answers: [{
						id: review.id,
						selected: [review.approve.label]
					}] });
				});
			};
			const decide = (label) => {
				settle(() => pending.answer({ answers: [{
					id: review.id,
					selected: [label]
				}] }));
			};
			const decline = review.decline;
			return (0, react_jsx_runtime.jsx)("div", {
				className: styles_module_css_default.frame,
				"data-plan-review-key": pending.key,
				"data-model-switch-plan": "",
				children: (0, react_jsx_runtime.jsxs)("section", {
					className: styles_module_css_default.card,
					"aria-label": review.question,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: styles_module_css_default.strip,
							children: [(0, react_jsx_runtime.jsx)("span", { className: styles_module_css_default.dot }), t("planHeader")]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: styles_module_css_default.body,
							"data-plan-review-scroll": true,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, { text: review.plan })
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: styles_module_css_default.footer,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: styles_module_css_default.feedback,
								role: "status",
								children: error
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: styles_module_css_default.actions,
								children: [
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "ghost",
										icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, { size: 14 }),
										disabled: busy,
										onClick: () => {
											settle(() => pending.cancel());
										},
										children: t("planDiscuss")
									}),
									decline !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										...tooltip(decline.description),
										disabled: busy,
										onClick: () => {
											decide(decline.label);
										},
										children: t("planDecline")
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: styles_module_css_default.planPicker,
										"aria-label": t("planModelLabel"),
										children: (0, react_jsx_runtime.jsx)(ModelPicker, {
											sessionId: pending.sessionId,
											api,
											value: panelSelection,
											disabled: busy,
											t,
											onChange: setPanelSelection
										})
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										...tooltip(review.approve.description),
										disabled: busy,
										onClick: () => {
											approve();
										},
										children: t("planApprove")
									})
								]
							})]
						})
					]
				})
			});
		}
		//#endregion
		//#region lib/client/plan-review.js
		/**
		* Local plan-review helpers (copied contract; avoid cross-plugin value imports).
		*/
		function planReviewOf(questions) {
			if (questions.length !== 1) return void 0;
			const question = questions[0];
			const intent = question.intent;
			if (intent?.kind !== "plan-review" || question.detail === void 0) return void 0;
			if (question.multiSelect === true) return void 0;
			const options = question.options ?? [];
			if (options.length > 2) return void 0;
			const approve = options.find((option) => option.label === intent.approve);
			if (approve === void 0) return void 0;
			const decline = options.find((option) => option.label !== intent.approve);
			return {
				id: question.id,
				question: question.question,
				plan: question.detail,
				approve,
				...decline === void 0 ? {} : { decline }
			};
		}
		var PendingQuestion = class {
			wait;
			constructor(wait) {
				this.wait = wait;
			}
			get key() {
				return this.wait.key;
			}
			get questions() {
				return this.wait.payload.questions;
			}
			get sessionId() {
				return this.wait.sessionId;
			}
			async answer(answer) {
				const receipt = await this.wait.respond({
					ok: true,
					value: {
						sessionId: this.wait.sessionId,
						answer
					}
				});
				if (!receipt.accepted) throw new Error(`question response rejected: ${receipt.reason}`);
			}
			async cancel() {
				const receipt = await this.wait.respond({
					ok: false,
					error: {
						code: "cancelled",
						message: "the user closed this question request",
						details: {}
					}
				});
				if (!receipt.accepted) throw new Error(`question cancellation rejected: ${receipt.reason}`);
			}
		};
		//#endregion
		//#region lib/client/PlanReviewComposer.js
		/**
		* Composer-chain entry that claims plan-review waits (higher priority than stock).
		*/
		/** Select only plan-review question waits. */
		function selectPlanReview({ interactions }) {
			const wait = interactions.find((item) => item.kind === "question");
			if (wait === void 0) return null;
			if (planReviewOf(wait.payload.questions) === void 0) return null;
			return wait;
		}
		function PlanReviewComposer(props) {
			const { matched, store, api, t } = props;
			const pending = (0, react.useMemo)(() => new PendingQuestion(matched), [matched]);
			const review = (0, react.useMemo)(() => planReviewOf(pending.questions), [pending]);
			if (store === void 0 || api === void 0 || t === void 0 || review === void 0) return null;
			return (0, react_jsx_runtime.jsx)(PlanReviewPanel, {
				pending,
				review,
				store,
				api,
				t
			});
		}
		//#endregion
		//#region lib/client/index.js
		/**
		* Browser half of dsh-model-switch: settings section + plan-review composer takeover.
		*/
		const NS = "model-switch";
		const inject = [
			"slots",
			"locale",
			"connection",
			"sessions"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "model-switch: dictionaries");
			const t = ctx.locale.bind(NS);
			const connection = ctx.get("connection");
			const store = new ConfigStore();
			const settingsInject = () => ({
				store,
				api: connection.api,
				currentSessionId: () => ctx.sessions.list.getSnapshot().current,
				t
			});
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "model-switch",
				order: 80,
				label: () => t("nav"),
				inject: settingsInject
			}, SettingsSection));
			const planInject = () => ({
				store,
				api: connection.api,
				t
			});
			ctx.slots.inject("conversation.composer", () => ctx.slots.register({
				name: "conversation.composer",
				select: selectPlanReview,
				priority: -10,
				locale: NS,
				inject: planInject
			}, PlanReviewComposer));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map