import * as React from "react";
import { cn } from "../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-2xl border border-neutral-300 bg-background px-4 py-3 text-base transition-all outline-none placeholder:text-neutral-400 focus:border-[#5037ff] focus:ring-2 focus:ring-[#5037ff]/20 focus-visible:border-[#5037ff] focus-visible:ring-2 focus-visible:ring-[#5037ff]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
