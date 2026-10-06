"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateTeam } from "@/hooks/team.hook";
import { useGetMe } from "@/hooks/auth.hook";
import { type CreateTeamValues, createTeamFormSchema } from "@/validation";
import { useGetAllStaff } from "@/hooks/staff.hook";

export function AddTeamForm() {
  const router = useRouter();
  const { data: userData } = useGetMe();
  const departmentId = userData?.data?.staffProfile?.departmentMembers?.[0]?.departmentId;
  
  const { mutate: createTeam, isPending } = useCreateTeam();
  const { data: staffData } = useGetAllStaff({ limit: 100 });
  
  const staffMembers = staffData?.data || [];

  const form = useForm({
    defaultValues: {
      name: "",
      code: "",
      leaderId: "",
    } as CreateTeamValues,
    validators: {
      onSubmit: createTeamFormSchema,
    },
    onSubmit: ({ value }) => {
      if (!departmentId) {
        toast.error("Department ID not found. Please try refreshing.");
        return;
      }
      
      const payloadData = {
        name: value.name,
        code: value.code,
        departmentId: departmentId,
        leaderId: value.leaderId || undefined,
      };

      createTeam(payloadData, { 
        onSuccess: () => {
          router.push("/department/teams");
        } 
      });
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
      className="flex flex-col gap-8"
    >
      <FieldGroup className="gap-6">
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium">Team Name</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="e.g. Electrical Squad Alpha"
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
          name="code"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium">Team Code</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="e.g. ELEC-A"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  className="bg-field/50 hover:bg-field border-line/20 focus-visible:border-ink/30 transition-all duration-200 uppercase"
                />
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
                <FieldLabel htmlFor={field.name} className="text-ink/70 text-xs uppercase tracking-wider font-display font-medium">
                  Team Leader <span className="text-ink/40 font-normal normal-case tracking-normal ml-1">(Optional)</span>
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
          loadingText="Creating..."
          className="w-full md:w-auto md:min-w-[160px] h-12 shadow-sm cursor-pointer"
        >
          Create Team
        </Button>
      </div>
    </form>
  );
}
