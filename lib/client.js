window.__ModuleLoader__.load({
	id: "dsh-model-switch",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
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
			triggerFallback: "选择模型",
			triggerSelectAria: "选择模型",
			menuAria: "模型与推理档位",
			statusLoading: "加载中…",
			emptyModels: "暂无可用模型",
			emptyEfforts: "当前模型无推理档位",
			retry: "重试",
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
			triggerFallback: "Select model",
			triggerSelectAria: "Select model",
			menuAria: "Model and reasoning effort",
			statusLoading: "Loading…",
			emptyModels: "No models available",
			emptyEfforts: "No reasoning efforts for this model",
			retry: "Retry",
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
		//#region lib/client/IconModelSwitch.js
		const PATH = "M833.536 307.2a22.1184 22.1184 0 0 0-13.4144-19.5584L475.4432 114.9952a19.7632 19.7632 0 0 0-17.6128 0L113.3568 287.3344C100.5568 295.7312 102.4 314.368 102.4 316.3136V684.032a19.8656 19.8656 0 0 0 9.5232 16.7936s337.1008 203.6736 342.9376 206.2336a25.088 25.088 0 0 0 24.7808 1.4336l112.64-64.9216c9.6256-5.5296 10.24-14.1312 9.1136-28.7744s-14.0288-22.6304-23.4496-17.2032-83.6608 50.0736-83.6608 50.0736V512l296.96-173.056 30.72-18.944A24.576 24.576 0 0 0 833.536 307.2zM440.32 843.5712L153.6 668.8768V347.4432L440.32 512v331.4688z m26.2144-385.2288L194.56 303.9232l272.4864-136.192 272.384 136.192z m448.1024 271.5648l-153.088 92.16a15.6672 15.6672 0 0 1-17.6128-0.7168c-0.9216 0-152.4736-91.136-152.4736-91.136a14.6432 14.6432 0 0 1-7.168-12.5952V552.96a20.48 20.48 0 0 1 13.6192-18.8416l148.48-81.92a15.2576 15.2576 0 0 1 13.0048 0l148.7872 81.92h-1.2288a3.4816 3.4816 0 0 1 1.4336 0l3.8912 1.9456a14.6432 14.6432 0 0 1 9.3184 12.6976V716.8a15.1552 15.1552 0 0 1-6.9632 12.6976zM641.6384 549.9904l110.4896 62.0544 112.0256-62.0544-112.0256-61.44zM774.144 774.656l112.64-68.096V583.68l-112.64 64z m-40.0384-1.9456V648.6016l-110.7968-62.6688v120.0128l110.7968 66.7648z m0 0";
		function IconModelSwitch({ size = 16, className, ...rest }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 1024 1024",
				width: size,
				height: size,
				className,
				"aria-hidden": true,
				focusable: "false",
				...rest,
				children: (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					d: PATH
				})
			});
		}
		//#endregion
		//#region \0dsh-css:D:\projects\mini-code\reference\dsh-model-switch\src\client\ModelPicker.module.css.mjs
		const css$3 = ".PIFP8G_root{min-width:0;position:relative}.PIFP8G_trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}.PIFP8G_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.PIFP8G_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}.PIFP8G_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.PIFP8G_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.PIFP8G_triggerEffort{color:var(--dsw-alias-label-caption);flex:none}.PIFP8G_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}.PIFP8G_chevronOpen{transform:rotate(180deg)}.PIFP8G_menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(240px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;overflow:hidden}.PIFP8G_menuTop{bottom:calc(100% + 8px);right:0}.PIFP8G_menuBottom{top:calc(100% + 8px);left:0}.PIFP8G_status,.PIFP8G_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}.PIFP8G_error{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}.PIFP8G_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}.PIFP8G_groups{min-height:0;overflow-y:auto}.PIFP8G_group+.PIFP8G_group{margin-top:4px}.PIFP8G_groupTitle{z-index:1;background:var(--dsw-specific-menu);color:var(--dsw-alias-label-tertiary);padding:5px 8px 3px;font-size:12px;font-weight:500;line-height:18px;position:sticky;top:0}.PIFP8G_option{width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}.PIFP8G_option:hover:not(:disabled),.PIFP8G_option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.PIFP8G_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.PIFP8G_optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}.PIFP8G_modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.PIFP8G_description{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.PIFP8G_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}.PIFP8G_cell{width:100%;height:40px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;align-items:center;gap:8px;padding:0 10px;font-size:14px;line-height:22px;display:flex}.PIFP8G_cell:hover{background:var(--dsw-alias-interactive-bg-hover)}.PIFP8G_cellLabel{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.PIFP8G_cellValue{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-tertiary);flex:0 auto;overflow:hidden}.PIFP8G_cellChevron{color:var(--dsw-alias-label-tertiary);flex:none}.PIFP8G_muted{color:var(--dsw-alias-label-tertiary,#666);margin:0;font-size:.8rem}";
		const tagId$3 = "dsh-model-switch/ModelPicker.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var ModelPicker_module_css_default = {
			"cell": "PIFP8G_cell",
			"cellChevron": "PIFP8G_cellChevron",
			"cellLabel": "PIFP8G_cellLabel",
			"cellValue": "PIFP8G_cellValue",
			"check": "PIFP8G_check",
			"chevron": "PIFP8G_chevron",
			"chevronOpen": "PIFP8G_chevronOpen",
			"description": "PIFP8G_description",
			"empty": "PIFP8G_empty",
			"error": "PIFP8G_error",
			"group": "PIFP8G_group",
			"groupTitle": "PIFP8G_groupTitle",
			"groups": "PIFP8G_groups",
			"menu": "PIFP8G_menu",
			"menuBottom": "PIFP8G_menuBottom",
			"menuTop": "PIFP8G_menuTop",
			"modelName": "PIFP8G_modelName",
			"muted": "PIFP8G_muted",
			"option": "PIFP8G_option",
			"optionCopy": "PIFP8G_optionCopy",
			"retry": "PIFP8G_retry",
			"root": "PIFP8G_root",
			"status": "PIFP8G_status",
			"trigger": "PIFP8G_trigger",
			"triggerEffort": "PIFP8G_triggerEffort",
			"triggerLabel": "PIFP8G_triggerLabel"
		};
		//#endregion
		//#region lib/client/ModelPicker.js
		/**
		* Compact model catalog picker (settings + plan panel).
		* Visual/UX mirrors conversation.input.model (ModelSelect); selection is local.
		*/
		function ModelPicker({ sessionId, api, value, onChange, t, disabled, className, placement = "bottom" }) {
			const [catalog, setCatalog] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("root");
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const itemRefs = (0, react.useRef)([]);
			const valueRef = (0, react.useRef)(value);
			const onChangeRef = (0, react.useRef)(onChange);
			const id = (0, react.useId)();
			valueRef.current = value;
			onChangeRef.current = onChange;
			const seedFromCurrent = (current) => {
				if (valueRef.current !== void 0) return;
				if (!current.provider || !current.model) return;
				onChangeRef.current({
					provider: current.provider,
					model: current.model,
					...current.reasoningEffort === void 0 ? {} : { reasoningEffort: current.reasoningEffort }
				});
			};
			const load = () => {
				if (sessionId === void 0) {
					setCatalog(null);
					setError(null);
					return;
				}
				setLoading(true);
				setError(null);
				api.sessions.models({ sessionId }).then(({ result }) => {
					setLoading(false);
					if (!result.ok) {
						setError(`${result.error.code}: ${result.error.message}`);
						return;
					}
					setCatalog(result.value);
					seedFromCurrent(result.value.current);
				}).catch((cause) => {
					setLoading(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
			};
			(0, react.useEffect)(() => {
				let cancelled = false;
				if (sessionId === void 0) {
					setCatalog(null);
					setError(null);
					return;
				}
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
					seedFromCurrent(result.value.current);
				}).catch((cause) => {
					if (cancelled) return;
					setLoading(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
				return () => {
					cancelled = true;
				};
			}, [sessionId, api]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (!rootRef.current?.contains(event.target)) {
						setOpen(false);
						setPane("root");
					}
				};
				document.addEventListener("mousedown", closeOutside);
				return () => {
					document.removeEventListener("mousedown", closeOutside);
				};
			}, [open]);
			const choices = (0, react.useMemo)(() => {
				if (catalog === null) return [];
				return catalog.groups.flatMap((group) => group.models.map((model) => ({
					provider: group.id,
					providerName: group.name,
					model: model.id,
					modelName: model.name,
					description: model.description,
					reasoning: model.reasoning
				})));
			}, [catalog]);
			const groups = catalog?.groups ?? [];
			const selected = choices.find((c) => c.provider === value?.provider && c.model === value?.model);
			const reasoning = selected?.reasoning;
			const effectiveEffort = value?.reasoningEffort ?? reasoning?.defaultEffort;
			const effortLabel = reasoning === void 0 ? void 0 : effectiveEffort === void 0 ? t("effortDefault") : reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort;
			const effortChoices = (0, react.useMemo)(() => {
				if (reasoning === void 0) return [];
				return [...reasoning.defaultEffort === void 0 ? [{
					key: "provider-default",
					effort: void 0,
					label: t("effortDefault")
				}] : [], ...reasoning.efforts.map((effort) => ({
					key: `effort:${effort.id}`,
					effort: effort.id,
					label: effort.name,
					...effort.description === void 0 ? {} : { description: effort.description }
				}))];
			}, [reasoning, t]);
			const close = (restoreFocus = false) => {
				setOpen(false);
				setPane("root");
				if (restoreFocus) queueMicrotask(() => {
					triggerRef.current?.focus();
				});
			};
			const show = () => {
				setPane("root");
				setOpen(true);
				load();
			};
			const moveFocus = (offset) => {
				const items = itemRefs.current.filter((item) => item !== null);
				if (items.length === 0) return;
				const active = items.findIndex((item) => item === document.activeElement);
				items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus();
			};
			const onRootKeyDown = (event) => {
				if (event.key === "Escape" && open) {
					event.preventDefault();
					if (pane !== "root") setPane("root");
					else close(true);
					return;
				}
				if (!open) return;
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					moveFocus(event.key === "ArrowDown" ? 1 : -1);
				}
			};
			const onBlur = (event) => {
				if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return;
				close();
			};
			const chooseModel = (provider, model) => {
				const defaultEffort = choices.find((c) => c.provider === provider && c.model === model)?.reasoning?.defaultEffort;
				onChange({
					provider,
					model,
					...defaultEffort === void 0 ? {} : { reasoningEffort: defaultEffort }
				});
				close(true);
			};
			const chooseEffort = (effort) => {
				if (value === void 0) return;
				onChange({
					provider: value.provider,
					model: value.model,
					...effort === void 0 ? {} : { reasoningEffort: effort }
				});
				close(true);
			};
			if (sessionId === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: ModelPicker_module_css_default.muted,
				children: t("noSession")
			});
			const modelLabel = selected?.modelName ?? t("triggerFallback");
			const triggerAria = selected === void 0 ? t("triggerSelectAria") : effortLabel === void 0 ? modelLabel : `${modelLabel} · ${effortLabel}`;
			itemRefs.current = [];
			let itemIndex = 0;
			const itemRef = () => {
				const at = itemIndex++;
				return (node) => {
					itemRefs.current[at] = node;
				};
			};
			const menuClass = placement === "top" ? `${ModelPicker_module_css_default.menu} ${ModelPicker_module_css_default.menuTop}` : `${ModelPicker_module_css_default.menu} ${ModelPicker_module_css_default.menuBottom}`;
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: [ModelPicker_module_css_default.root, className].filter(Boolean).join(" "),
				onKeyDown: onRootKeyDown,
				onBlur,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					ref: triggerRef,
					type: "button",
					className: ModelPicker_module_css_default.trigger,
					"aria-label": triggerAria,
					"aria-haspopup": "menu",
					"aria-expanded": open,
					"aria-controls": open ? `${id}-menu` : void 0,
					title: triggerAria,
					disabled,
					onClick: () => {
						if (open) close();
						else show();
					},
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: ModelPicker_module_css_default.triggerLabel,
							children: modelLabel
						}),
						effortLabel !== void 0 && (0, react_jsx_runtime.jsx)("span", {
							className: ModelPicker_module_css_default.triggerEffort,
							children: effortLabel
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: [ModelPicker_module_css_default.chevron, open ? ModelPicker_module_css_default.chevronOpen : ""].filter(Boolean).join(" ") })
					]
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					id: `${id}-menu`,
					className: menuClass,
					role: "menu",
					"aria-label": t("menuAria"),
					"aria-busy": loading,
					children: [
						pane === "root" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
							ref: itemRef(),
							type: "button",
							role: "menuitem",
							className: ModelPicker_module_css_default.cell,
							onClick: () => {
								setPane("model");
							},
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: ModelPicker_module_css_default.cellLabel,
									children: t("modelLabel")
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: ModelPicker_module_css_default.cellValue,
									children: modelLabel
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: ModelPicker_module_css_default.cellChevron })
							]
						}), reasoning !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
							ref: itemRef(),
							type: "button",
							role: "menuitem",
							className: ModelPicker_module_css_default.cell,
							onClick: () => {
								setPane("effort");
							},
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: ModelPicker_module_css_default.cellLabel,
									children: t("effortLabel")
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: ModelPicker_module_css_default.cellValue,
									children: effortLabel
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: ModelPicker_module_css_default.cellChevron })
							]
						})] }),
						pane === "model" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							loading && (0, react_jsx_runtime.jsx)("div", {
								className: ModelPicker_module_css_default.status,
								children: t("statusLoading")
							}),
							error !== null && (0, react_jsx_runtime.jsxs)("div", {
								className: ModelPicker_module_css_default.error,
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [
									t("loadError"),
									": ",
									error
								] }), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ModelPicker_module_css_default.retry,
									onClick: load,
									children: t("retry")
								})]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: `${ModelPicker_module_css_default.groups} scrollable`,
								children: groups.map((group) => {
									const headingId = `${id}-${group.id}`;
									return (0, react_jsx_runtime.jsxs)("section", {
										role: "group",
										"aria-labelledby": headingId,
										className: ModelPicker_module_css_default.group,
										children: [(0, react_jsx_runtime.jsx)("div", {
											className: ModelPicker_module_css_default.groupTitle,
											id: headingId,
											children: group.name
										}), group.models.map((model) => {
											const isSelected = value?.provider === group.id && value.model === model.id;
											return (0, react_jsx_runtime.jsxs)("button", {
												ref: itemRef(),
												type: "button",
												role: "menuitemradio",
												"aria-checked": isSelected,
												className: ModelPicker_module_css_default.option,
												title: model.name,
												disabled,
												onClick: () => {
													chooseModel(group.id, model.id);
												},
												children: [(0, react_jsx_runtime.jsxs)("span", {
													className: ModelPicker_module_css_default.optionCopy,
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: ModelPicker_module_css_default.modelName,
														children: model.name
													}), model.description !== void 0 && (0, react_jsx_runtime.jsx)("span", {
														className: ModelPicker_module_css_default.description,
														children: model.description
													})]
												}), (0, react_jsx_runtime.jsx)("span", {
													className: ModelPicker_module_css_default.check,
													children: isSelected ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}) : null
												})]
											}, model.id);
										})]
									}, group.id);
								})
							}),
							!loading && error === null && choices.length === 0 && (0, react_jsx_runtime.jsx)("div", {
								className: ModelPicker_module_css_default.empty,
								children: t("emptyModels")
							})
						] }),
						pane === "effort" && (effortChoices.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: ModelPicker_module_css_default.empty,
							children: t("emptyEfforts")
						}) : effortChoices.map((level) => (0, react_jsx_runtime.jsxs)("button", {
							ref: itemRef(),
							type: "button",
							role: "menuitemradio",
							"aria-checked": effectiveEffort === level.effort,
							className: ModelPicker_module_css_default.option,
							disabled,
							onClick: () => {
								chooseEffort(level.effort);
							},
							children: [(0, react_jsx_runtime.jsxs)("span", {
								className: ModelPicker_module_css_default.optionCopy,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ModelPicker_module_css_default.modelName,
									children: level.label
								}), level.description !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: ModelPicker_module_css_default.description,
									children: level.description
								})]
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ModelPicker_module_css_default.check,
								children: effectiveEffort === level.effort ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}) : null
							})]
						}, level.key)))
					]
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:D:\projects\mini-code\reference\dsh-model-switch\src\client\styles.module.css.mjs
		const css$2 = "._8ziUHW_section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;padding:.25rem 0 1.5rem;display:flex}._8ziUHW_titleRow{align-items:center;gap:8px;display:flex}._8ziUHW_titleIcon{color:var(--dsw-alias-label-secondary);flex:none}._8ziUHW_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}._8ziUHW_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}._8ziUHW_block{border-top:1px solid var(--dsw-alias-border-l2,#00000014);flex-direction:column;gap:10px;padding:12px 0 0;display:flex}._8ziUHW_blockTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:500;line-height:22px}._8ziUHW_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}._8ziUHW_modes{background:var(--dsw-alias-interactive-bg-hover,#0000000a);border-radius:18px;flex-wrap:wrap;gap:4px;padding:3px;display:inline-flex}._8ziUHW_mode{appearance:none;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:14px;outline:none;padding:0 12px;font-size:13px;font-weight:500;line-height:20px}._8ziUHW_mode:hover:not(:disabled):not(._8ziUHW_modeActive){color:var(--dsw-alias-label-primary)}._8ziUHW_mode:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}._8ziUHW_mode:disabled{opacity:.55;cursor:default}._8ziUHW_modeActive{background:var(--dsw-specific-menu,#fff);color:var(--dsw-alias-label-primary);box-shadow:0 0 0 1px var(--dsw-alias-border-l2,#00000014)}._8ziUHW_pickerWrap{margin-top:2px}._8ziUHW_error{color:var(--dsw-alias-state-error-primary,#c0392b);margin:0;font-size:12px;line-height:18px}._8ziUHW_frame{width:100%}._8ziUHW_card{border:1px solid var(--dsw-alias-border-l2,#0000001a);background:var(--dsw-specific-menu,#fff);border-radius:12px;overflow:hidden}._8ziUHW_strip{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-info-primary,#3b82f6) 12%, transparent);align-items:center;gap:.45rem;padding:.65rem .9rem;font-size:.8rem;font-weight:600;display:flex}._8ziUHW_dot{background:var(--dsw-alias-state-info-primary,#3b82f6);border-radius:50%;width:.45rem;height:.45rem}._8ziUHW_body{max-height:min(42vh,28rem);padding:.85rem 1rem;overflow:auto}._8ziUHW_footer{border-top:1px solid var(--dsw-alias-border-l2,#00000014);flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.65rem;padding:.7rem .9rem;display:flex}._8ziUHW_feedback{min-height:1.1rem;color:var(--dsw-alias-state-error-primary,#c0392b);font-size:.75rem}._8ziUHW_actions{flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:.5rem;margin-left:auto;display:flex}._8ziUHW_planPicker{align-items:center;min-width:0;display:flex}";
		const tagId$2 = "dsh-model-switch/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
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
			"mode": "_8ziUHW_mode",
			"modeActive": "_8ziUHW_modeActive",
			"modes": "_8ziUHW_modes",
			"pickerWrap": "_8ziUHW_pickerWrap",
			"planPicker": "_8ziUHW_planPicker",
			"section": "_8ziUHW_section",
			"strip": "_8ziUHW_strip",
			"title": "_8ziUHW_title",
			"titleIcon": "_8ziUHW_titleIcon",
			"titleRow": "_8ziUHW_titleRow"
		};
		//#endregion
		//#region lib/client/SettingsSection.js
		/**
		* Settings section: 模型切换 — subagent + plan-execute routes.
		*/
		function RouteBlock(props) {
			const { title, hint, route, onChange, sessionId, api, t, busy } = props;
			const follow = route.mode !== "custom";
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
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "radio",
							"aria-checked": follow,
							className: [styles_module_css_default.mode, follow ? styles_module_css_default.modeActive : ""].filter(Boolean).join(" "),
							disabled: busy,
							onClick: () => {
								onChange({
									mode: "follow-main",
									selection: route.selection
								});
							},
							children: t("modeFollow")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "radio",
							"aria-checked": !follow,
							className: [styles_module_css_default.mode, !follow ? styles_module_css_default.modeActive : ""].filter(Boolean).join(" "),
							disabled: busy,
							onClick: () => {
								onChange({
									mode: "custom",
									selection: route.selection
								});
							},
							children: t("modeCustom")
						})]
					}),
					route.mode === "custom" ? (0, react_jsx_runtime.jsx)("div", {
						className: styles_module_css_default.pickerWrap,
						children: (0, react_jsx_runtime.jsx)(ModelPicker, {
							sessionId,
							api,
							value: route.selection,
							disabled: busy,
							t,
							placement: "bottom",
							onChange: (selection) => {
								onChange({
									mode: "custom",
									selection
								});
							}
						})
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
					(0, react_jsx_runtime.jsxs)("div", {
						className: styles_module_css_default.titleRow,
						children: [(0, react_jsx_runtime.jsx)(IconModelSwitch, {
							className: styles_module_css_default.titleIcon,
							size: 18
						}), (0, react_jsx_runtime.jsx)("h2", {
							className: styles_module_css_default.title,
							children: t("title")
						})]
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
		function sameSelection(a, b) {
			return a.provider === b.provider && a.model === b.model && (a.reasoningEffort ?? void 0) === (b.reasoningEffort ?? void 0);
		}
		function toConfig(selection) {
			if (!selection.provider || !selection.model) return void 0;
			return {
				provider: selection.provider,
				model: selection.model,
				...selection.reasoningEffort === void 0 ? {} : { reasoningEffort: selection.reasoningEffort }
			};
		}
		async function selectModel(api, sessionId, selection) {
			const { result } = await api.sessions.selectModel({
				sessionId,
				provider: selection.provider,
				model: selection.model,
				...selection.reasoningEffort === void 0 ? {} : { reasoningEffort: selection.reasoningEffort }
			});
			if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
		}
		/** Wait until the session runs then settles (or short timeouts). */
		async function waitSessionIdle(sessionId, isSessionRunning) {
			const sleep = (ms) => new Promise((resolve) => {
				window.setTimeout(resolve, ms);
			});
			const start = Date.now();
			while (!isSessionRunning(sessionId) && Date.now() - start < 2e3) await sleep(100);
			const busySince = Date.now();
			while (isSessionRunning(sessionId) && Date.now() - busySince < 10 * 6e4) await sleep(250);
		}
		function PlanReviewPanel({ pending, review, store, api, t, isSessionRunning }) {
			const snap = (0, react.useSyncExternalStore)((listener) => store.subscribe(listener), () => store.getSnapshot());
			const settingsSelection = (0, react.useMemo)(() => resolveCustomSelection(snap.value.planExecute), [snap.value.planExecute]);
			const settingsReady = snap.status === "ready" || snap.status === "error";
			const [panelSelection, setPanelSelection] = (0, react.useState)(void 0);
			const [pickerReady, setPickerReady] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				store.load();
			}, [store]);
			(0, react.useEffect)(() => {
				if (!settingsReady || pickerReady) return;
				setPanelSelection(settingsSelection);
				setPickerReady(true);
			}, [
				settingsReady,
				settingsSelection,
				pickerReady
			]);
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
					let previous;
					let switched = false;
					if (effective !== void 0) {
						const { result } = await api.sessions.models({ sessionId: pending.sessionId });
						if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
						previous = toConfig(result.value.current);
						if (previous === void 0 || !sameSelection(effective, result.value.current)) {
							await selectModel(api, pending.sessionId, effective);
							switched = true;
						}
					}
					await pending.answer({ answers: [{
						id: review.id,
						selected: [review.approve.label]
					}] });
					if (switched && previous !== void 0) try {
						await waitSessionIdle(pending.sessionId, isSessionRunning);
						await selectModel(api, pending.sessionId, previous);
					} catch (cause) {
						console.warn("dsh-model-switch: failed to restore main session model after plan execute", cause);
					}
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
										children: pickerReady ? (0, react_jsx_runtime.jsx)(ModelPicker, {
											sessionId: pending.sessionId,
											api,
											value: panelSelection,
											disabled: busy,
											t,
											placement: "top",
											onChange: setPanelSelection
										}) : null
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										...tooltip(review.approve.description),
										disabled: busy || !pickerReady,
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
			const { matched, store, api, t, isSessionRunning } = props;
			const pending = (0, react.useMemo)(() => new PendingQuestion(matched), [matched]);
			const review = (0, react.useMemo)(() => planReviewOf(pending.questions), [pending]);
			if (store === void 0 || api === void 0 || t === void 0 || isSessionRunning === void 0 || review === void 0) return null;
			return (0, react_jsx_runtime.jsx)(PlanReviewPanel, {
				pending,
				review,
				store,
				api,
				t,
				isSessionRunning
			});
		}
		//#endregion
		//#region \0dsh-css:D:\projects\mini-code\reference\dsh-model-switch\src\client\SubagentModelBadge.module.css.mjs
		const css$1 = ".diMRfq_badge{min-width:0;max-width:220px;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;border-radius:12px;align-items:center;padding:2px 8px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex;overflow:hidden}";
		const tagId$1 = "dsh-model-switch/SubagentModelBadge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var SubagentModelBadge_module_css_default = { "badge": "diMRfq_badge" };
		//#endregion
		//#region lib/client/SubagentModelBadge.js
		/**
		* Session-hierarchy neighbour: show the active subagent's model label.
		*/
		function SubagentModelBadge(props) {
			const { sessionId, useSessions, labels } = props;
			if (labels === void 0) return null;
			const origin = useSessions((state) => state.byId[sessionId]?.origin);
			const snap = (0, react.useSyncExternalStore)(labels.subscribe, labels.getSnapshot);
			(0, react.useEffect)(() => {
				labels.start();
				return () => {
					labels.stop();
				};
			}, [labels]);
			if (origin !== "subagent") return null;
			const text = snap.value[sessionId];
			if (text === void 0 || text.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("span", {
				className: SubagentModelBadge_module_css_default.badge,
				title: text,
				"data-model-switch-badge": "",
				children: text
			});
		}
		//#endregion
		//#region \0dsh-css:D:\projects\mini-code\reference\dsh-model-switch\src\client\SubagentCatalogAction.module.css.mjs
		const css = ".y_JUCW_root{position:relative}.y_JUCW_trigger{min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:3px;padding:3px 2px;font-size:12px;line-height:18px;display:inline-flex}.y_JUCW_count{margin:0 5px}.y_JUCW_activitySlot{flex:none;width:10px;height:10px;display:inline-flex}.y_JUCW_trigger:hover,.y_JUCW_trigger:focus-visible{color:var(--dsw-alias-label-secondary)}.y_JUCW_trigger svg{transition:transform .12s}.y_JUCW_triggerOpen{transform:rotate(180deg)}.y_JUCW_menu{z-index:100;box-sizing:border-box;background:var(--dsw-specific-menu);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);width:336px;max-width:min(400px,100vw - 32px);max-height:min(560px,100vh - 140px);box-shadow:var(--dsw-shadow-lv3);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;top:calc(100% + 5px);left:0;overflow:auto}.y_JUCW_node{min-width:0;position:relative}.y_JUCW_menu>.y_JUCW_node{margin-left:-3px}.y_JUCW_row{box-sizing:border-box;width:100%;min-height:50px;color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;background:0 0;border:0;border-radius:8px;outline:none;align-items:flex-start;gap:8px;padding:7px 8px 7px 11px;font-size:13px;line-height:18px;display:flex;position:relative}.y_JUCW_row:hover>.y_JUCW_clickarea,.y_JUCW_row:focus-visible>.y_JUCW_clickarea{background:var(--dsw-alias-interactive-bg-hover)}.y_JUCW_clickarea{box-sizing:border-box;border-radius:8px;flex:1;align-self:stretch;align-items:flex-start;gap:8px;min-width:0;margin:-7px -8px;padding:7px 8px;display:flex}.y_JUCW_row>[data-state],.y_JUCW_clickarea>[data-state]{margin-top:4px}.y_JUCW_disabled{color:var(--dsw-alias-label-dimmed);cursor:not-allowed}.y_JUCW_disabled:hover{background:0 0}.y_JUCW_loadingRow{cursor:default}.y_JUCW_disclosure,.y_JUCW_disclosureSpace{flex:none;width:14px;height:18px}.y_JUCW_disclosure{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;padding:0;transition:transform .12s;display:inline-flex}.y_JUCW_disclosure:hover{color:var(--dsw-alias-label-primary)}.y_JUCW_disclosureOpen{transform:rotate(90deg)}.y_JUCW_content{flex-direction:column;flex:1;min-width:0;display:flex}.y_JUCW_label,.y_JUCW_summary{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.y_JUCW_label{color:inherit;font-weight:400}.y_JUCW_summary,.y_JUCW_metrics{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.y_JUCW_metrics{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap;flex-direction:column;flex:none;justify-content:center;align-items:flex-end;gap:0;min-width:0;max-width:148px;display:flex}.y_JUCW_metricModel{max-width:100%;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;font-size:11px;font-weight:500;line-height:16px;overflow:hidden}.y_JUCW_metricToken{line-height:18px}.y_JUCW_metricDuration{line-height:16px}.y_JUCW_children{margin-left:18px;padding-left:4px;position:relative}.y_JUCW_children:before,.y_JUCW_children>.y_JUCW_node:before{content:\"\";border-left:1px solid var(--dsw-alias-border-l2);position:absolute;left:0}.y_JUCW_children:before{height:26px;top:-26px}.y_JUCW_children[aria-busy=true]:before{content:none}.y_JUCW_children>.y_JUCW_node:before{top:0;bottom:0;left:-4px}.y_JUCW_children>.y_JUCW_node:last-child:before{height:17px;bottom:auto}.y_JUCW_children>.y_JUCW_node>.y_JUCW_row:before{content:\"\";border-top:1px solid var(--dsw-alias-border-l2);width:14px;position:absolute;top:16px;left:-4px}.y_JUCW_notice,.y_JUCW_error{color:var(--dsw-alias-label-tertiary);padding:10px 12px;font-size:12px;line-height:18px}.y_JUCW_error{color:var(--dsw-alias-state-error-primary);justify-content:space-between;align-items:center;gap:12px;display:flex}.y_JUCW_refresh{color:inherit;cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;align-items:center;gap:4px;padding:4px 6px;display:inline-flex}.y_JUCW_refresh:hover{background:var(--dsw-alias-interactive-bg-hover)}";
		const tagId = "dsh-model-switch/SubagentCatalogAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SubagentCatalogAction_module_css_default = {
			"activitySlot": "y_JUCW_activitySlot",
			"children": "y_JUCW_children",
			"clickarea": "y_JUCW_clickarea",
			"content": "y_JUCW_content",
			"count": "y_JUCW_count",
			"disabled": "y_JUCW_disabled",
			"disclosure": "y_JUCW_disclosure",
			"disclosureOpen": "y_JUCW_disclosureOpen",
			"disclosureSpace": "y_JUCW_disclosureSpace",
			"error": "y_JUCW_error",
			"label": "y_JUCW_label",
			"loadingRow": "y_JUCW_loadingRow",
			"menu": "y_JUCW_menu",
			"metricDuration": "y_JUCW_metricDuration",
			"metricModel": "y_JUCW_metricModel",
			"metricToken": "y_JUCW_metricToken",
			"metrics": "y_JUCW_metrics",
			"node": "y_JUCW_node",
			"notice": "y_JUCW_notice",
			"refresh": "y_JUCW_refresh",
			"root": "y_JUCW_root",
			"row": "y_JUCW_row",
			"summary": "y_JUCW_summary",
			"trigger": "y_JUCW_trigger",
			"triggerOpen": "y_JUCW_triggerOpen"
		};
		//#endregion
		//#region lib/client/SubagentCatalogAction.js
		function diagnosticReason(entry, t) {
			switch (entry.reason) {
				case "corrupt": return t("diagnostic.corrupt");
				case "unsupported": return t("diagnostic.unsupported");
				case "unavailable": return t("diagnostic.unavailable");
			}
		}
		function treeItems(root) {
			return root === null ? [] : Array.from(root.querySelectorAll("[role=\"treeitem\"]:not([aria-disabled=\"true\"])"));
		}
		/** Compact token count shared in shape with the conversation stats strip. */
		function formatTokens(value) {
			const scaled = (next) => next >= 100 ? String(Math.round(next)) : String(Math.round(next * 10) / 10);
			if (value < 1e3) return String(value);
			if (value < 1e6) return `${scaled(value / 1e3)}K`;
			return `${scaled(value / 1e6)}M`;
		}
		/** Sum the four disjoint durable provider-usage buckets. */
		function tokenTotal(usage) {
			return usage === void 0 ? void 0 : usage.uncachedInputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
		}
		/** Exact whole-second active-turn duration for one catalog row. */
		function activityDuration(summary, activity, now) {
			if (summary === void 0) return void 0;
			const timing = summary.projectionValues?.subagentTiming;
			if (timing === void 0) return void 0;
			if (timing.active === void 0) return timing.settledMs;
			const end = activity === "running" ? now : timing.active.through;
			return timing.settledMs + Math.max(0, end - timing.active.since);
		}
		function splitDuration(ms) {
			const totalSeconds = Math.floor(Math.max(0, ms) / 1e3);
			const totalMinutes = Math.floor(totalSeconds / 60);
			const totalHours = Math.floor(totalMinutes / 60);
			return {
				seconds: totalSeconds % 60,
				minutes: totalMinutes % 60,
				hours: totalHours % 24,
				days: Math.floor(totalHours / 24),
				totalMinutes,
				totalHours
			};
		}
		/** Format a duration with decreasing visual precision at larger scales. */
		function formatDuration(ms, t) {
			const { seconds, minutes, hours, days, totalMinutes, totalHours } = splitDuration(ms);
			if (days >= 365) {
				const years = Math.floor(days / 365);
				const months = Math.floor(days % 365 / 30);
				return months === 0 ? t("duration.years", { years }) : t("duration.yearsMonths", {
					years,
					months
				});
			}
			if (days >= 30) {
				const months = Math.floor(days / 30);
				const remainingDays = days % 30;
				return remainingDays === 0 ? t("duration.months", { months }) : t("duration.monthsDays", {
					months,
					days: remainingDays
				});
			}
			if (days > 0) return hours === 0 ? t("duration.days", { days }) : t("duration.daysHours", {
				days,
				hours
			});
			if (totalHours > 0) return t("duration.hours", {
				hours: totalHours,
				minutes: String(minutes).padStart(2, "0"),
				seconds: String(seconds).padStart(2, "0")
			});
			if (totalMinutes > 0) return t("duration.minutes", {
				minutes: totalMinutes,
				seconds: String(seconds).padStart(2, "0")
			});
			return t("duration.seconds", { seconds });
		}
		/** Preserve exact whole seconds for hover and accessible naming. */
		function formatExactDuration(ms, t) {
			const { seconds, minutes, hours, days } = splitDuration(ms);
			return days === 0 ? formatDuration(ms, t) : t("duration.exactDays", {
				days,
				hours: String(hours).padStart(2, "0"),
				minutes: String(minutes).padStart(2, "0"),
				seconds: String(seconds).padStart(2, "0")
			});
		}
		const NO_DESCENDANTS = {
			count: 0,
			runningCount: 0
		};
		/** Render the known direct-child shape while its authoritative catalog hydrates. */
		function CatalogLoadingRows({ parentSessionId, summaries, level, t }) {
			const children = Object.values(summaries).filter((summary) => summary.origin === "subagent" && summary.parentId === parentSessionId);
			if (children.length === 0) return (0, react_jsx_runtime.jsx)("div", {
				className: SubagentCatalogAction_module_css_default.notice,
				children: t("loading.label")
			});
			return children.map((summary) => (0, react_jsx_runtime.jsx)("div", {
				className: SubagentCatalogAction_module_css_default.node,
				children: (0, react_jsx_runtime.jsxs)("div", {
					role: "treeitem",
					"aria-disabled": "true",
					"aria-level": level,
					"aria-label": t("loading.aria"),
					className: `${SubagentCatalogAction_module_css_default.row} ${SubagentCatalogAction_module_css_default.disabled} ${SubagentCatalogAction_module_css_default.loadingRow}`,
					children: [
						(0, react_jsx_runtime.jsx)("span", { className: SubagentCatalogAction_module_css_default.disclosureSpace }),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: summary.running ? "ongoing" : "done" }),
						(0, react_jsx_runtime.jsx)("span", {
							className: SubagentCatalogAction_module_css_default.content,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: SubagentCatalogAction_module_css_default.label,
								children: t("loading.label")
							})
						})
					]
				})
			}, summary.id));
		}
		/** Render one catalog level and recurse only through explicitly expanded rows. */
		function CatalogRows({ parentSessionId, catalog, catalogs, summaries, expanded, level, now, openChild, refresh, toggleBranch, closeCatalog, modelLabels, t }) {
			const emptyLoading = catalog.state === "loading" && catalog.entries.length === 0;
			const reserveDisclosure = catalog.entries.some((entry) => entry.kind === "child" && entry.hasChildren);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				emptyLoading && (0, react_jsx_runtime.jsx)(CatalogLoadingRows, {
					parentSessionId,
					summaries,
					level,
					t
				}),
				catalog.state === "error" && (0, react_jsx_runtime.jsxs)("div", {
					className: SubagentCatalogAction_module_css_default.error,
					children: [(0, react_jsx_runtime.jsx)("span", { children: catalog.error?.message ?? t("load.error") }), (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: SubagentCatalogAction_module_css_default.refresh,
						onClick: () => {
							refresh(parentSessionId);
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline14, {}), t("retry")]
					})]
				}),
				catalog.entries.map((entry) => {
					if (entry.kind === "diagnostic") {
						const reason = diagnosticReason(entry, t);
						return (0, react_jsx_runtime.jsx)("div", {
							className: SubagentCatalogAction_module_css_default.node,
							children: (0, react_jsx_runtime.jsxs)("div", {
								role: "treeitem",
								"aria-disabled": "true",
								"aria-level": level,
								"aria-label": `${entry.id} ${reason}`,
								className: `${SubagentCatalogAction_module_css_default.row} ${SubagentCatalogAction_module_css_default.disabled}`,
								title: reason,
								children: [
									reserveDisclosure && (0, react_jsx_runtime.jsx)("span", { className: SubagentCatalogAction_module_css_default.disclosureSpace }),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }),
									(0, react_jsx_runtime.jsxs)("span", {
										className: SubagentCatalogAction_module_css_default.content,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: SubagentCatalogAction_module_css_default.label,
											children: entry.id
										}), (0, react_jsx_runtime.jsx)("span", {
											className: SubagentCatalogAction_module_css_default.summary,
											children: reason
										})]
									})
								]
							})
						}, entry.id);
					}
					const childCatalog = catalogs[entry.id];
					const isExpanded = expanded.has(entry.id);
					const knownLeaf = !entry.hasChildren;
					const childLoading = childCatalog === void 0 || childCatalog.state === "loading" && childCatalog.entries.length === 0;
					const summary = summaries[entry.id];
					const label = entry.label ?? entry.id;
					const mode = entry.mode === "one-shot" ? t("mode.oneShot") : t("mode.continuable");
					const activity = entry.activity === "running" ? t("activity.running") : t("activity.inactive");
					const secondary = [
						summary?.title,
						mode,
						activity
					].filter((value) => value !== void 0).join(" · ");
					const projectionValues = summary?.projectionValues;
					const totalTokens = tokenTotal(projectionValues?.tokenUsage);
					const durationMs = activityDuration(summary, entry.activity, now);
					const modelMetric = modelLabels[entry.id];
					const tokenMetric = totalTokens === void 0 ? void 0 : `${formatTokens(totalTokens)} tok`;
					const durationMetric = durationMs === void 0 ? void 0 : {
						compact: formatDuration(durationMs, t),
						exact: formatExactDuration(durationMs, t)
					};
					const metrics = [
						modelMetric,
						tokenMetric,
						durationMetric?.exact
					].filter((value) => value !== void 0).join(" · ");
					const open = () => {
						openChild({
							parentSessionId,
							childSessionId: entry.id,
							mode: entry.mode
						});
						closeCatalog();
					};
					const handleKey = (event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							event.stopPropagation();
							open();
						} else if (event.key === "ArrowRight" && !knownLeaf && !isExpanded || event.key === "ArrowLeft" && isExpanded) {
							event.preventDefault();
							event.stopPropagation();
							toggleBranch(entry.id);
						}
					};
					const toggle = (event) => {
						event.preventDefault();
						event.stopPropagation();
						toggleBranch(entry.id);
					};
					return (0, react_jsx_runtime.jsxs)("div", {
						className: SubagentCatalogAction_module_css_default.node,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							role: "treeitem",
							tabIndex: 0,
							"aria-level": level,
							"aria-label": [
								label,
								secondary,
								metrics
							].filter((value) => value !== "").join(" "),
							...knownLeaf ? {} : { "aria-expanded": isExpanded },
							className: SubagentCatalogAction_module_css_default.row,
							onClick: open,
							onKeyDown: handleKey,
							children: [knownLeaf ? reserveDisclosure && (0, react_jsx_runtime.jsx)("span", { className: SubagentCatalogAction_module_css_default.disclosureSpace }) : (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								tabIndex: -1,
								className: `${SubagentCatalogAction_module_css_default.disclosure} ${isExpanded ? SubagentCatalogAction_module_css_default.disclosureOpen : ""}`,
								"aria-label": t(isExpanded ? "branch.collapse" : "branch.expand", { label }),
								onClick: toggle,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, {})
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: SubagentCatalogAction_module_css_default.clickarea,
								children: [
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: entry.activity === "running" ? "ongoing" : "done" }),
									(0, react_jsx_runtime.jsxs)("span", {
										className: SubagentCatalogAction_module_css_default.content,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: SubagentCatalogAction_module_css_default.label,
											children: label
										}), (0, react_jsx_runtime.jsx)("span", {
											className: SubagentCatalogAction_module_css_default.summary,
											children: secondary
										})]
									}),
									(modelMetric !== void 0 || metrics !== "") && (0, react_jsx_runtime.jsxs)("span", {
										className: SubagentCatalogAction_module_css_default.metrics,
										children: [
											modelMetric !== void 0 && (0, react_jsx_runtime.jsx)("span", {
												className: SubagentCatalogAction_module_css_default.metricModel,
												title: modelMetric,
												children: modelMetric
											}),
											tokenMetric !== void 0 && (0, react_jsx_runtime.jsx)("span", {
												className: SubagentCatalogAction_module_css_default.metricToken,
												children: tokenMetric
											}),
											durationMetric !== void 0 && (0, react_jsx_runtime.jsx)("span", {
												className: SubagentCatalogAction_module_css_default.metricDuration,
												title: t("duration.exactTitle", { duration: durationMetric.exact }),
												children: durationMetric.compact
											})
										]
									})
								]
							})]
						}), isExpanded && !knownLeaf && (0, react_jsx_runtime.jsx)("div", {
							role: "group",
							className: SubagentCatalogAction_module_css_default.children,
							"aria-busy": childLoading || void 0,
							children: childCatalog === void 0 ? (0, react_jsx_runtime.jsx)(CatalogLoadingRows, {
								parentSessionId: entry.id,
								summaries,
								level: level + 1,
								t
							}) : (0, react_jsx_runtime.jsx)(CatalogRows, {
								parentSessionId: entry.id,
								catalog: childCatalog,
								catalogs,
								summaries,
								expanded,
								level: level + 1,
								now,
								openChild,
								refresh,
								toggleBranch,
								closeCatalog,
								modelLabels,
								t
							})
						})]
					}, entry.id);
				})
			] });
		}
		/**
		* Render the current session's direct catalog and lazily expanded descendants.
		* @param props - session standard props plus catalog navigation actions.
		* @returns The action while the catalog is pending or summaries establish descendants.
		*/
		function SubagentCatalogAction(props) {
			const { labels, openChild, refresh, setCatalogOpen, t } = props;
			if (labels === void 0 || openChild === void 0 || refresh === void 0 || setCatalogOpen === void 0 || t === void 0) return null;
			return (0, react_jsx_runtime.jsx)(SubagentCatalogActionLoaded, {
				...props,
				labels,
				openChild,
				refresh,
				setCatalogOpen,
				t
			});
		}
		function SubagentCatalogActionLoaded({ sessionId, useSessions, openChild, refresh, setCatalogOpen, labels, t }) {
			const catalogs = useSessions((state) => state.subagentsByParent);
			const summaries = useSessions((state) => state.byId);
			const catalog = catalogs[sessionId];
			const modelLabels = (0, react.useSyncExternalStore)(labels.subscribe, labels.getSnapshot).value;
			(0, react.useEffect)(() => {
				labels.start();
				return () => {
					labels.stop();
				};
			}, [labels]);
			const [open, setOpen] = (0, react.useState)(false);
			const [now, setNow] = (0, react.useState)(() => Date.now());
			const [expanded, setExpanded] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const observedCatalogs = (0, react.useRef)(/* @__PURE__ */ new Set());
			const setCatalogOpenRef = (0, react.useRef)(setCatalogOpen);
			setCatalogOpenRef.current = setCatalogOpen;
			const healthy = catalog?.entries.filter((entry) => entry.kind === "child") ?? [];
			const descendants = (0, react.useMemo)(() => (0, _deepseek_ai_dsh_client_runtime_client.indexSubagentDescendants)(summaries).get(sessionId) ?? NO_DESCENDANTS, [sessionId, summaries]);
			const descendantCount = Math.max(healthy.length, descendants.count);
			const totalCountKey = descendantCount === 1 ? "count.total.one" : "count.total.other";
			const runningCountKey = descendants.runningCount === 1 ? "count.running.one" : "count.running.other";
			const presentedCatalog = descendants.count > 0 && (catalog === void 0 || catalog.state === "ready" && catalog.entries.length === 0) ? {
				entries: [],
				parentAvailable: catalog?.parentAvailable ?? false,
				state: "loading",
				error: null
			} : catalog;
			const observeCatalog = (parentSessionId, next) => {
				if (next) observedCatalogs.current.add(parentSessionId);
				else observedCatalogs.current.delete(parentSessionId);
				setCatalogOpen(parentSessionId, next);
			};
			const closeAllCatalogs = () => {
				for (const parentSessionId of observedCatalogs.current) setCatalogOpen(parentSessionId, false);
				observedCatalogs.current.clear();
				setExpanded(/* @__PURE__ */ new Set());
			};
			const changeOpen = (next, restoreFocus = false) => {
				setOpen(next);
				if (next) {
					setNow(Date.now());
					observeCatalog(sessionId, true);
				} else closeAllCatalogs();
				if (restoreFocus) queueMicrotask(() => {
					triggerRef.current?.focus();
				});
			};
			const closeBranch = (root) => {
				const closing = /* @__PURE__ */ new Set();
				const visit = (parentSessionId) => {
					if (closing.has(parentSessionId) || !expanded.has(parentSessionId)) return;
					closing.add(parentSessionId);
					const branch = catalogs[parentSessionId];
					for (const entry of branch?.entries ?? []) if (entry.kind === "child") visit(entry.id);
				};
				visit(root);
				for (const parentSessionId of closing) observeCatalog(parentSessionId, false);
				setExpanded((current) => new Set([...current].filter((id) => !closing.has(id))));
			};
			const toggleBranch = (childSessionId) => {
				if (expanded.has(childSessionId)) {
					closeBranch(childSessionId);
					return;
				}
				setExpanded((current) => new Set(current).add(childSessionId));
				observeCatalog(childSessionId, true);
			};
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (event.target instanceof Node && !rootRef.current?.contains(event.target)) changeOpen(false);
				};
				document.addEventListener("pointerdown", closeOutside);
				return () => {
					document.removeEventListener("pointerdown", closeOutside);
				};
			}, [open]);
			(0, react.useEffect)(() => {
				if (!open || descendants.runningCount === 0) return;
				const timer = setInterval(() => {
					setNow(Date.now());
				}, 1e3);
				return () => {
					clearInterval(timer);
				};
			}, [open, descendants.runningCount]);
			(0, react.useEffect)(() => () => {
				for (const parentSessionId of observedCatalogs.current) setCatalogOpenRef.current(parentSessionId, false);
				observedCatalogs.current.clear();
			}, []);
			const visible = presentedCatalog !== void 0 && (presentedCatalog.state === "error" || presentedCatalog.entries.length > 0 || descendantCount > 0);
			(0, react.useEffect)(() => {
				if (visible || !open) return;
				setOpen(false);
				closeAllCatalogs();
			}, [visible, open]);
			if (!visible) return null;
			const focusAt = (index) => {
				const items = treeItems(rootRef.current);
				if (items.length === 0) return;
				items[(index + items.length) % items.length]?.focus();
			};
			const navigate = (event) => {
				const items = treeItems(rootRef.current);
				const index = items.indexOf(document.activeElement);
				if (event.key === "Escape") {
					event.preventDefault();
					changeOpen(false, true);
				} else if (event.key === "Home") {
					event.preventDefault();
					focusAt(0);
				} else if (event.key === "End") {
					event.preventDefault();
					focusAt(items.length - 1);
				} else if (event.key === "ArrowDown") {
					event.preventDefault();
					focusAt(index + 1);
				} else if (event.key === "ArrowUp") {
					event.preventDefault();
					focusAt(index < 0 ? items.length - 1 : index - 1);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SubagentCatalogAction_module_css_default.root,
				ref: rootRef,
				onKeyDown: navigate,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					ref: triggerRef,
					type: "button",
					className: SubagentCatalogAction_module_css_default.trigger,
					"aria-haspopup": "tree",
					"aria-expanded": open,
					"aria-label": t(descendants.runningCount > 0 ? runningCountKey : totalCountKey, { count: descendants.runningCount > 0 ? descendants.runningCount : descendantCount }),
					onClick: () => {
						changeOpen(!open);
					},
					onKeyDown: (event) => {
						if (event.key !== "ArrowDown") return;
						event.preventDefault();
						if (!open) changeOpen(true);
						queueMicrotask(() => {
							focusAt(0);
						});
					},
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: SubagentCatalogAction_module_css_default.activitySlot,
							children: descendants.runningCount > 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: SubagentCatalogAction_module_css_default.count,
							children: t(totalCountKey, { count: descendantCount })
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: open ? SubagentCatalogAction_module_css_default.triggerOpen : void 0 })
					]
				}), open && (0, react_jsx_runtime.jsx)("div", {
					className: SubagentCatalogAction_module_css_default.menu,
					role: "tree",
					"aria-label": t("tree.aria"),
					children: (0, react_jsx_runtime.jsx)(CatalogRows, {
						parentSessionId: sessionId,
						catalog: presentedCatalog,
						catalogs,
						summaries,
						expanded,
						level: 1,
						now,
						openChild,
						refresh,
						toggleBranch,
						closeCatalog: () => {
							changeOpen(false);
						},
						modelLabels,
						t
					})
				})]
			});
		}
		//#endregion
		//#region lib/label.js
		/**
		* Format subagent model readout: `ModelName Context Effort` e.g. `GPT-5.6 Sol 1M Max`.
		*/
		/** Browser-facing map of sessionId → formatted label. */
		const SESSION_LABELS_ROUTE = "/_dsh/model-switch/session-labels";
		//#endregion
		//#region lib/client/session-label-store.js
		/**
		* Client poll of host session-label map.
		*/
		/**
		* Poll `/_dsh/model-switch/session-labels` for catalog + header badges.
		*/
		var SessionLabelStore = class {
			snap = {
				value: {},
				error: null,
				version: 0
			};
			listeners = /* @__PURE__ */ new Set();
			timer;
			refs = 0;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			getSnapshot = () => this.snap;
			start(intervalMs = 2e3) {
				this.refs += 1;
				if (this.refs > 1) return;
				this.refresh();
				this.timer = window.setInterval(() => {
					this.refresh();
				}, intervalMs);
			}
			stop() {
				this.refs = Math.max(0, this.refs - 1);
				if (this.refs > 0 || this.timer === void 0) return;
				window.clearInterval(this.timer);
				this.timer = void 0;
			}
			async refresh() {
				try {
					const response = await fetch(SESSION_LABELS_ROUTE, { credentials: "same-origin" });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					const body = await response.json();
					if (body.ok !== true || body.value === void 0) throw new Error("bad session-labels payload");
					this.snap = {
						value: body.value,
						error: null,
						version: this.snap.version + 1
					};
					this.emit();
				} catch (cause) {
					this.snap = {
						value: this.snap.value,
						error: cause instanceof Error ? cause.message : String(cause),
						version: this.snap.version + 1
					};
					this.emit();
				}
			}
			emit() {
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region lib/client/index.js
		/**
		* Browser half of dsh-model-switch: settings, plan-review, subagent model badges.
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
			const labels = new SessionLabelStore();
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
				t,
				isSessionRunning: (sessionId) => ctx.sessions.list.getSnapshot().byId[sessionId]?.running === true
			});
			ctx.slots.inject("conversation.composer", () => ctx.slots.register({
				name: "conversation.composer",
				select: selectPlanReview,
				priority: -10,
				locale: NS,
				inject: planInject
			}, PlanReviewComposer));
			const badgeInject = () => ({ labels });
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "model-switch-badge",
				order: 5,
				inject: badgeInject
			}, SubagentModelBadge));
			const catalogInject = (_parentSessionId) => ({
				openChild(address) {
					ctx.sessions.openSubagent(address);
				},
				refresh(parentSessionId) {
					ctx.sessions.refreshSubagents(parentSessionId);
				},
				setCatalogOpen(parentSessionId, open) {
					ctx.sessions.setSubagentCatalogOpen(parentSessionId, open);
				},
				labels
			});
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "subagent-catalog",
				order: 10,
				priority: -1,
				locale: "subagent",
				inject: catalogInject
			}, SubagentCatalogAction));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map