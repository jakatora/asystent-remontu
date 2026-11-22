import React, { useState, type CSSProperties } from 'react';
import { Colors } from '@/constants/colors';
import type { RadioCardProps } from './RadioCard';
/** Use a real controlled browser radio for Space, arrows and grouped focus.
 * source: https://react.dev/reference/react-dom/components/input */
export function RadioCard({ label, value, group, checked, disabled, onSelect, children, style }: RadioCardProps) {
  const [focused, setFocused] = useState(false);
  const {paddingHorizontal,paddingVertical,marginHorizontal,marginVertical,...css}=style;
  const dimension=(value:unknown)=>typeof value==='number'||typeof value==='string'?value:undefined;
  return <label style={{ display: 'flex', flexDirection: 'column', position: 'relative', boxSizing: 'border-box', borderStyle:'solid', paddingLeft:dimension(paddingHorizontal), paddingRight:dimension(paddingHorizontal), paddingTop:dimension(paddingVertical), paddingBottom:dimension(paddingVertical), marginLeft:dimension(marginHorizontal), marginRight:dimension(marginHorizontal), marginTop:dimension(marginVertical), marginBottom:dimension(marginVertical), ...(css as CSSProperties), cursor: disabled ? 'default' : 'pointer', outline: focused ? `2px solid ${Colors.primary}` : undefined, outlineOffset: 3 }}>
    <input type="radio" name={group} value={value} aria-label={label} aria-checked={checked} checked={checked} disabled={disabled} onChange={event => { if (event.target.checked) onSelect(); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, zIndex: 1, cursor: disabled ? 'default' : 'pointer' }} />
    {children}
  </label>;
}
