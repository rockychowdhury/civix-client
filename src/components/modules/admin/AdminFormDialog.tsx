"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export interface AdminFormField {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "switch";
  placeholder?: string;
  optional?: boolean;
  options?: { value: string; label: string }[];
}

const inputClassName =
  "bg-field/50 hover:bg-field border-line/20 focus-visible:border-ink/30 transition-all duration-200";

const labelClassName = "text-ink/70 text-xs uppercase tracking-wider font-display font-medium";

interface DialogBodyProps {
  fields: AdminFormField[];
  schema: z.ZodTypeAny;
  defaultValues: Record<string, unknown>;
  submitLabel: string;
  pending?: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}

function DialogFormBody({
  fields,
  schema,
  defaultValues,
  submitLabel,
  pending,
  onCancel,
  onSubmit,
}: DialogBodyProps) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: schema as never },
    onSubmit: ({ value }) => onSubmit(value as Record<string, unknown>),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <FieldGroup className="gap-5">
        {fields.map((config) => (
          <form.Field
            key={config.name}
            name={config.name as never}
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} className={labelClassName}>
                    {config.label}
                    {config.optional ? (
                      <span className="ml-1 font-body font-normal normal-case tracking-normal text-ink/40">
                        (Optional)
                      </span>
                    ) : null}
                  </FieldLabel>
                  {config.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={config.placeholder}
                      value={(field.state.value as string) ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value as never)}
                      aria-invalid={isInvalid}
                      className={inputClassName}
                    />
                  ) : config.type === "select" ? (
                    <select
                      id={field.name}
                      value={(field.state.value as string) ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value as never)}
                      aria-invalid={isInvalid}
                      className="h-10 w-full cursor-pointer rounded-md border border-line/20 bg-field/50 px-3 py-2 text-sm transition-all duration-200 hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-open focus-visible:ring-offset-2"
                    >
                      <option value="">Select {config.label.toLowerCase()}</option>
                      {config.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : config.type === "switch" ? (
                    <Switch
                      id={field.name}
                      checked={Boolean(field.state.value)}
                      onCheckedChange={(checked) => field.handleChange(checked as never)}
                      aria-invalid={isInvalid}
                      className="cursor-pointer"
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={config.type === "number" ? "number" : "text"}
                      placeholder={config.placeholder}
                      value={(field.state.value as string | number) ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          (config.type === "number"
                            ? e.target.valueAsNumber
                            : e.target.value) as never,
                        )
                      }
                      aria-invalid={isInvalid}
                      className={inputClassName}
                    />
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        ))}
      </FieldGroup>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          loading={pending}
          loadingText="Saving…"
          className="cursor-pointer"
        >
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Schema-driven create/edit dialog. Field configs + a zod schema are enough —
 * no per-entity form component needed. Follows the add-team-form conventions.
 * The form body remounts on every open so edit dialogs never show stale rows.
 */
export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  schema,
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: AdminFormField[];
  schema: z.ZodTypeAny;
  defaultValues: Record<string, unknown>;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [session, setSession] = useState(0);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) setSession((s) => s + 1);
    wasOpen.current = open;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-line bg-paper text-ink sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-ink">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="font-body leading-relaxed text-ink/65">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFormBody
          key={`${session}:${JSON.stringify(defaultValues)}`}
          fields={fields}
          schema={schema}
          defaultValues={defaultValues}
          submitLabel={submitLabel}
          pending={pending}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
