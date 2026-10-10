"use client";

import { useForm } from "@tanstack/react-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useGetAllStaff } from "@/hooks/staff.hook";
import { useGetTeamById, useUpdateTeam } from "@/hooks/team.hook";
import { type UpdateTeamValues, updateTeamFormSchema } from "@/validation";

export default function EditTeamPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: response, isLoading: isLoadingTeam, isError } = useGetTeamById(id);
  const team = response?.data;

  const { mutate: updateTeam, isPending } = useUpdateTeam();
  const { data: staffData } = useGetAllStaff({ limit: 100 });
  const staffMembers = staffData?.data || [];

  const form = useForm({
    defaultValues: {
      name: "",
      status: "ACTIVE",
      leaderId: "",
    } as UpdateTeamValues,
    validators: {
      onSubmit: updateTeamFormSchema,
    },
    onSubmit: ({ value }) => {
      const payload: any = {};
      if (value.name) payload.name = value.name;
      if (value.status) payload.status = value.status;
      if (value.leaderId) payload.leaderId = value.leaderId;

      updateTeam(
        { id, payload },
        {
          onSuccess: () => {
            router.push(`/department/teams`);
          },
        },
      );
    },
  });

  useEffect(() => {
    if (team) {
      form.setFieldValue("name", team.name);
      form.setFieldValue("status", (team.status as any) || "ACTIVE");
      form.setFieldValue("leaderId", team.leaderId || "");
    }
  }, [team]);

  if (isLoadingTeam) {
    return <div className="p-8 text-ink/60">Loading team...</div>;
  }

  if (isError || !team) {
    return <div className="p-8 text-signal-open">Team not found.</div>;
  }

  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <div className="w-full max-w-2xl flex flex-col gap-8 pt-4">
        <Link href={`/department/teams`} className="w-fit">
          <Button
            variant="ghost"
            className="pl-0 h-auto hover:bg-transparent text-ink/40 hover:text-ink font-body transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </Link>

        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Edit Team</h1>
          <p className="text-ink/60 font-medium">
            Update team details, status, or assign a new leader.
          </p>
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
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                      >
                        Team Name
                      </FieldLabel>
                      <Input
                        id={field.name}
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
                name="status"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                      >
                        Status
                      </FieldLabel>
                      <select
                        id={field.name}
                        value={field.state.value || "ACTIVE"}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value as any)}
                        aria-invalid={isInvalid}
                        className="h-10 w-full rounded-md px-3 py-2 text-sm bg-field/50 hover:bg-field border border-line/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-open focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="DISBANDED">Disbanded</option>
                      </select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="leaderId"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium"
                      >
                        Team Leader{" "}
                        <span className="text-ink/40 font-normal normal-case tracking-normal ml-1">
                          (Optional)
                        </span>
                      </FieldLabel>
                      <select
                        id={field.name}
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 w-full rounded-md px-3 py-2 text-sm bg-field/50 hover:bg-field border border-line/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-open focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer"
                      >
                        <option value="">Select a leader</option>
                        {staffMembers.map((staff: any) => (
                          <option key={staff.userId} value={staff.userId}>
                            {staff.firstName} {staff.lastName} - {staff.user?.email}
                          </option>
                        ))}
                      </select>
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
    </div>
  );
}
