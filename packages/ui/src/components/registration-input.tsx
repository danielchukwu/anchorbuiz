import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => (
		<input
			type={type}
			className={cn(
				"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Input.displayName = "Input";

export { Input };

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, ...props }, ref) => {
		const [visible, setVisible] = React.useState(false);
		return (
			<div className="relative w-full">
				<Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
				<button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
					{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
				</button>
			</div>
		);
	},
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
