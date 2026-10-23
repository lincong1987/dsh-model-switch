window.__ModuleLoader__.load({
	id: "dsh-model-switch",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
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
			searchModels: "搜索供应商、模型或描述…",
			noSearchResults: "没有匹配的模型",
			effortLabel: "推理档位",
			effortDefault: "提供方默认",
			triggerFallback: "选择模型",
			triggerSelectAria: "选择模型",
			menuAria: "模型与推理档位",
			statusLoading: "加载中…",
			emptyModels: "暂无可用模型",
			emptyEfforts: "当前模型无推理档位",
			retry: "重试",
			loadError: "无法加载模型列表",
			saveError: "保存失败",
			unavailable: "设置不可用或当前 DSH 连接断开。",
			restoreError: "恢复主会话模型失败",
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
			searchModels: "Search providers, models, or descriptions…",
			noSearchResults: "No matching models",
			effortLabel: "Reasoning effort",
			effortDefault: "Provider default",
			triggerFallback: "Select model",
			triggerSelectAria: "Select model",
			menuAria: "Model and reasoning effort",
			statusLoading: "Loading…",
			emptyModels: "No models available",
			emptyEfforts: "No reasoning efforts for this model",
			retry: "Retry",
			loadError: "Failed to load models",
			saveError: "Failed to save",
			unavailable: "Settings are unavailable or the DSH connection is offline.",
			restoreError: "Failed to restore the main-session model",
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
		//#region lib/shared.js
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
		//#region lib/client/config-store.js
		/**
		* Client mirror of the Host plugin Config namespace.
		*
		* DSH 0.2 exposes plugin Config values through the settings Remote. The
		* namespace is the Loader entry id (`model-switch` from cordis.patch.yml).
		*/
		const EMPTY = {};
		/**
		* Strip own-properties whose value is `undefined` before the strict Remote codec.
		* For example, a route with `selection: undefined` is not valid JSON.
		*/
		function toJsonPatch(field, value) {
			return JSON.parse(JSON.stringify({ [field]: value }));
		}
		function errorMessage(error) {
			return `${error.code}: ${error.message}`;
		}
		/** Reactive, revision-fenced view of this plugin's Host Config entry. */
		var ConfigStore = class {
			remote;
			namespace;
			snap = {
				status: "loading",
				value: EMPTY,
				error: null,
				writable: false
			};
			revision;
			readGeneration = 0;
			writeTail = Promise.resolve();
			listeners = /* @__PURE__ */ new Set();
			constructor(remote, namespace = MODEL_SWITCH_NS) {
				this.remote = remote;
				this.namespace = namespace;
			}
			getSnapshot = () => this.snap;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			async refresh() {
				const generation = ++this.readGeneration;
				let result;
				try {
					result = await this.remote.settings.describe();
				} catch (cause) {
					if (generation !== this.readGeneration) return;
					this.revision = void 0;
					this.publish({
						...this.snap,
						status: "error",
						error: cause instanceof Error ? cause.message : String(cause),
						writable: false
					});
					return;
				}
				if (generation !== this.readGeneration) return;
				if (!result.ok) {
					this.revision = void 0;
					this.publish({
						...this.snap,
						status: "error",
						error: errorMessage(result.error),
						writable: false
					});
					return;
				}
				const entry = result.value.namespaces.find((row) => row.ns === this.namespace);
				if (entry === void 0) {
					this.revision = void 0;
					this.publish({
						...this.snap,
						status: "error",
						error: `settings namespace not found: ${this.namespace}`,
						writable: false
					});
					return;
				}
				this.revision = entry.revision;
				this.publish({
					status: "ready",
					value: entry.value,
					error: null,
					writable: result.value.writable
				});
			}
			/** Persist one route against the most recently observed revision. */
			saveRoute(field, next) {
				const task = this.writeTail.then(() => this.persistRoute(field, next));
				this.writeTail = task.then(() => void 0, () => void 0);
				return task;
			}
			async persistRoute(field, next) {
				if (this.snap.status !== "ready" || this.revision === void 0) throw new Error(this.snap.error ?? "settings are not loaded");
				if (!this.snap.writable) throw new Error("host settings are read-only");
				const result = await this.remote.settings.update(this.namespace, toJsonPatch(field, next), this.revision);
				if (!result.ok) {
					await this.refresh();
					throw new Error(errorMessage(result.error));
				}
				this.revision = result.value.revision;
				this.publish({
					status: "ready",
					value: result.value.value,
					error: null,
					writable: this.snap.writable
				});
			}
			publish(next) {
				this.snap = next;
				for (const listener of this.listeners) listener();
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
		//#region \0dsh-css:D:\deepseekHarness工作区\dsh-model-switch\src\client\UiGlyphs.module.css.mjs
		const css$3 = ".FFTS_q_stateDot{background:var(--dsw-alias-state-idle-primary);border-radius:50%;flex:none;width:7px;height:7px;margin-top:4px;display:inline-block}.FFTS_q_stateDot[data-state=ongoing]{background:var(--dsw-alias-brand-primary)}.FFTS_q_stateDot[data-state=done]{background:var(--dsw-alias-state-success-primary)}.FFTS_q_stateDot[data-state=error]{background:var(--dsw-alias-state-error-primary)}";
		const tagId$3 = "dsh-model-switch/UiGlyphs.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region lib/client/UiGlyphs.js
		function IconChevronDownOutline14({ className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className,
				width: "14",
				height: "14",
				viewBox: "0 0 14 14",
				fill: "none",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "m3.5 5.25 3.5 3.5 3.5-3.5",
					stroke: "currentColor",
					strokeWidth: "1.4",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function IconChevronRightOutline14({ className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className,
				width: "14",
				height: "14",
				viewBox: "0 0 14 14",
				fill: "none",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "m5.25 3.5 3.5 3.5-3.5 3.5",
					stroke: "currentColor",
					strokeWidth: "1.4",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function IconCheckOutline16({ className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className,
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "m3 8.25 3.1 3.1L13 4.75",
					stroke: "currentColor",
					strokeWidth: "1.6",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function IconEditOutline16({ className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className,
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "m9.9 3.1 3 3M2.5 13.5l2.9-.6 7.8-7.8a1.25 1.25 0 0 0-1.8-1.8l-7.8 7.8-.6 2.4Z",
					stroke: "currentColor",
					strokeWidth: "1.2",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		//#endregion
		//#region \0dsh-css:D:\deepseekHarness工作区\dsh-model-switch\src\client\ModelPicker.module.css.mjs
		const css$2 = ".Bk9v4G_root{min-width:0;position:relative}.Bk9v4G_trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}.Bk9v4G_trigger:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}.Bk9v4G_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l2)}.Bk9v4G_trigger:disabled{color:var(--dsw-alias-label-secondary);cursor:default}.Bk9v4G_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.Bk9v4G_triggerEffort{color:var(--dsw-alias-label-secondary);flex:none}.Bk9v4G_chevron{color:var(--dsw-alias-label-secondary);flex:none;transition:transform .12s}.Bk9v4G_chevronOpen{transform:rotate(180deg)}.Bk9v4G_menu{z-index:20;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);width:min(240px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:0 8px 24px color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-border-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-border-l1);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;overflow:hidden}.Bk9v4G_menuTop{bottom:calc(100% + 8px);right:0}.Bk9v4G_menuBottom{top:calc(100% + 8px);left:0}.Bk9v4G_searchInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;min-height:32px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;margin:2px 0 6px;padding:6px 8px;font-size:13px;line-height:18px}.Bk9v4G_searchInput::placeholder{color:var(--dsw-alias-label-secondary)}.Bk9v4G_searchInput:focus-visible{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px var(--dsw-alias-brand-primary)}.Bk9v4G_status,.Bk9v4G_empty{color:var(--dsw-alias-label-secondary);padding:10px;font-size:13px;line-height:20px}.Bk9v4G_error{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}.Bk9v4G_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}.Bk9v4G_groups{min-height:0;overflow-y:auto}.Bk9v4G_group+.Bk9v4G_group{margin-top:4px}.Bk9v4G_groupTitle{z-index:1;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-secondary);padding:5px 8px 3px;font-size:12px;font-weight:500;line-height:18px;position:sticky;top:0}.Bk9v4G_option{width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}.Bk9v4G_option:hover:not(:disabled),.Bk9v4G_option:focus-visible{background:var(--dsw-alias-bg-layer-2)}.Bk9v4G_option:disabled{color:var(--dsw-alias-label-secondary);cursor:default}.Bk9v4G_optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}.Bk9v4G_modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.Bk9v4G_description{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.Bk9v4G_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}.Bk9v4G_cell{width:100%;height:40px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;align-items:center;gap:8px;padding:0 10px;font-size:14px;line-height:22px;display:flex}.Bk9v4G_cell:hover{background:var(--dsw-alias-bg-layer-2)}.Bk9v4G_cellLabel{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.Bk9v4G_cellValue{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-secondary);flex:0 auto;overflow:hidden}.Bk9v4G_cellChevron{color:var(--dsw-alias-label-secondary);flex:none}.Bk9v4G_muted{color:var(--dsw-alias-label-secondary);margin:0;font-size:.8rem}";
		const tagId$2 = "dsh-model-switch/ModelPicker.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var ModelPicker_module_css_default = {
			"cell": "Bk9v4G_cell",
			"cellChevron": "Bk9v4G_cellChevron",
			"cellLabel": "Bk9v4G_cellLabel",
			"cellValue": "Bk9v4G_cellValue",
			"check": "Bk9v4G_check",
			"chevron": "Bk9v4G_chevron",
			"chevronOpen": "Bk9v4G_chevronOpen",
			"description": "Bk9v4G_description",
			"empty": "Bk9v4G_empty",
			"error": "Bk9v4G_error",
			"group": "Bk9v4G_group",
			"groupTitle": "Bk9v4G_groupTitle",
			"groups": "Bk9v4G_groups",
			"menu": "Bk9v4G_menu",
			"menuBottom": "Bk9v4G_menuBottom",
			"menuTop": "Bk9v4G_menuTop",
			"modelName": "Bk9v4G_modelName",
			"muted": "Bk9v4G_muted",
			"option": "Bk9v4G_option",
			"optionCopy": "Bk9v4G_optionCopy",
			"retry": "Bk9v4G_retry",
			"root": "Bk9v4G_root",
			"searchInput": "Bk9v4G_searchInput",
			"status": "Bk9v4G_status",
			"trigger": "Bk9v4G_trigger",
			"triggerEffort": "Bk9v4G_triggerEffort",
			"triggerLabel": "Bk9v4G_triggerLabel"
		};
		//#endregion
		//#region lib/client/ModelPicker.js
		/**
		* Compact model catalog picker (settings + plan panel).
		* Visual/UX mirrors conversation.input.model (ModelSelect); selection is local.
		*/
		/** Filter catalog groups by provider/model identity and model description. */
		function filterModelGroups(groups, query) {
			const term = query.trim().toLowerCase();
			if (term.length === 0) return groups;
			return groups.flatMap((group) => {
				const models = `${group.name} ${group.id}`.toLowerCase().includes(term) ? group.models : group.models.filter((model) => `${model.name} ${model.id} ${model.description ?? ""}`.toLowerCase().includes(term));
				return models.length === 0 ? [] : [{
					...group,
					models
				}];
			});
		}
		function ModelPicker({ sessionId, access, value, onChange, t, disabled, className, placement = "bottom" }) {
			const [catalog, setCatalog] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("root");
			const [searchQuery, setSearchQuery] = (0, react.useState)("");
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
				setLoading(true);
				setError(null);
				access.loadCatalog().then((next) => {
					setCatalog(next);
					setLoading(false);
					const current = sessionId === void 0 ? void 0 : access.currentSelection(sessionId);
					seedFromCurrent(current ?? next.default);
				}).catch((cause) => {
					setLoading(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
			};
			(0, react.useEffect)(() => {
				let cancelled = false;
				setLoading(true);
				setError(null);
				access.loadCatalog().then((next) => {
					if (cancelled) return;
					setLoading(false);
					setCatalog(next);
					const current = sessionId === void 0 ? void 0 : access.currentSelection(sessionId);
					seedFromCurrent(current ?? next.default);
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
			const filteredGroups = (0, react.useMemo)(() => filterModelGroups(groups, searchQuery), [groups, searchQuery]);
			const filteredModelCount = filteredGroups.reduce((count, group) => count + group.models.length, 0);
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
				if (event.target instanceof HTMLInputElement) return;
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
					"aria-haspopup": pane === "model" ? "dialog" : "menu",
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
						(0, react_jsx_runtime.jsx)(IconChevronDownOutline14, { className: [ModelPicker_module_css_default.chevron, open ? ModelPicker_module_css_default.chevronOpen : ""].filter(Boolean).join(" ") })
					]
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					id: `${id}-menu`,
					className: menuClass,
					role: pane === "model" ? "dialog" : "menu",
					"aria-label": pane === "model" ? t("modelLabel") : t("menuAria"),
					"aria-busy": loading,
					children: [
						pane === "root" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
							ref: itemRef(),
							type: "button",
							role: "menuitem",
							className: ModelPicker_module_css_default.cell,
							onClick: () => {
								setSearchQuery("");
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
								(0, react_jsx_runtime.jsx)(IconChevronRightOutline14, { className: ModelPicker_module_css_default.cellChevron })
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
								(0, react_jsx_runtime.jsx)(IconChevronRightOutline14, { className: ModelPicker_module_css_default.cellChevron })
							]
						})] }),
						pane === "model" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsx)("input", {
								autoFocus: true,
								className: ModelPicker_module_css_default.searchInput,
								type: "search",
								disabled,
								"aria-label": t("searchModels"),
								placeholder: t("searchModels"),
								value: searchQuery,
								onChange: (event) => {
									setSearchQuery(event.currentTarget.value);
								}
							}),
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
								role: "menu",
								"aria-label": t("modelLabel"),
								children: filteredGroups.map((group) => {
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
													children: isSelected ? (0, react_jsx_runtime.jsx)(IconCheckOutline16, {}) : null
												})]
											}, model.id);
										})]
									}, group.id);
								})
							}),
							!loading && error === null && filteredModelCount === 0 && (0, react_jsx_runtime.jsx)("div", {
								className: ModelPicker_module_css_default.empty,
								role: "status",
								"aria-live": "polite",
								children: searchQuery.trim().length > 0 ? t("noSearchResults") : t("emptyModels")
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
								children: effectiveEffort === level.effort ? (0, react_jsx_runtime.jsx)(IconCheckOutline16, {}) : null
							})]
						}, level.key)))
					]
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:D:\deepseekHarness工作区\dsh-model-switch\src\client\styles.module.css.mjs
		const css$1 = ".TCu_Cq_section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;padding:.25rem 0 1.5rem;display:flex}.TCu_Cq_titleRow{align-items:center;gap:8px;display:flex}.TCu_Cq_titleIcon{color:var(--dsw-alias-label-secondary);flex:none}.TCu_Cq_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}.TCu_Cq_intro{color:var(--dsw-alias-label-secondary);margin:0;font-size:14px;line-height:22px}.TCu_Cq_block{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:10px;padding:12px 0 0;display:flex}.TCu_Cq_blockTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:500;line-height:22px}.TCu_Cq_hint{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:18px}.TCu_Cq_modes{background:var(--dsw-alias-bg-layer-2);border-radius:18px;flex-wrap:wrap;gap:4px;padding:3px;display:inline-flex}.TCu_Cq_mode{appearance:none;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:14px;outline:none;padding:0 12px;font-size:13px;font-weight:500;line-height:20px}.TCu_Cq_mode:hover:not(:disabled):not(.TCu_Cq_modeActive){color:var(--dsw-alias-label-primary)}.TCu_Cq_mode:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l2)}.TCu_Cq_mode:disabled{opacity:.55;cursor:default}.TCu_Cq_modeActive{background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}.TCu_Cq_pickerWrap{margin-top:2px}.TCu_Cq_error{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px;line-height:18px}.TCu_Cq_frame{width:100%}.TCu_Cq_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);border-radius:12px;overflow:hidden}.TCu_Cq_strip{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);align-items:center;gap:.45rem;padding:.65rem .9rem;font-size:.8rem;font-weight:600;display:flex}.TCu_Cq_dot{background:var(--dsw-alias-brand-primary);border-radius:50%;width:.45rem;height:.45rem}.TCu_Cq_body{max-height:min(42vh,28rem);padding:.85rem 1rem;overflow:auto}.TCu_Cq_planText{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;font-size:13px;line-height:1.55}.TCu_Cq_planText p{white-space:pre-wrap;margin:.45em 0}.TCu_Cq_planText h1,.TCu_Cq_planText h2,.TCu_Cq_planText h3,.TCu_Cq_planText h4,.TCu_Cq_planText h5,.TCu_Cq_planText h6{color:var(--dsw-alias-label-primary);margin:.8em 0 .35em;line-height:1.35}.TCu_Cq_planText h1{font-size:1.35em}.TCu_Cq_planText h2{font-size:1.25em}.TCu_Cq_planText h3{font-size:1.15em}.TCu_Cq_planText h4,.TCu_Cq_planText h5,.TCu_Cq_planText h6{font-size:1.05em}.TCu_Cq_planText ul,.TCu_Cq_planText ol{margin:.45em 0;padding-left:1.5em}.TCu_Cq_planText .TCu_Cq_taskItem{margin-left:-1.5em;list-style:none}.TCu_Cq_planText .TCu_Cq_taskCheck{border:1px solid var(--dsw-alias-border-l2);vertical-align:-.08em;border-radius:3px;width:.82em;height:.82em;margin-right:.45em;display:inline-block}.TCu_Cq_planText .TCu_Cq_taskCheck[aria-checked=true]{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}.TCu_Cq_planText .TCu_Cq_taskCheck[aria-checked=true]:after{content:\"✓\";text-align:center;margin-top:-.18em;font-size:.78em;line-height:1.1;display:block}.TCu_Cq_planText del{color:var(--dsw-alias-label-secondary)}.TCu_Cq_tableWrap{max-width:100%;margin:.55em 0;overflow-x:auto}.TCu_Cq_planText table{border-collapse:collapse;width:100%}.TCu_Cq_planText th,.TCu_Cq_planText td{border:1px solid var(--dsw-alias-border-l2);text-align:left;vertical-align:top;padding:.35em .55em}.TCu_Cq_planText th{background:var(--dsw-alias-bg-layer-2);font-weight:600}.TCu_Cq_planText blockquote{border-left:2px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);white-space:pre-wrap;margin:.55em 0;padding-left:.8em}.TCu_Cq_planText pre{background:var(--dsw-alias-bg-layer-2);white-space:pre;border-radius:8px;margin:.55em 0;padding:.7em .85em;overflow:auto}.TCu_Cq_planText code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.TCu_Cq_planText :not(pre)>code{background:var(--dsw-alias-bg-layer-2);border-radius:4px;padding:.08em .28em}.TCu_Cq_planText a{color:var(--dsw-alias-brand-primary);text-decoration:underline}.TCu_Cq_planText hr{border:0;border-top:1px solid var(--dsw-alias-border-l2);margin:.8em 0}.TCu_Cq_footer{border-top:1px solid var(--dsw-alias-border-l2);flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.65rem;padding:.7rem .9rem;display:flex}.TCu_Cq_feedback{min-height:1.1rem;color:var(--dsw-alias-state-error-primary);font-size:.75rem}.TCu_Cq_actions{flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:.5rem;margin-left:auto;display:flex}.TCu_Cq_planButton{min-height:32px;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;justify-content:center;align-items:center;gap:6px;padding:5px 10px;font-size:13px;line-height:20px;display:inline-flex}.TCu_Cq_planButton:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}.TCu_Cq_planButton:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.TCu_Cq_planButton:disabled{opacity:.55;cursor:default}.TCu_Cq_planButtonGhost{color:var(--dsw-alias-label-secondary);background:0 0}.TCu_Cq_planButtonOutline{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}.TCu_Cq_planButtonPrimary{border-color:var(--dsw-alias-brand-primary);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-brand-primary)}.TCu_Cq_planPicker{align-items:center;min-width:0;display:flex}";
		const tagId$1 = "dsh-model-switch/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var styles_module_css_default = {
			"actions": "TCu_Cq_actions",
			"block": "TCu_Cq_block",
			"blockTitle": "TCu_Cq_blockTitle",
			"body": "TCu_Cq_body",
			"card": "TCu_Cq_card",
			"dot": "TCu_Cq_dot",
			"error": "TCu_Cq_error",
			"feedback": "TCu_Cq_feedback",
			"footer": "TCu_Cq_footer",
			"frame": "TCu_Cq_frame",
			"hint": "TCu_Cq_hint",
			"intro": "TCu_Cq_intro",
			"mode": "TCu_Cq_mode",
			"modeActive": "TCu_Cq_modeActive",
			"modes": "TCu_Cq_modes",
			"pickerWrap": "TCu_Cq_pickerWrap",
			"planButton": "TCu_Cq_planButton",
			"planButtonGhost": "TCu_Cq_planButtonGhost",
			"planButtonOutline": "TCu_Cq_planButtonOutline",
			"planButtonPrimary": "TCu_Cq_planButtonPrimary",
			"planPicker": "TCu_Cq_planPicker",
			"planText": "TCu_Cq_planText",
			"section": "TCu_Cq_section",
			"strip": "TCu_Cq_strip",
			"tableWrap": "TCu_Cq_tableWrap",
			"taskCheck": "TCu_Cq_taskCheck",
			"taskItem": "TCu_Cq_taskItem",
			"title": "TCu_Cq_title",
			"titleIcon": "TCu_Cq_titleIcon",
			"titleRow": "TCu_Cq_titleRow"
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
						busy: busy || snap.status === "loading" || !snap.writable,
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
						busy: busy || snap.status === "loading" || !snap.writable,
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
		//#region lib/client/plan-execution.js
		function sameSelection(a, b) {
			return a.provider === b.provider && a.model === b.model && (a.reasoningEffort ?? void 0) === (b.reasoningEffort ?? void 0);
		}
		/** Run one operation with a temporary model and restore the known prior model. */
		async function executeWithTemporaryModel(input) {
			const { current, selected, setModel, waitUntilIdle, execute, onRestoreError } = input;
			if (current === void 0) throw new Error("Cannot determine the current session model; refusing a non-restorable plan switch");
			if (sameSelection(current, selected)) return execute();
			let switched = false;
			try {
				switched = true;
				await setModel(selected);
				return await execute();
			} finally {
				if (switched) try {
					await waitUntilIdle();
					await setModel(current);
				} catch (cause) {
					onRestoreError(cause);
				}
			}
		}
		//#endregion
		//#region lib/client/PlanMarkdown.js
		const listMarker = /^\s*([-+*]|\d+[.)])\s+(.+)$/;
		const headingMarker = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
		const quoteMarker = /^\s{0,3}>\s?(.*)$/;
		const codeMarker = /^\s{0,3}```\s*([\w+-]*)\s*$/;
		const ruleMarker = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
		function tableCells(line) {
			if (!line.includes("|")) return void 0;
			return line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, "|").trim());
		}
		function isTableSeparator(line) {
			const cells = tableCells(line);
			return cells !== void 0 && cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
		}
		function isTableStart(lines, index) {
			const header = tableCells(lines[index] ?? "");
			return header !== void 0 && header.length > 1 && isTableSeparator(lines[index + 1] ?? "");
		}
		function listItem(value) {
			const task = /^\[([ xX])\]\s+(.*)$/.exec(value);
			return task === null ? { text: value } : {
				text: task[2] ?? "",
				checked: task[1]?.toLowerCase() === "x"
			};
		}
		function startsBlock(lines, index) {
			const line = lines[index] ?? "";
			return codeMarker.test(line) || headingMarker.test(line) || quoteMarker.test(line) || ruleMarker.test(line) || listMarker.test(line) || isTableStart(lines, index);
		}
		function parseBlocks(markdown) {
			const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
			const blocks = [];
			let index = 0;
			while (index < lines.length) {
				const line = lines[index] ?? "";
				if (line.trim().length === 0) {
					index += 1;
					continue;
				}
				const fence = codeMarker.exec(line);
				if (fence !== null) {
					const body = [];
					index += 1;
					while (index < lines.length && !/^\s{0,3}```\s*$/.test(lines[index] ?? "")) {
						body.push(lines[index] ?? "");
						index += 1;
					}
					if (index < lines.length) index += 1;
					blocks.push({
						kind: "code",
						text: body.join("\n"),
						...fence[1] ? { language: fence[1] } : {}
					});
					continue;
				}
				const heading = headingMarker.exec(line);
				if (heading !== null) {
					blocks.push({
						kind: "heading",
						level: heading[1]?.length ?? 1,
						text: heading[2] ?? ""
					});
					index += 1;
					continue;
				}
				if (ruleMarker.test(line)) {
					blocks.push({ kind: "rule" });
					index += 1;
					continue;
				}
				if (isTableStart(lines, index)) {
					const headers = tableCells(line) ?? [];
					index += 2;
					const rows = [];
					while (index < lines.length && (lines[index] ?? "").trim().length > 0) {
						const row = tableCells(lines[index] ?? "");
						if (row === void 0) break;
						rows.push(row);
						index += 1;
					}
					blocks.push({
						kind: "table",
						headers,
						rows
					});
					continue;
				}
				const list = listMarker.exec(line);
				if (list !== null) {
					const ordered = /^\d/.test(list[1] ?? "");
					const items = [];
					while (index < lines.length) {
						const row = listMarker.exec(lines[index] ?? "");
						if (row === null || /^\d/.test(row[1] ?? "") !== ordered) break;
						items.push(listItem(row[2] ?? ""));
						index += 1;
					}
					blocks.push({
						kind: ordered ? "ordered-list" : "unordered-list",
						items
					});
					continue;
				}
				if (quoteMarker.test(line)) {
					const quote = [];
					while (index < lines.length) {
						const row = quoteMarker.exec(lines[index] ?? "");
						if (row === null) break;
						quote.push(row[1] ?? "");
						index += 1;
					}
					blocks.push({
						kind: "quote",
						text: quote.join("\n")
					});
					continue;
				}
				const paragraph = [line];
				index += 1;
				while (index < lines.length) {
					const next = lines[index] ?? "";
					if (next.trim().length === 0 || startsBlock(lines, index)) break;
					paragraph.push(next);
					index += 1;
				}
				blocks.push({
					kind: "paragraph",
					text: paragraph.join("\n")
				});
			}
			return blocks;
		}
		const inlineToken = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|\[[^\]\n]+\]\([^)]+\))/g;
		function safeHttpUrl(value) {
			try {
				const url = new URL(value);
				return url.protocol === "http:" || url.protocol === "https:" ? url.href : void 0;
			} catch {
				return;
			}
		}
		function inlineNodes(text, keyPrefix) {
			const nodes = [];
			let cursor = 0;
			let tokenIndex = 0;
			for (const match of text.matchAll(inlineToken)) {
				const token = match[0];
				const offset = match.index ?? cursor;
				if (offset > cursor) nodes.push(text.slice(cursor, offset));
				const key = `${keyPrefix}-${tokenIndex++}`;
				if (token.startsWith("`")) nodes.push((0, react_jsx_runtime.jsx)("code", { children: token.slice(1, -1) }, key));
				else if (token.startsWith("**") || token.startsWith("__")) nodes.push((0, react_jsx_runtime.jsx)("strong", { children: inlineNodes(token.slice(2, -2), key) }, key));
				else if (token.startsWith("*") || token.startsWith("_")) nodes.push((0, react_jsx_runtime.jsx)("em", { children: inlineNodes(token.slice(1, -1), key) }, key));
				else if (token.startsWith("~~")) nodes.push((0, react_jsx_runtime.jsx)("del", { children: inlineNodes(token.slice(2, -2), key) }, key));
				else {
					const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
					const href = link === null ? void 0 : safeHttpUrl(link[2] ?? "");
					if (link !== null && href !== void 0) nodes.push((0, react_jsx_runtime.jsx)("a", {
						href,
						target: "_blank",
						rel: "noreferrer",
						children: inlineNodes(link[1] ?? "", key)
					}, key));
					else nodes.push(token);
				}
				cursor = offset + token.length;
			}
			if (cursor < text.length) nodes.push(text.slice(cursor));
			return nodes;
		}
		function PlanMarkdown({ text }) {
			const blocks = parseBlocks(text);
			return (0, react_jsx_runtime.jsx)("div", {
				className: styles_module_css_default.planText,
				children: blocks.map((block, index) => {
					const key = `block-${index}`;
					const children = inlineNodes(block.text ?? "", key);
					switch (block.kind) {
						case "heading": {
							const level = block.level ?? 1;
							if (level === 1) return (0, react_jsx_runtime.jsx)("h1", { children }, key);
							if (level === 2) return (0, react_jsx_runtime.jsx)("h2", { children }, key);
							if (level === 3) return (0, react_jsx_runtime.jsx)("h3", { children }, key);
							if (level === 4) return (0, react_jsx_runtime.jsx)("h4", { children }, key);
							if (level === 5) return (0, react_jsx_runtime.jsx)("h5", { children }, key);
							return (0, react_jsx_runtime.jsx)("h6", { children }, key);
						}
						case "unordered-list": return (0, react_jsx_runtime.jsx)("ul", { children: (block.items ?? []).map((item, row) => (0, react_jsx_runtime.jsxs)("li", {
							className: item.checked === void 0 ? void 0 : styles_module_css_default.taskItem,
							children: [item.checked !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: styles_module_css_default.taskCheck,
								role: "checkbox",
								"aria-checked": item.checked,
								"aria-disabled": "true"
							}), inlineNodes(item.text, `${key}-${row}`)]
						}, `${key}-${row}`)) }, key);
						case "ordered-list": return (0, react_jsx_runtime.jsx)("ol", { children: (block.items ?? []).map((item, row) => (0, react_jsx_runtime.jsx)("li", { children: inlineNodes(item.text, `${key}-${row}`) }, `${key}-${row}`)) }, key);
						case "table": return (0, react_jsx_runtime.jsx)("div", {
							className: styles_module_css_default.tableWrap,
							children: (0, react_jsx_runtime.jsxs)("table", { children: [(0, react_jsx_runtime.jsx)("thead", { children: (0, react_jsx_runtime.jsx)("tr", { children: (block.headers ?? []).map((cell, column) => (0, react_jsx_runtime.jsx)("th", { children: inlineNodes(cell, `${key}-h-${column}`) }, `${key}-h-${column}`)) }) }), (0, react_jsx_runtime.jsx)("tbody", { children: (block.rows ?? []).map((row, rowIndex) => (0, react_jsx_runtime.jsx)("tr", { children: (block.headers ?? []).map((_, column) => (0, react_jsx_runtime.jsx)("td", { children: inlineNodes(row[column] ?? "", `${key}-r-${rowIndex}-c-${column}`) }, `${key}-r-${rowIndex}-c-${column}`)) }, `${key}-r-${rowIndex}`)) })] })
						}, key);
						case "quote": return (0, react_jsx_runtime.jsx)("blockquote", { children }, key);
						case "code": return (0, react_jsx_runtime.jsx)("pre", { children: (0, react_jsx_runtime.jsx)("code", { children: block.text ?? "" }) }, key);
						case "rule": return (0, react_jsx_runtime.jsx)("hr", {}, key);
						case "paragraph": return (0, react_jsx_runtime.jsx)("p", { children }, key);
					}
				})
			});
		}
		//#endregion
		//#region lib/client/PlanReviewPanel.js
		/**
		* Enhanced plan-review panel with execution-model picker before Approve.
		*/
		function tooltip(description) {
			return description === void 0 ? {} : { title: description };
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
					const answer = () => pending.answer({ answers: [{
						id: review.id,
						selected: [review.approve.label]
					}] });
					if (effective === void 0) {
						await answer();
						return;
					}
					await executeWithTemporaryModel({
						current: toConfig(access.currentSelection(pending.sessionId)) ?? toConfig((await access.loadCatalog()).default),
						selected: effective,
						setModel: (selection) => selectModel(remote, pending.sessionId, selection),
						waitUntilIdle: () => waitSessionIdle(pending.sessionId, isSessionRunning),
						execute: answer,
						onRestoreError: (cause) => {
							console.warn("dsh-model-switch: failed to restore main session model after plan execute", cause);
							const detail = cause instanceof Error ? cause.message : String(cause);
							setError(`${t("restoreError")}: ${detail}`);
						}
					});
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
							children: (0, react_jsx_runtime.jsx)(PlanMarkdown, { text: review.plan })
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
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: `${styles_module_css_default.planButton} ${styles_module_css_default.planButtonGhost}`,
										disabled: busy,
										onClick: () => {
											settle(() => pending.dismiss());
										},
										children: [(0, react_jsx_runtime.jsx)(IconEditOutline16, {}), t("planDiscuss")]
									}),
									decline !== void 0 && (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `${styles_module_css_default.planButton} ${styles_module_css_default.planButtonOutline}`,
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
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `${styles_module_css_default.planButton} ${styles_module_css_default.planButtonPrimary}`,
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
		//#region \0dsh-css:D:\deepseekHarness工作区\dsh-model-switch\src\client\SubagentModelBadge.module.css.mjs
		const css = "._05QqfW_badge{min-width:0;max-width:220px;color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;border-radius:12px;align-items:center;padding:2px 8px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex;overflow:hidden}";
		const tagId = "dsh-model-switch/SubagentModelBadge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-switch";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SubagentModelBadge_module_css_default = { "badge": "_05QqfW_badge" };
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
			"remote.settings"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "model-switch: dictionaries");
			const t = ctx.locale.bind(NS);
			const sessions = ctx.sessions;
			const remote = ctx.remote;
			const store = new ConfigStore(remote);
			const labels = new SessionLabelStore();
			ctx.effect(() => {
				const refresh = () => {
					store.refresh().catch((cause) => {
						console.warn("dsh-model-switch: failed to refresh settings", cause);
					});
				};
				const offSettings = remote.$on("settings/document-updated", refresh);
				const offConnection = ctx.on("connection/reset", refresh);
				refresh();
				return () => {
					offSettings();
					offConnection();
				};
			}, "model-switch: settings mirror");
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
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map