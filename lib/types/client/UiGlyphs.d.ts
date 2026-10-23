type IconProps = {
    className?: string;
};
type StateDotKind = 'ongoing' | 'done' | 'error';
export declare function IconChevronDownOutline14({ className }: IconProps): import("react").JSX.Element;
export declare function IconChevronRightOutline14({ className }: IconProps): import("react").JSX.Element;
export declare function IconCheckOutline16({ className }: IconProps): import("react").JSX.Element;
export declare function IconRefreshOutline14({ className }: IconProps): import("react").JSX.Element;
export declare function IconEditOutline16({ className }: IconProps): import("react").JSX.Element;
export declare function StateDot({ state }: {
    state: StateDotKind;
}): import("react").JSX.Element;
export {};
