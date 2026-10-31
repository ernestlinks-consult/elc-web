import type * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = blue (one per view); secondary = blue outline; on-blue = white on blue sections; outline-on-blue; red = Express / Subscribe only; ghost = text link look */
  variant?: 'primary' | 'secondary' | 'on-blue' | 'outline-on-blue' | 'red' | 'ghost';
  size?: 'md' | 'lg';
  block?: boolean;
  /** Renders an <a> when set */
  href?: string;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface BadgeProps {
  /** neutral = Closed/Hidden; blue = info; solid = on light, strong; red = LIVE/FASTEST (white text); new = New/overdue; success = Open/Paid; warning = Opening soon/In review */
  tone?: 'neutral' | 'blue' | 'solid' | 'red' | 'new' | 'success' | 'warning';
  children?: React.ReactNode;
  className?: string;
}
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  multiline?: boolean;
}
export declare function Field(props: FieldProps): React.ReactElement;

export interface ChipProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** checkbox when true, radio otherwise; give radios the same name */
  multiple?: boolean;
}
export declare function Chip(props: ChipProps): React.ReactElement;

export interface CardProps {
  title: string;
  eyebrow?: string;
  action?: string;
  href?: string;
  tone?: 'light' | 'tint' | 'blue';
  children?: React.ReactNode;
  className?: string;
}
export declare function Card(props: CardProps): React.ReactElement;

export interface StepperProps {
  steps: string[];
  /** zero-based index of the current step */
  current: number;
  title?: string;
  note?: string;
  className?: string;
}
export declare function Stepper(props: StepperProps): React.ReactElement;

declare global {
  interface Window {
    ELC: { Button: typeof Button; Badge: typeof Badge; Field: typeof Field; Chip: typeof Chip; Card: typeof Card; Stepper: typeof Stepper };
  }
}
