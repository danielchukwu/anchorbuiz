import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface AppSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: (SelectOption | string)[];
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function AppSelect({
  value,
  onValueChange,
  placeholder = "Select option",
  options,
  className,
  disabled,
  "aria-label": ariaLabel,
}: AppSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const optValue = typeof option === "string" ? option : option.value;
          const optLabel = typeof option === "string" ? option : option.label;
          return (
            <SelectItem key={optValue} value={optValue}>
              {optLabel}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export default AppSelect;
