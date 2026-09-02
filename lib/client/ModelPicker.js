import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Compact model catalog picker (settings + plan panel).
 * Visual/UX mirrors conversation.input.model (ModelSelect); selection is local.
 */
import { useEffect, useId, useMemo, useRef, useState, } from 'react';
import { IconCheckOutline16, IconChevronDownOutline14, IconChevronRightOutline14, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './ModelPicker.module.css';
export function ModelPicker({ sessionId, access, value, onChange, t, disabled, className, placement = 'bottom', }) {
    const [catalog, setCatalog] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [pane, setPane] = useState('root');
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const itemRefs = useRef([]);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    const id = useId();
    valueRef.current = value;
    onChangeRef.current = onChange;
    const seedFromCurrent = (current) => {
        if (valueRef.current !== undefined)
            return;
        if (current === undefined || !current.provider || !current.model)
            return;
        onChangeRef.current({
            provider: current.provider,
            model: current.model,
            ...current.reasoningEffort === undefined ? {} : { reasoningEffort: current.reasoningEffort },
        });
    };
    const load = () => {
        if (sessionId === undefined) {
            setCatalog(null);
            setError(null);
            return;
        }
        setLoading(true);
        setError(null);
        void access.loadCatalog().then((next) => {
            setCatalog(next);
            seedFromCurrent(access.currentSelection(sessionId) ?? next.default);
        }).catch((cause) => {
            setLoading(false);
            setError(cause instanceof Error ? cause.message : String(cause));
        });
    };
    useEffect(() => {
        let cancelled = false;
        if (sessionId === undefined) {
            setCatalog(null);
            setError(null);
            return;
        }
        setLoading(true);
        setError(null);
        void access.loadCatalog().then((next) => {
            if (cancelled)
                return;
            setLoading(false);
            setCatalog(next);
            seedFromCurrent(access.currentSelection(sessionId) ?? next.default);
        }).catch((cause) => {
            if (cancelled)
                return;
            setLoading(false);
            setError(cause instanceof Error ? cause.message : String(cause));
        });
        return () => { cancelled = true; };
    }, [sessionId, access]);
    useEffect(() => {
        if (!open)
            return;
        const closeOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
                setPane('root');
            }
        };
        document.addEventListener('mousedown', closeOutside);
        return () => { document.removeEventListener('mousedown', closeOutside); };
    }, [open]);
    const choices = useMemo(() => {
        if (catalog === null)
            return [];
        return catalog.groups.flatMap(group => group.models.map(model => ({
            provider: group.id,
            providerName: group.name,
            model: model.id,
            modelName: model.name,
            description: model.description,
            reasoning: model.reasoning,
        })));
    }, [catalog]);
    const groups = catalog?.groups ?? [];
    const selected = choices.find(c => c.provider === value?.provider && c.model === value?.model);
    const reasoning = selected?.reasoning;
    const effectiveEffort = value?.reasoningEffort ?? reasoning?.defaultEffort;
    const effortLabel = reasoning === undefined
        ? undefined
        : effectiveEffort === undefined
            ? t('effortDefault')
            : reasoning.efforts.find(level => level.id === effectiveEffort)?.name ?? effectiveEffort;
    const effortChoices = useMemo(() => {
        if (reasoning === undefined)
            return [];
        return [
            ...reasoning.defaultEffort === undefined
                ? [{ key: 'provider-default', effort: undefined, label: t('effortDefault') }]
                : [],
            ...reasoning.efforts.map(effort => ({
                key: `effort:${effort.id}`,
                effort: effort.id,
                label: effort.name,
                ...effort.description === undefined ? {} : { description: effort.description },
            })),
        ];
    }, [reasoning, t]);
    const close = (restoreFocus = false) => {
        setOpen(false);
        setPane('root');
        if (restoreFocus)
            queueMicrotask(() => { triggerRef.current?.focus(); });
    };
    const show = () => {
        setPane('root');
        setOpen(true);
        load();
    };
    const moveFocus = (offset) => {
        const items = itemRefs.current.filter(item => item !== null);
        if (items.length === 0)
            return;
        const active = items.findIndex(item => item === document.activeElement);
        const next = (Math.max(active, 0) + offset + items.length) % items.length;
        items[next]?.focus();
    };
    const onRootKeyDown = (event) => {
        if (event.key === 'Escape' && open) {
            event.preventDefault();
            if (pane !== 'root')
                setPane('root');
            else
                close(true);
            return;
        }
        if (!open)
            return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveFocus(event.key === 'ArrowDown' ? 1 : -1);
        }
    };
    const onBlur = (event) => {
        if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget))
            return;
        close();
    };
    const chooseModel = (provider, model) => {
        const row = choices.find(c => c.provider === provider && c.model === model);
        const defaultEffort = row?.reasoning?.defaultEffort;
        onChange({
            provider,
            model,
            ...defaultEffort === undefined ? {} : { reasoningEffort: defaultEffort },
        });
        close(true);
    };
    const chooseEffort = (effort) => {
        if (value === undefined)
            return;
        onChange({
            provider: value.provider,
            model: value.model,
            ...effort === undefined ? {} : { reasoningEffort: effort },
        });
        close(true);
    };
    if (sessionId === undefined) {
        return _jsx("p", { className: css.muted, children: t('noSession') });
    }
    const modelLabel = selected?.modelName ?? t('triggerFallback');
    const triggerAria = selected === undefined
        ? t('triggerSelectAria')
        : effortLabel === undefined
            ? modelLabel
            : `${modelLabel} · ${effortLabel}`;
    itemRefs.current = [];
    let itemIndex = 0;
    const itemRef = () => {
        const at = itemIndex++;
        return (node) => { itemRefs.current[at] = node; };
    };
    const menuClass = placement === 'top'
        ? `${css.menu} ${css.menuTop}`
        : `${css.menu} ${css.menuBottom}`;
    return (_jsxs("div", { ref: rootRef, className: [css.root, className].filter(Boolean).join(' '), onKeyDown: onRootKeyDown, onBlur: onBlur, children: [_jsxs("button", { ref: triggerRef, type: "button", className: css.trigger, "aria-label": triggerAria, "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": open ? `${id}-menu` : undefined, title: triggerAria, disabled: disabled, onClick: () => {
                    if (open)
                        close();
                    else
                        show();
                }, children: [_jsx("span", { className: css.triggerLabel, children: modelLabel }), effortLabel !== undefined && _jsx("span", { className: css.triggerEffort, children: effortLabel }), _jsx(IconChevronDownOutline14, { className: [css.chevron, open ? css.chevronOpen : ''].filter(Boolean).join(' ') })] }), open && (_jsxs("div", { id: `${id}-menu`, className: menuClass, role: "menu", "aria-label": t('menuAria'), "aria-busy": loading, children: [pane === 'root' && (_jsxs(_Fragment, { children: [_jsxs("button", { ref: itemRef(), type: "button", role: "menuitem", className: css.cell, onClick: () => { setPane('model'); }, children: [_jsx("span", { className: css.cellLabel, children: t('modelLabel') }), _jsx("span", { className: css.cellValue, children: modelLabel }), _jsx(IconChevronRightOutline14, { className: css.cellChevron })] }), reasoning !== undefined && (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitem", className: css.cell, onClick: () => { setPane('effort'); }, children: [_jsx("span", { className: css.cellLabel, children: t('effortLabel') }), _jsx("span", { className: css.cellValue, children: effortLabel }), _jsx(IconChevronRightOutline14, { className: css.cellChevron })] }))] })), pane === 'model' && (_jsxs(_Fragment, { children: [loading && _jsx("div", { className: css.status, children: t('statusLoading') }), error !== null && (_jsxs("div", { className: css.error, children: [_jsxs("span", { children: [t('loadError'), ": ", error] }), _jsx("button", { type: "button", className: css.retry, onClick: load, children: t('retry') })] })), _jsx("div", { className: `${css.groups} scrollable`, children: groups.map((group) => {
                                    const headingId = `${id}-${group.id}`;
                                    return (_jsxs("section", { role: "group", "aria-labelledby": headingId, className: css.group, children: [_jsx("div", { className: css.groupTitle, id: headingId, children: group.name }), group.models.map((model) => {
                                                const isSelected = value?.provider === group.id && value.model === model.id;
                                                return (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitemradio", "aria-checked": isSelected, className: css.option, title: model.name, disabled: disabled, onClick: () => { chooseModel(group.id, model.id); }, children: [_jsxs("span", { className: css.optionCopy, children: [_jsx("span", { className: css.modelName, children: model.name }), model.description !== undefined && (_jsx("span", { className: css.description, children: model.description }))] }), _jsx("span", { className: css.check, children: isSelected ? _jsx(IconCheckOutline16, {}) : null })] }, model.id));
                                            })] }, group.id));
                                }) }), !loading && error === null && choices.length === 0 && (_jsx("div", { className: css.empty, children: t('emptyModels') }))] })), pane === 'effort' && (effortChoices.length === 0
                        ? _jsx("div", { className: css.empty, children: t('emptyEfforts') })
                        : effortChoices.map(level => (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitemradio", "aria-checked": effectiveEffort === level.effort, className: css.option, disabled: disabled, onClick: () => { chooseEffort(level.effort); }, children: [_jsxs("span", { className: css.optionCopy, children: [_jsx("span", { className: css.modelName, children: level.label }), level.description !== undefined && (_jsx("span", { className: css.description, children: level.description }))] }), _jsx("span", { className: css.check, children: effectiveEffort === level.effort ? _jsx(IconCheckOutline16, {}) : null })] }, level.key))))] }))] }));
}
