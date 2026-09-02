window.__ModuleLoader__.load({
	id: "dsh-model-switch",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/shared.js
		/**
		* Shared types and pure helpers (host + client safe).
		*/
		/** Settings namespace string (must match host registration). */
		const MODEL_SWITCH_NS = "model-switch";
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
			unavailable: "设置暂不可用。请使用 DSH 0.1.2-alpha.5 或更高版本。",
			planHeader: "计划待审",
			planDiscuss: "去聊天里说",
			planDecline: "拒绝",
			planApprove: "确认执行",
			planModelLabel: "执行模型",
			codeCopy: "复制代码",
			codeCopied: "已复制",
			footnotes: "脚注"
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
			unavailable: "Settings are unavailable. Requires DSH 0.1.2-alpha.5 or later.",
			planHeader: "Plan awaiting review",
			planDiscuss: "Discuss in chat",
			planDecline: "Decline",
			planApprove: "Approve",
			planModelLabel: "Execution model",
			codeCopy: "Copy code",
			codeCopied: "Copied",
			footnotes: "Footnotes"
		};
		//#endregion
		//#region lib/client/config-store.js
		/**
		* Browser mirror of the host `model-switch` settings namespace.
		*
		* DSH 0.1.2-alpha.4+ serves plugin-registered namespaces through settings.*;
		* this store is a stable snapshot wrapper over `ctx.settingsScope`.
		*/
		const EMPTY = {};
		function view(snap) {
			if (snap.status === "unavailable") return {
				status: "error",
				value: snap.value ?? EMPTY,
				error: "unavailable"
			};
			if (snap.status === "loading" && snap.value === void 0) return {
				status: "loading",
				value: EMPTY,
				error: null
			};
			return {
				status: "ready",
				value: snap.value ?? EMPTY,
				error: null
			};
		}
		/** Reactive config store over the client settings-namespace scope. */
		var ConfigStore = class {
			scope;
			lastRaw;
			lastView = {
				status: "loading",
				value: EMPTY,
				error: null
			};
			constructor(scope) {
				this.scope = scope;
			}
			getSnapshot() {
				const raw = this.scope.getSnapshot();
				if (raw === this.lastRaw) return this.lastView;
				this.lastRaw = raw;
				this.lastView = view(raw);
				return this.lastView;
			}
			subscribe(listener) {
				return this.scope.subscribe(listener);
			}
			/**
			* Persist one route field. `settingsScope.set` is one field per call and
			* fences the write with the latest known namespace revision.
			*/
			async saveRoute(field, next) {
				await this.scope.set(field, next);
				const snap = this.getSnapshot();
				if (snap.status === "error") throw new Error(snap.error ?? "unavailable");
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
		//#region \0dsh-css:/workspace/src/client/ModelPicker.module.css.mjs
		const css$3 = ".aYf12W_root{min-width:0;position:relative}.aYf12W_trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}.aYf12W_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.aYf12W_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}.aYf12W_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.aYf12W_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.aYf12W_triggerEffort{color:var(--dsw-alias-label-caption);flex:none}.aYf12W_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}.aYf12W_chevronOpen{transform:rotate(180deg)}.aYf12W_menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(240px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;overflow:hidden}.aYf12W_menuTop{bottom:calc(100% + 8px);right:0}.aYf12W_menuBottom{top:calc(100% + 8px);left:0}.aYf12W_status,.aYf12W_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}.aYf12W_error{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}.aYf12W_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}.aYf12W_groups{min-height:0;overflow-y:auto}.aYf12W_group+.aYf12W_group{margin-top:4px}.aYf12W_groupTitle{z-index:1;background:var(--dsw-specific-menu);color:var(--dsw-alias-label-tertiary);padding:5px 8px 3px;font-size:12px;font-weight:500;line-height:18px;position:sticky;top:0}.aYf12W_option{width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}.aYf12W_option:hover:not(:disabled),.aYf12W_option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.aYf12W_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.aYf12W_optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}.aYf12W_modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.aYf12W_description{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.aYf12W_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}.aYf12W_cell{width:100%;height:40px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;align-items:center;gap:8px;padding:0 10px;font-size:14px;line-height:22px;display:flex}.aYf12W_cell:hover{background:var(--dsw-alias-interactive-bg-hover)}.aYf12W_cellLabel{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.aYf12W_cellValue{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-tertiary);flex:0 auto;overflow:hidden}.aYf12W_cellChevron{color:var(--dsw-alias-label-tertiary);flex:none}.aYf12W_muted{color:var(--dsw-alias-label-tertiary,#666);margin:0;font-size:.8rem}";
		const tagId$3 = "dsh-model-switch/ModelPicker.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var ModelPicker_module_css_default = {
			"cell": "aYf12W_cell",
			"cellChevron": "aYf12W_cellChevron",
			"cellLabel": "aYf12W_cellLabel",
			"cellValue": "aYf12W_cellValue",
			"check": "aYf12W_check",
			"chevron": "aYf12W_chevron",
			"chevronOpen": "aYf12W_chevronOpen",
			"description": "aYf12W_description",
			"empty": "aYf12W_empty",
			"error": "aYf12W_error",
			"group": "aYf12W_group",
			"groupTitle": "aYf12W_groupTitle",
			"groups": "aYf12W_groups",
			"menu": "aYf12W_menu",
			"menuBottom": "aYf12W_menuBottom",
			"menuTop": "aYf12W_menuTop",
			"modelName": "aYf12W_modelName",
			"muted": "aYf12W_muted",
			"option": "aYf12W_option",
			"optionCopy": "aYf12W_optionCopy",
			"retry": "aYf12W_retry",
			"root": "aYf12W_root",
			"status": "aYf12W_status",
			"trigger": "aYf12W_trigger",
			"triggerEffort": "aYf12W_triggerEffort",
			"triggerLabel": "aYf12W_triggerLabel"
		};
		//#endregion
		//#region lib/client/ModelPicker.js
		/**
		* Compact model catalog picker (settings + plan panel).
		* Visual/UX mirrors conversation.input.model (ModelSelect); selection is local.
		*/
		function ModelPicker({ sessionId, access, value, onChange, t, disabled, className, placement = "bottom" }) {
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
				if (current === void 0 || !current.provider || !current.model) return;
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
				access.loadCatalog().then((next) => {
					setCatalog(next);
					seedFromCurrent(access.currentSelection(sessionId) ?? next.default);
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
				access.loadCatalog().then((next) => {
					if (cancelled) return;
					setLoading(false);
					setCatalog(next);
					seedFromCurrent(access.currentSelection(sessionId) ?? next.default);
				}).catch((cause) => {
					if (cancelled) return;
					setLoading(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
				return () => {
					cancelled = true;
				};
			}, [sessionId, access]);
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
		//#region \0dsh-css:/workspace/src/client/styles.module.css.mjs
		const css$2 = ".Fv2ulW_section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;padding:.25rem 0 1.5rem;display:flex}.Fv2ulW_titleRow{align-items:center;gap:8px;display:flex}.Fv2ulW_titleIcon{color:var(--dsw-alias-label-secondary);flex:none}.Fv2ulW_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}.Fv2ulW_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}.Fv2ulW_block{border-top:1px solid var(--dsw-alias-border-l2,#00000014);flex-direction:column;gap:10px;padding:12px 0 0;display:flex}.Fv2ulW_blockTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:500;line-height:22px}.Fv2ulW_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}.Fv2ulW_modes{background:var(--dsw-alias-interactive-bg-hover,#0000000a);border-radius:18px;flex-wrap:wrap;gap:4px;padding:3px;display:inline-flex}.Fv2ulW_mode{appearance:none;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:14px;outline:none;padding:0 12px;font-size:13px;font-weight:500;line-height:20px}.Fv2ulW_mode:hover:not(:disabled):not(.Fv2ulW_modeActive){color:var(--dsw-alias-label-primary)}.Fv2ulW_mode:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}.Fv2ulW_mode:disabled{opacity:.55;cursor:default}.Fv2ulW_modeActive{background:var(--dsw-specific-menu,#fff);color:var(--dsw-alias-label-primary);box-shadow:0 0 0 1px var(--dsw-alias-border-l2,#00000014)}.Fv2ulW_pickerWrap{margin-top:2px}.Fv2ulW_error{color:var(--dsw-alias-state-error-primary,#c0392b);margin:0;font-size:12px;line-height:18px}.Fv2ulW_frame{width:100%}.Fv2ulW_card{border:1px solid var(--dsw-alias-border-l2,#0000001a);background:var(--dsw-specific-menu,#fff);border-radius:12px;overflow:hidden}.Fv2ulW_strip{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-info-primary,#3b82f6) 12%, transparent);align-items:center;gap:.45rem;padding:.65rem .9rem;font-size:.8rem;font-weight:600;display:flex}.Fv2ulW_dot{background:var(--dsw-alias-state-info-primary,#3b82f6);border-radius:50%;width:.45rem;height:.45rem}.Fv2ulW_body{max-height:min(42vh,28rem);padding:.85rem 1rem;overflow:auto}.Fv2ulW_footer{border-top:1px solid var(--dsw-alias-border-l2,#00000014);flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.65rem;padding:.7rem .9rem;display:flex}.Fv2ulW_feedback{min-height:1.1rem;color:var(--dsw-alias-state-error-primary,#c0392b);font-size:.75rem}.Fv2ulW_actions{flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:.5rem;margin-left:auto;display:flex}.Fv2ulW_planPicker{align-items:center;min-width:0;display:flex}";
		const tagId$2 = "dsh-model-switch/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var styles_module_css_default = {
			"actions": "Fv2ulW_actions",
			"block": "Fv2ulW_block",
			"blockTitle": "Fv2ulW_blockTitle",
			"body": "Fv2ulW_body",
			"card": "Fv2ulW_card",
			"dot": "Fv2ulW_dot",
			"error": "Fv2ulW_error",
			"feedback": "Fv2ulW_feedback",
			"footer": "Fv2ulW_footer",
			"frame": "Fv2ulW_frame",
			"hint": "Fv2ulW_hint",
			"intro": "Fv2ulW_intro",
			"mode": "Fv2ulW_mode",
			"modeActive": "Fv2ulW_modeActive",
			"modes": "Fv2ulW_modes",
			"pickerWrap": "Fv2ulW_pickerWrap",
			"planPicker": "Fv2ulW_planPicker",
			"section": "Fv2ulW_section",
			"strip": "Fv2ulW_strip",
			"title": "Fv2ulW_title",
			"titleIcon": "Fv2ulW_titleIcon",
			"titleRow": "Fv2ulW_titleRow"
		};
		//#endregion
		//#region lib/client/SettingsSection.js
		/**
		* Settings section: 模型切换 — subagent + plan-execute routes.
		*/
		function RouteBlock(props) {
			const { title, hint, route, onChange, sessionId, access, t, busy } = props;
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
							access,
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
			const { store, access, currentSessionId, t } = props;
			if (store === void 0 || access === void 0 || currentSessionId === void 0 || t === void 0) return null;
			const snap = (0, react.useSyncExternalStore)((listener) => store.subscribe(listener), () => store.getSnapshot());
			const value = snap.value;
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [sessionId, setSessionId] = (0, react.useState)(currentSessionId());
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
				store.saveRoute(field, next).then(() => {
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
							snap.error === "unavailable" ? t("unavailable") : error ?? snap.error
						]
					}) : null,
					(0, react_jsx_runtime.jsx)(RouteBlock, {
						title: t("subagentTitle"),
						hint: t("subagentHint"),
						route: subagent,
						sessionId,
						access,
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
						access,
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
		//#region lib/client/plan-review.js
		/**
		* Local plan-review narrowing over the official question carrier.
		* The carrier (PendingQuestion/answer protocol) is owned by ui-user-questions;
		* only this pure narrowing lives here.
		*/
		/** The carrier kind is `question` or `plan-review`; both arrive as QuestionWait. */
		function isQuestionCarrier(pendingInteraction) {
			if (typeof pendingInteraction !== "object" || pendingInteraction === null) return false;
			const kind = pendingInteraction.kind;
			return kind === "question" || kind === "plan-review";
		}
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
		async function selectModel(remote, sessionId, selection) {
			const result = await remote.session.selectModel({
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
		function PlanReviewPanel({ pending, review, store, remote, access, t, isSessionRunning }) {
			const snap = (0, react.useSyncExternalStore)((listener) => store.subscribe(listener), () => store.getSnapshot());
			const settingsSelection = (0, react.useMemo)(() => resolveCustomSelection(snap.value.planExecute), [snap.value.planExecute]);
			const settingsReady = snap.status === "ready" || snap.status === "error";
			const [panelSelection, setPanelSelection] = (0, react.useState)(void 0);
			const [pickerReady, setPickerReady] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const markdownLabels = (0, react.useMemo)(() => ({
				code: {
					copyLabel: t("codeCopy"),
					copiedLabel: t("codeCopied")
				},
				footnotes: t("footnotes")
			}), [t]);
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
						previous = toConfig(access.currentSelection(pending.sessionId));
						if (previous === void 0 || !sameSelection(effective, previous)) {
							await selectModel(remote, pending.sessionId, effective);
							switched = true;
						}
					}
					await pending.answer({ answers: [{
						id: review.id,
						selected: [review.approve.label]
					}] });
					if (switched && previous !== void 0) try {
						await waitSessionIdle(pending.sessionId, isSessionRunning);
						await selectModel(remote, pending.sessionId, previous);
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
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
								text: review.plan,
								labels: markdownLabels
							})
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
											access,
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
		function toConfig(selection) {
			if (selection === void 0 || !selection.provider || !selection.model) return void 0;
			return {
				provider: selection.provider,
				model: selection.model,
				...selection.reasoningEffort === void 0 ? {} : { reasoningEffort: selection.reasoningEffort }
			};
		}
		//#endregion
		//#region lib/client/PlanReviewComposer.js
		/**
		* Composer-chain entry that claims plan-review waits (higher priority than stock).
		* The question carrier is the official ui-user-questions value; the plan-review
		* narrowing is local (plan-review.ts).
		*/
		/** Select only plan-review question waits. */
		function selectPlanReview({ pendingInteraction }) {
			if (!isQuestionCarrier(pendingInteraction)) return null;
			return planReviewOf(pendingInteraction.questions) !== void 0 ? pendingInteraction : null;
		}
		function PlanReviewComposer(props) {
			const { matched, store, remote, access, t, isSessionRunning } = props;
			const review = (0, react.useMemo)(() => planReviewOf(matched.questions), [matched]);
			if (store === void 0 || remote === void 0 || access === void 0 || t === void 0 || isSessionRunning === void 0 || review === void 0) return null;
			return (0, react_jsx_runtime.jsx)(PlanReviewPanel, {
				pending: matched,
				review,
				store,
				remote,
				access,
				t,
				isSessionRunning
			});
		}
		//#endregion
		//#region \0dsh-css:/workspace/src/client/SubagentModelBadge.module.css.mjs
		const css$1 = ".HdNSPG_badge{min-width:0;max-width:220px;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;border-radius:12px;align-items:center;padding:2px 8px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex;overflow:hidden}";
		const tagId$1 = "dsh-model-switch/SubagentModelBadge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var SubagentModelBadge_module_css_default = { "badge": "HdNSPG_badge" };
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
		//#region \0dsh-css:/workspace/src/client/SubagentCatalogAction.module.css.mjs
		const css = ".szMMhq_root{position:relative}.szMMhq_trigger{min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:3px;padding:3px 2px;font-size:12px;line-height:18px;display:inline-flex}.szMMhq_count{margin:0 5px}.szMMhq_activitySlot{flex:none;width:10px;height:10px;display:inline-flex}.szMMhq_trigger:hover,.szMMhq_trigger:focus-visible{color:var(--dsw-alias-label-secondary)}.szMMhq_trigger svg{transition:transform .12s}.szMMhq_triggerOpen{transform:rotate(180deg)}.szMMhq_menu{z-index:100;box-sizing:border-box;background:var(--dsw-specific-menu);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);width:336px;max-width:min(400px,100vw - 32px);max-height:min(560px,100vh - 140px);box-shadow:var(--dsw-shadow-lv3);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;top:calc(100% + 5px);left:0;overflow:auto}.szMMhq_node{min-width:0;position:relative}.szMMhq_menu>.szMMhq_node{margin-left:-3px}.szMMhq_row{box-sizing:border-box;width:100%;min-height:50px;color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;background:0 0;border:0;border-radius:8px;outline:none;align-items:flex-start;gap:8px;padding:7px 8px 7px 11px;font-size:13px;line-height:18px;display:flex;position:relative}.szMMhq_row:hover>.szMMhq_clickarea,.szMMhq_row:focus-visible>.szMMhq_clickarea{background:var(--dsw-alias-interactive-bg-hover)}.szMMhq_clickarea{box-sizing:border-box;border-radius:8px;flex:1;align-self:stretch;align-items:flex-start;gap:8px;min-width:0;margin:-7px -8px;padding:7px 8px;display:flex}.szMMhq_row>[data-state],.szMMhq_clickarea>[data-state]{margin-top:4px}.szMMhq_disabled{color:var(--dsw-alias-label-dimmed);cursor:not-allowed}.szMMhq_disabled:hover{background:0 0}.szMMhq_loadingRow{cursor:default}.szMMhq_disclosure,.szMMhq_disclosureSpace{flex:none;width:14px;height:18px}.szMMhq_disclosure{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;padding:0;transition:transform .12s;display:inline-flex}.szMMhq_disclosure:hover{color:var(--dsw-alias-label-primary)}.szMMhq_disclosureOpen{transform:rotate(90deg)}.szMMhq_content{flex-direction:column;flex:1;min-width:0;display:flex}.szMMhq_label,.szMMhq_summary{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.szMMhq_label{color:inherit;font-weight:400}.szMMhq_summary,.szMMhq_metrics{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.szMMhq_metrics{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap;flex-direction:column;flex:none;justify-content:center;align-items:flex-end;gap:0;min-width:0;max-width:148px;display:flex}.szMMhq_metricModel{max-width:100%;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;font-size:11px;font-weight:500;line-height:16px;overflow:hidden}.szMMhq_metricToken{line-height:18px}.szMMhq_metricDuration{line-height:16px}.szMMhq_children{margin-left:18px;padding-left:4px;position:relative}.szMMhq_children:before,.szMMhq_children>.szMMhq_node:before{content:\"\";border-left:1px solid var(--dsw-alias-border-l2);position:absolute;left:0}.szMMhq_children:before{height:26px;top:-26px}.szMMhq_children[aria-busy=true]:before{content:none}.szMMhq_children>.szMMhq_node:before{top:0;bottom:0;left:-4px}.szMMhq_children>.szMMhq_node:last-child:before{height:17px;bottom:auto}.szMMhq_children>.szMMhq_node>.szMMhq_row:before{content:\"\";border-top:1px solid var(--dsw-alias-border-l2);width:14px;position:absolute;top:16px;left:-4px}.szMMhq_notice,.szMMhq_error{color:var(--dsw-alias-label-tertiary);padding:10px 12px;font-size:12px;line-height:18px}.szMMhq_error{color:var(--dsw-alias-state-error-primary);justify-content:space-between;align-items:center;gap:12px;display:flex}.szMMhq_refresh{color:inherit;cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;align-items:center;gap:4px;padding:4px 6px;display:inline-flex}.szMMhq_refresh:hover{background:var(--dsw-alias-interactive-bg-hover)}";
		const tagId = "dsh-model-switch/SubagentCatalogAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SubagentCatalogAction_module_css_default = {
			"activitySlot": "szMMhq_activitySlot",
			"children": "szMMhq_children",
			"clickarea": "szMMhq_clickarea",
			"content": "szMMhq_content",
			"count": "szMMhq_count",
			"disabled": "szMMhq_disabled",
			"disclosure": "szMMhq_disclosure",
			"disclosureOpen": "szMMhq_disclosureOpen",
			"disclosureSpace": "szMMhq_disclosureSpace",
			"error": "szMMhq_error",
			"label": "szMMhq_label",
			"loadingRow": "szMMhq_loadingRow",
			"menu": "szMMhq_menu",
			"metricDuration": "szMMhq_metricDuration",
			"metricModel": "szMMhq_metricModel",
			"metricToken": "szMMhq_metricToken",
			"metrics": "szMMhq_metrics",
			"node": "szMMhq_node",
			"notice": "szMMhq_notice",
			"refresh": "szMMhq_refresh",
			"root": "szMMhq_root",
			"row": "szMMhq_row",
			"summary": "szMMhq_summary",
			"trigger": "szMMhq_trigger",
			"triggerOpen": "szMMhq_triggerOpen"
		};
		//#endregion
		//#region lib/client/SubagentCatalogAction.js
		/** Tally subagent-origin descendants (all depths) per parent session id. */
		function indexSubagentDescendants(summaries) {
			const children = /* @__PURE__ */ new Map();
			for (const summary of Object.values(summaries)) {
				if (summary.origin !== "subagent" || summary.parentId === void 0) continue;
				const siblings = children.get(summary.parentId);
				if (siblings === void 0) children.set(summary.parentId, [summary]);
				else siblings.push(summary);
			}
			const index = /* @__PURE__ */ new Map();
			for (const [rootId, roots] of children) {
				let count = 0;
				let runningCount = 0;
				const queue = [...roots];
				while (queue.length > 0) {
					const node = queue.pop();
					count += 1;
					if (node.running) runningCount += 1;
					const grandChildren = children.get(node.id);
					if (grandChildren !== void 0) queue.push(...grandChildren);
				}
				index.set(rootId, {
					count,
					runningCount
				});
			}
			return index;
		}
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
			const descendants = (0, react.useMemo)(() => indexSubagentDescendants(summaries).get(sessionId) ?? NO_DESCENDANTS, [sessionId, summaries]);
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
			"sessions",
			"remote",
			"remote.session",
			"settingsScope"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "model-switch: dictionaries");
			const t = ctx.locale.bind(NS);
			const sessions = ctx.sessions;
			const store = new ConfigStore(ctx.settingsScope.bind({ namespace: MODEL_SWITCH_NS }));
			const labels = new SessionLabelStore();
			const remote = ctx.remote;
			const currentSelection = (sessionId) => {
				const selection = sessions.list.getSnapshot().byId[sessionId]?.projectionValues?.modelSelection;
				return selection?.next ?? selection?.lastUsed ?? void 0;
			};
			const access = {
				async loadCatalog() {
					const result = await remote.session.modelCatalog();
					if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
					return result.value;
				},
				currentSelection
			};
			const settingsInject = () => ({
				store,
				access,
				currentSessionId: () => sessions.list.getSnapshot().current,
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
				remote,
				access,
				t,
				isSessionRunning: (sessionId) => sessions.list.getSnapshot().byId[sessionId]?.running === true
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
			const catalogInject = () => ({
				openChild(address) {
					sessions.openSubagent(address);
				},
				refresh(parentSessionId) {
					sessions.refreshSubagents(parentSessionId);
				},
				setCatalogOpen(parentSessionId, open) {
					sessions.setSubagentCatalogOpen(parentSessionId, open);
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