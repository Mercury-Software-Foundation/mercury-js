import { ReactElement, MouseEvent, CSSProperties, ChangeEvent } from "react";

interface Button {
    children: ReactElement | string;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    className?: string;
    id?: string;
    ariaLabel?: string;
    style?: CSSProperties;
    variant?: "primary" | "secondary" | "outline" | "text";
}

interface Input {
    type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "date" | "time" | "datetime-local";
    value: string | number;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    className?: string;
    style?: CSSProperties;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    pattern?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    ariaLabel?: string;
    variant?: "standard" | "outlined" | "filled";
}

interface Text {
    children: ReactElement | string;
    className?: string;
    id?: string;
    style?: CSSProperties;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    ariaLabel?: string;
    variant?: 'body1' | 'body2' | 'caption' | 'overline' | 'subtitle1' | 'subtitle2' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}
