import type { SVGProps } from "react";

const BackArrowIcon = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			strokeWidth="2"
			fill="none"
			{...props}
		>
			<path
				d="M11.4375 18.75L4.6875 12L11.4375 5.25M5.625 12H19.3125"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default BackArrowIcon;
