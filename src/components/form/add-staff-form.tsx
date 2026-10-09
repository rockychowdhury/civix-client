"use client";

import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useGetMe } from "@/hooks/auth.hook";
import { useCreateDispatcher, useCreateTechnician } from "@/hooks/staff.hook";
import { cn } from "@/lib/utils";
import { type AddStaffValues, addStaffFormSchema } from "@/validation";

export function AddStaffForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { data: userData } = useGetMe();
  const departmentId = userData?.data?.staffProfile?.departmentMembers?.[0]?.departmentId;

  const { mutate: createDispatcher, isPending: dispatcherPending } = useCreateDispatcher();
  const { mutate: createTechnician, isPending: technicianPending } = useCreateTechnician();

  const isPending = dispatcherPending || technicianPending;

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: undefined,
      designation: "",
      role: "technician",
    } as AddStaffValues,
    validators: {
      onSubmit: addStaffFormSchema,
    },
    onSubmit: ({ value }) => {
      if (!departmentId) {
        toast.error("Department ID not found. Please try refreshing.");
        return;
      }

      const payloadData = {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        password: value.password,
        phone: value.phone || undefined,
        designation: value.designation || undefined,
        departmentId: departmentId,
      };

      const handleSuccess = () => {
        router.push("/department/technicians"); // Or wherever the staff list is
      };

      if (value.role === "dispatcher") {
        createDispatcher(payloadData, { onSuccess: handleSuccess });
      } else {
        createTechnician(payloadData, { onSuccess: handleSuccess });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      className="flex flex-col gap-12"
    >
      {/* Section: Role Assignment */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-xl font-medium text-ink tracking-tight">
            Role & Permissions
          </h2>
          <p className="text-sm font-body text-ink/50">
            Determine the operational bounds for this team member.
          </p>
        </div>

        <form.Field
          name="role"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={cn(
                      "relative flex flex-col p-6 rounded-xl border cursor-pointer transition-all duration-300 group overflow-hidden",
                      field.state.value === "technician"
                        ? "border-ink bg-ink/5 shadow-sm scale-[1.02]"
                        : "border-line/20 bg-field/20 hover:bg-field/50 hover:border-line/40 text-ink/70 hover:text-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="technician"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      checked={field.state.value === "technician"}
                      onChange={() => field.handleChange("technician")}
                    />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-medium text-lg">Technician</span>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                          field.state.value === "technician"
                            ? "border-ink bg-ink"
                            : "border-line/50",
                        )}
                      >
                        {field.state.value === "technician" && (
                          <div className="w-1.5 h-1.5 bg-paper rounded-full" />
                        )}
                      </div>
                    </div>
                    <span className="font-body text-sm text-ink/50">
                      Handles field tasks, fulfills work orders, and resolves assigned civic issues.
                    </span>
                  </label>

                  <label
                    className={cn(
                      "relative flex flex-col p-6 rounded-xl border cursor-pointer transition-all duration-300 group overflow-hidden",
                      field.state.value === "dispatcher"
                        ? "border-ink bg-ink/5 shadow-sm scale-[1.02]"
                        : "border-line/20 bg-field/20 hover:bg-field/50 hover:border-line/40 text-ink/70 hover:text-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="dispatcher"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      checked={field.state.value === "dispatcher"}
                      onChange={() => field.handleChange("dispatcher")}
                    />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-medium text-lg">Dispatcher</span>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                          field.state.value === "dispatcher"
                            ? "border-ink bg-ink"
                            : "border-line/50",
                        )}
                      >
                        {field.state.value === "dispatcher" && (
                          <div className="w-1.5 h-1.5 bg-paper rounded-full" />
                        )}
                      </div>
                    </div>
                    <span className="font-body text-sm text-ink/50">
                      Manages queue, routes work orders to technicians, and monitors SLA compliance.
                    </span>
                  </label>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </div>

      <hr className="border-line/10" />

      {/* Section: Personal Details */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 mb-2">
          <h2 className="font-display text-xl font-medium text-ink tracking-tight">
            Identity Details
          </h2>
          <p className="text-sm font-body text-ink/50">
            Basic information required for their profile.
          </p>
        </div>

        <FieldGroup className="gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <form.Field
              name="firstName"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                    >
                      First name
                    </FieldLabel>
                    <Input
                      id={field.name}
                      autoComplete="given-name"
                      placeholder="Jane"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="bg-field/50 hover:bg-field border-line/20 focus-visible:border-ink/30 transition-all duration-200"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="lastName"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                    >
                      Last name
                    </FieldLabel>
                    <Input
                      id={field.name}
                      autoComplete="family-name"
                      placeholder="Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="bg-field/50 hover:bg-field border-line/20 focus-visible:border-ink/30 transition-all duration-200"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </div>

          <form.Field
            name="designation"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                  >
                    Internal Designation{" "}
                    <span className="text-ink/40 font-normal normal-case tracking-normal ml-1">
                      (Optional)
                    </span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    placeholder="e.g. Lead Electrical Technician"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value || undefined)}
                    aria-invalid={isInvalid}
                    className="bg-field/50 hover:bg-field border-line/20 focus-visible:border-ink/30 transition-all duration-200"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>
      </div>

      <hr className="border-line/10" />

      {/* Section: Account Access */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 mb-2">
          <h2 className="font-display text-xl font-medium text-ink tracking-tight">
            Security & Contact
          </h2>
          <p className="text-sm font-body text-ink/50">
            Login credentials and recovery information.
          </p>
        </div>

        <FieldGroup className="gap-6">
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                  >
                    Email address
                  </FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="staff@department.gov"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    className="bg-field/50 hover:bg-field border-line/20 focus-visible:border-ink/30 transition-all duration-200"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="phone"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                  >
                    Contact Phone{" "}
                    <span className="text-ink/40 font-normal normal-case tracking-normal ml-1">
                      (Optional)
                    </span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+880 1XXX XXXXXX"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value || undefined)}
                    aria-invalid={isInvalid}
                    className="bg-field/50 hover:bg-field border-line/20 focus-visible:border-ink/30 transition-all duration-200"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="password"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                  >
                    Temporary Password
                  </FieldLabel>
                  <div className="relative group/pass">
                    <Input
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Generate a secure minimum 8-char password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="bg-field/50 hover:bg-field border-line/20 focus-visible:border-ink/30 transition-all duration-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/70 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          loading={isPending}
          loadingText="Provisioning..."
          className="w-full md:w-auto md:min-w-[200px] h-12 text-base shadow-md cursor-pointer hover:-translate-y-0.5 transition-transform"
        >
          Provision Account
        </Button>
      </div>
    </form>
  );
}
