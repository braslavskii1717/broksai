import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "info" | "warning";

type Props = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  default: "bg-neutral-100 text-neutral-700",
  success: "bg-green-100 text-green-800",
  info: "bg-sky-100 text-sky-800",
  warning: "bg-amber-100 text-amber-800",
};

export function Badge({ tone = "default", children }: Props) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
