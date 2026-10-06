"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateStaff, useGetStaffById } from "@/hooks/staff.hook";
import { updateStaffFormSchema, type UpdateStaffValues } from "@/validation";
import { useEffect } from "react";

export default function EditStaffPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: response, isLoading: isLoadingProfile, isError } = useGetStaffById(id);
  const staff = response?.data;
  
  const { mutate: updateStaff, isPending } = useUpdateStaff();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: undefined,
      designation: "",
    } as UpdateStaffValues,
    validators: {
      onSubmit: updateStaffFormSchema,
    },
    onSubmit: ({ value }) => {
      const payload: any = {};
      if (value.firstName) payload.firstName = value.firstName;
      if (value.lastName) payload.lastName = value.lastName;
      if (value.phone !== undefined) payload.phone = value.phone;
      if (value.designation !== undefined) payload.designation = value.designation;

      updateStaff({ id, payload }, {
        onSuccess: () => {
          router.push(`/department/technicians/${id}`);
        }
      });
    },
  });

  // Set default values when data is loaded
  useEffect(() => {
    if (staff) {
      form.setFieldValue("firstName", staff.firstName);
      form.setFieldValue("lastName", staff.lastName);
      form.setFieldValue("phone", staff.phone || "");
      form.setFieldValue("designation", staff.designation || "");
    }
  }, [staff]);

  if (isLoadingProfile) {
    return <div className="p-8 text-ink/60">Loading profile...</div>;
  }

  if (isError || !staff) {
    return <div className="p-8 text-signal-open">Profile not found.</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto pb-12">
      <div className="flex flex-col gap-4">
        <Link href={`/department/technicians/${id}`} className="w-fit">
          <Button variant="ghost" className="pl-0 h-auto hover:bg-transparent text-ink/40 hover:text-ink font-body transition-colors cursor-pointer">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </Link>

        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Edit Staff Profile
          </h1>
          <p className="text-ink/60 font-medium">
            Update personal information and internal designation.
          </p>
        </div>
      </div>

      <div className="bg-paper border border-line/10 p-8 sm:p-10 rounded-2xl shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
          className="flex flex-col gap-8"
        >
          <FieldGroup className="gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <form.Field
                name="firstName"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium">First name</FieldLabel>
                      <Input
                        id={field.name}
                        autoComplete="given-name"
                        value={field.state.value || ""}
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
                      <FieldLabel htmlFor={field.name} className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium">Last name</FieldLabel>
                      <Input
                        id={field.name}
                        autoComplete="family-name"
                        value={field.state.value || ""}
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
                    <FieldLabel htmlFor={field.name} className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium">
                      Internal Designation
                    </FieldLabel>
                    <Input
                      id={field.name}
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
              name="phone"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium">
                      Contact Phone
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="tel"
                      autoComplete="tel"
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

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              loading={isPending}
              loadingText="Saving Changes..."
              className="w-full md:w-auto md:min-w-[160px] h-12 shadow-sm cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
