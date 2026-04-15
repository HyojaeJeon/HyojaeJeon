export interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    size?: 'sm' | 'md';
}
export declare function Toggle({ checked, onChange, disabled, label, size }: ToggleProps): import("react/jsx-runtime").JSX.Element;
