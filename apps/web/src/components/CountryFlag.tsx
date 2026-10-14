import { useState } from "react";
import { cn } from "../lib/utils";

type CountryFlagProps = {
	iso2?: string | null;
	name: string;
	className?: string;
	imgClassName?: string;
};

export default function CountryFlag({
	iso2,
	name,
	className = "size-7",
	imgClassName = "size-full rounded-full object-cover shadow-xs",
}: CountryFlagProps) {
	const [failedCode, setFailedCode] = useState<string | null>(null);
	const code = iso2?.trim().toLowerCase();

	if (!code || failedCode === code) {
		return (
			<span
				className={`inline-flex shrink-0 items-center justify-center text-xl ${className}`}
				role="img"
				aria-label={`${name} flag unavailable`}
			>
				🌐
			</span>
		);
	}

	return (
		<span
			className={`inline-flex shrink-0 items-center justify-center ${className}`}
		>
			<img
				src={`https://flagcdn.com/w80/${code}.png`}
				srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
				alt={name}
				className={cn("border border-border", imgClassName)}
				loading="lazy"
				onError={() => setFailedCode(code)}
			/>
		</span>
	);
}
