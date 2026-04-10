export interface CheckboxProps {
    checked: boolean;
    onChange?: (next: boolean) => void;
    disabled?: boolean;
    indeterminate?: boolean;
    size?: 'sm' | 'md';
    ariaLabel?: string;
}
export declare function Checkbox({ checked, onChange, disabled, indeterminate, size, ariaLabel, }: CheckboxProps): import("react/jsx-runtime").JSX.Element;
