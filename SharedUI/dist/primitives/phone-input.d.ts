export interface PhoneInputProps {
    value: string;
    onChange: (e164: string) => void;
    disabled?: boolean;
    invalid?: boolean;
}
export declare function PhoneInput({ value, onChange, disabled, invalid }: PhoneInputProps): import("react/jsx-runtime").JSX.Element;
