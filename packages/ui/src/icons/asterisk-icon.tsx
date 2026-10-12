import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
	color?: string;
	size?: number;
}

export function AsteriskIcon({
	width = 24,
	height = 24,
	color = "#EF4444",
	size,
	...props
}: IconProps) {
	const finalWidth = size ?? width;
	const finalHeight = size ?? height;

	return (
		<svg
			width={finalWidth}
			height={finalHeight}
			viewBox="0 0 24 24"
			fill="none"
			{...props}
		>
			{/* 8 rounded spokes radiating at 0, 45, 90, 135 deg */}
			<rect x="10.25" y="2" width="3.5" height="20" rx="1.75" fill={color} />
			<rect x="2" y="10.25" width="20" height="3.5" rx="1.75" fill={color} />
			<rect
				x="10.25"
				y="2"
				width="3.5"
				height="20"
				rx="1.75"
				fill={color}
				transform="rotate(45 12 12)"
			/>
			<rect
				x="10.25"
				y="2"
				width="3.5"
				height="20"
				rx="1.75"
				fill={color}
				transform="rotate(-45 12 12)"
			/>
		</svg>
	);
}

export default AsteriskIcon;
