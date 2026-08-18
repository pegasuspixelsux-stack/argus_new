import { cn } from "@/lib/utils";

export function Logo({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 1L14.5 4.75V11.25L8 15L1.5 11.25V4.75L8 1Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          <path
            d="M8 5.5L11 7.25V9.75L8 11.5L5 9.75V7.25L8 5.5Z"
            fill="currentColor"
            className="text-primary-foreground"
            fillOpacity="1"
            style={{ mixBlendMode: "difference" }}
          />
        </svg>
      </span>
      <span className={cn("text-base text-foreground", textClassName)}>Dealio</span>
    </span>
  );
}
