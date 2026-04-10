import { jsx as _jsx } from "react/jsx-runtime";
import { Card } from '../primitives/card';
export function SectionCard(props) {
    return _jsx(Card, { ...props, children: props.children });
}
