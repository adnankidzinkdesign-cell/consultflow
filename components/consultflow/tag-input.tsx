"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
  useComboboxAnchor,
} from "@/components/ui/combobox";

/**
 * Free-text tag input with typeahead against existing values — used for
 * Disciplines and Regions in the consultant form (Kidzink_Digital-
 * Transformations Figma file, "Edit" modal mockup). Typing a value and
 * pressing Enter or "," turns it into a removable chip; the dropdown
 * suggests values already used elsewhere so entries stay consistent
 * without restricting input to a fixed list.
 *
 * Submits as a single hidden `<input name={name}>` holding a comma-joined
 * string, matching the server action's existing `parseCommaSeparated`
 * parsing — no server-side changes needed.
 */
export function TagInput({
  id,
  name,
  value,
  onChange,
  suggestions = [],
  placeholder,
  chipClassName,
}: {
  id?: string;
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  /** Existing values (e.g. disciplines/regions already used by other consultants) to autocomplete against. */
  suggestions?: string[];
  placeholder?: string;
  /** Per-tag className, e.g. to color-code discipline chips. */
  chipClassName?: (tag: string) => string | undefined;
}) {
  const [inputValue, setInputValue] = useState("");
  const anchor = useComboboxAnchor();

  function commit(raw: string) {
    const tag = raw.trim();
    setInputValue("");
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  }

  const availableSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <Combobox
      items={availableSuggestions}
      multiple
      value={value}
      onValueChange={(next) => onChange(next)}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <ComboboxChips ref={anchor}>
        {value.map((tag) => (
          <ComboboxChip key={tag} className={chipClassName?.(tag)}>
            {tag}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          id={id}
          placeholder={value.length === 0 ? placeholder : undefined}
          onKeyDown={(e) => {
            if (e.key === "," || e.key === "Enter") {
              if (inputValue.trim()) {
                e.preventDefault();
                commit(inputValue);
              }
            } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No matches</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
      <input type="hidden" name={name} value={value.join(", ")} />
    </Combobox>
  );
}
