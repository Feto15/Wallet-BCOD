'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CustomSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
}: CustomSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger
        id={id}
        className="w-full rounded-[16px] border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 h-auto text-[14px] text-[var(--color-text)] hover:brightness-110 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] disabled:opacity-50"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-[16px] border-[var(--color-divider)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-lg)]">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-[14px] text-[var(--color-text)] focus:bg-[var(--color-accent)] focus:bg-opacity-20 focus:text-[var(--color-text)] cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
