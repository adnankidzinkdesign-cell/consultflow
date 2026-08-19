import { Fragment } from "react";
import { StarIcon } from "@/components/consultflow/star-icon";

/**
 * A 1-5 star rating input built from plain radio buttons, laid out
 * `row-reverse` so a CSS general-sibling selector (`peer-checked:`) can
 * highlight "this star and everything visually before it" with no client
 * JS at all — it's a normal radio group and posts as `name=value` like any
 * other form field.
 */
export function StarRatingField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: number;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="flex flex-row-reverse justify-end gap-0.5">
        {[5, 4, 3, 2, 1].map((value) => (
          <Fragment key={value}>
            <input
              type="radio"
              id={`${name}-${value}`}
              name={name}
              value={value}
              defaultChecked={defaultValue === value}
              required
              className="peer sr-only"
            />
            <label
              htmlFor={`${name}-${value}`}
              className="cursor-pointer text-neutral-200 transition-colors peer-checked:text-yellow-400 hover:text-yellow-500 dark:text-neutral-700"
            >
              <StarIcon className="size-6" />
              <span className="sr-only">{value} star{value === 1 ? "" : "s"}</span>
            </label>
          </Fragment>
        ))}
      </div>
    </fieldset>
  );
}
