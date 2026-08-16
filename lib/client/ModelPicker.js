import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Compact model catalog picker (settings + plan panel). Loads via session.models.
 */
import { useEffect, useMemo, useState } from 'react';
import css from './styles.module.css';
function sameSelection(a, b) {
    return a?.provider === b.provider
        && a.model === b.model
        && (a.reasoningEffort ?? undefined) === (b.reasoningEffort ?? undefined);
}
export function ModelPicker({ sessionId, api, value, onChange, t, disabled, className, }) {
    const [catalog, setCatalog] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (sessionId === undefined) {
            setCatalog(null);
            setError(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        void api.sessions.models({ sessionId }).then(({ result }) => {
            if (cancelled)
                return;
            setLoading(false);
            if (!result.ok) {
                setError(`${result.error.code}: ${result.error.message}`);
                return;
            }
            setCatalog(result.value);
            if (value === undefined) {
                const current = result.value.current;
                if (current.provider && current.model) {
                    onChange({
                        provider: current.provider,
                        model: current.model,
                        ...current.reasoningEffort === undefined ? {} : { reasoningEffort: current.reasoningEffort },
                    });
                }
            }
        }).catch((cause) => {
            if (cancelled)
                return;
            setLoading(false);
            setError(cause instanceof Error ? cause.message : String(cause));
        });
        return () => { cancelled = true; };
        // Intentionally omit value/onChange: mount/session drives catalog load.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, api]);
    const choices = useMemo(() => {
        if (catalog === null)
            return [];
        return catalog.groups.flatMap(group => group.models.map(model => ({
            provider: group.id,
            providerName: group.name,
            model: model.id,
            modelName: model.name,
            reasoning: model.reasoning,
        })));
    }, [catalog]);
    const selected = choices.find(c => c.provider === value?.provider && c.model === value?.model);
    const efforts = selected?.reasoning?.efforts ?? [];
    if (sessionId === undefined) {
        return _jsx("p", { className: css.muted, children: t('noSession') });
    }
    return (_jsxs("div", { className: [css.picker, className].filter(Boolean).join(' '), children: [error !== null ? _jsxs("p", { className: css.error, children: [t('loadError'), ": ", error] }) : null, _jsxs("label", { className: css.row, children: [_jsx("span", { className: css.label, children: t('modelLabel') }), _jsx("select", { className: css.select, disabled: disabled || loading || choices.length === 0, value: selected ? `${selected.provider}\0${selected.model}` : '', onChange: (event) => {
                            const [provider, model] = event.target.value.split('\0');
                            if (!provider || !model)
                                return;
                            const row = choices.find(c => c.provider === provider && c.model === model);
                            const defaultEffort = row?.reasoning?.defaultEffort;
                            onChange({
                                provider,
                                model,
                                ...defaultEffort === undefined ? {} : { reasoningEffort: defaultEffort },
                            });
                        }, children: choices.length === 0
                            ? _jsx("option", { value: "", children: loading ? '…' : '—' })
                            : choices.map(c => (_jsxs("option", { value: `${c.provider}\0${c.model}`, children: [c.providerName, " / ", c.modelName] }, `${c.provider}/${c.model}`))) })] }), efforts.length > 0 ? (_jsxs("label", { className: css.row, children: [_jsx("span", { className: css.label, children: t('effortLabel') }), _jsxs("select", { className: css.select, disabled: disabled || loading, value: value?.reasoningEffort ?? '', onChange: (event) => {
                            if (value === undefined)
                                return;
                            const effort = event.target.value;
                            onChange({
                                provider: value.provider,
                                model: value.model,
                                ...effort.length === 0 ? {} : { reasoningEffort: effort },
                            });
                        }, children: [selected?.reasoning?.defaultEffort === undefined
                                ? _jsx("option", { value: "", children: t('effortDefault') })
                                : null, efforts.map(effort => (_jsx("option", { value: effort.id, children: effort.name }, effort.id)))] })] })) : null, catalog !== null && value !== undefined && !sameSelection(value, catalog.current)
                ? null
                : null] }));
}
