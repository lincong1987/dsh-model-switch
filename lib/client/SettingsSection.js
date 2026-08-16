import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Settings section: 模型切换 — subagent + plan-execute routes.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ModelPicker } from "./ModelPicker.js";
import css from './styles.module.css';
function RouteBlock(props) {
    const { field, title, hint, route, onChange, sessionId, api, t, busy } = props;
    return (_jsxs("section", { className: css.block, children: [_jsx("h3", { className: css.blockTitle, children: title }), _jsx("p", { className: css.hint, children: hint }), _jsxs("div", { className: css.modes, role: "radiogroup", "aria-label": title, children: [_jsxs("label", { className: css.mode, children: [_jsx("input", { type: "radio", name: `model-switch-${field}`, checked: route.mode !== 'custom', disabled: busy, onChange: () => { onChange({ mode: 'follow-main', selection: route.selection }); } }), t('modeFollow')] }), _jsxs("label", { className: css.mode, children: [_jsx("input", { type: "radio", name: `model-switch-${field}`, checked: route.mode === 'custom', disabled: busy, onChange: () => { onChange({ mode: 'custom', selection: route.selection }); } }), t('modeCustom')] })] }), route.mode === 'custom' ? (_jsx(ModelPicker, { sessionId: sessionId, api: api, value: route.selection, disabled: busy, t: t, onChange: (selection) => {
                    onChange({ mode: 'custom', selection });
                } })) : null] }));
}
export function SettingsSection(props) {
    const { store, api, currentSessionId, t } = props;
    if (store === undefined || api === undefined || currentSessionId === undefined || t === undefined) {
        return null;
    }
    const snap = useSyncExternalStore((listener) => store.subscribe(listener), () => store.getSnapshot());
    const value = snap.value;
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [sessionId, setSessionId] = useState(currentSessionId());
    useEffect(() => {
        void store.load();
    }, [store]);
    useEffect(() => {
        const tick = () => { setSessionId(currentSessionId()); };
        tick();
        const id = window.setInterval(tick, 1000);
        return () => { window.clearInterval(id); };
    }, [currentSessionId]);
    const subagent = useMemo(() => value.subagent ?? { mode: 'follow-main' }, [value.subagent]);
    const planExecute = useMemo(() => value.planExecute ?? { mode: 'follow-main' }, [value.planExecute]);
    const writeRoute = (field, next) => {
        setBusy(true);
        setError(null);
        const payload = { ...value, [field]: next };
        void store.save(payload).then(() => {
            setBusy(false);
        }).catch((cause) => {
            setBusy(false);
            setError(cause instanceof Error ? cause.message : String(cause));
        });
    };
    return (_jsxs("div", { className: css.section, children: [_jsx("h2", { style: { margin: 0, fontSize: '1.1rem' }, children: t('title') }), _jsx("p", { className: css.intro, children: t('intro') }), error !== null || snap.error !== null
                ? _jsxs("p", { className: css.error, children: [t('saveError'), ": ", error ?? snap.error] })
                : null, _jsx(RouteBlock, { field: "subagent", title: t('subagentTitle'), hint: t('subagentHint'), route: subagent, sessionId: sessionId, api: api, t: t, busy: busy || snap.status === 'loading', onChange: (next) => { writeRoute('subagent', next); } }), _jsx(RouteBlock, { field: "planExecute", title: t('planTitle'), hint: t('planHint'), route: planExecute, sessionId: sessionId, api: api, t: t, busy: busy || snap.status === 'loading', onChange: (next) => { writeRoute('planExecute', next); } })] }));
}
