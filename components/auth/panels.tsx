import { StatusCard } from "@/components/landing/status-card";

export function RegisterPanel() {
  return (
    <div className="w-full max-w-[460px]">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-signal-resolved">
        What you&apos;re signing up for
      </p>
      <h2 className="mt-4 font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-paper">
        This is the system you&apos;ll be using — not a mockup of it.
      </h2>
      <p className="mt-4 font-body text-sm leading-relaxed text-paper/70">
        Every report gets an owner, a deadline, and a public timeline. The card below is the same
        tracking view citizens see.
      </p>
      <StatusCard className="mt-10" />
    </div>
  );
}

export function VerifyPanel() {
  return (
    <div className="w-full max-w-[440px]">
      <p className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-paper">
        This confirms it&apos;s really you — reports linked to verified accounts get priority in
        duplicate detection.
      </p>
    </div>
  );
}

export function ForgotPasswordPanel() {
  return (
    <div className="w-full max-w-[440px]">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-signal-resolved">
        Account recovery
      </p>
      <h2 className="mt-4 font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-paper">
        Reset links are single-use and expire in 15 minutes.
      </h2>
      <p className="mt-4 font-body text-sm leading-relaxed text-paper/70">
        If a link expires, request a new one. Your report history and tracking numbers are never
        affected.
      </p>
    </div>
  );
}

export function ResetPasswordPanel() {
  return (
    <div className="w-full max-w-[440px]">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-signal-resolved">
        Security
      </p>
      <h2 className="mt-4 font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-paper">
        Your password is hashed before it ever reaches our database.
      </h2>
      <p className="mt-4 font-body text-sm leading-relaxed text-paper/70">
        A longer passphrase is the single most effective thing you can do here — length matters more
        than symbols.
      </p>
    </div>
  );
}
