import { Loader2 } from "lucide-react";

import { cn } from "./utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tailwind size class for the spinner icon, e.g. "size-6". Defaults to "size-8". */
  iconClassName?: string;
  /** Optional text shown next to the spinner (e.g. "Loading tenders..."). */
  label?: string;
  /**
   * When true, the spinner is centered inside a full-height container.
   * Use for page/section-level GET loading states.
   */
  fullPage?: boolean;
  /**
   * When true, renders only the spinning icon inheriting the current text
   * color (no wrapper, no primary tint). Use inside buttons for mutation
   * loading, e.g. `<Spinner inline iconClassName="size-4" />`.
   */
  inline?: boolean;
}

/**
 * Primary-colored loading spinner used across the app to indicate an
 * in-progress GET request. Prefer this over ad-hoc `animate-spin` markup.
 * Pass `inline` for mutation loading inside buttons (inherits button color).
 */
export function Spinner({
  iconClassName = "size-8",
  label,
  fullPage = false,
  inline = false,
  className,
  ...props
}: SpinnerProps) {
  if (inline) {
    return (
      <Loader2
        className={cn("animate-spin", iconClassName, className)}
        aria-hidden="true"
      />
    );
  }

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 text-primary",
        className,
      )}
      {...props}
    >
      <Loader2 className={cn("animate-spin", iconClassName)} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex h-full min-h-64 w-full items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
