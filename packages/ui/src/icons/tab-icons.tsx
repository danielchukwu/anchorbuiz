import type { SVGProps } from "react";

/**
 * Bottom-tab bar icons for the Chipa in-app navigator.
 * Each icon has an outline (inactive) variant.
 * All icons accept standard SVGProps<SVGSVGElement> so colour/size can be driven by the tab bar.
 */

type IconProps = SVGProps<SVGSVGElement>;

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
export function TabHomeIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<path
				d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinejoin="round"
			/>
			<path
				d="M9 21V15H15V21"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function TabHomeSolidIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<path
				d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
				fill="currentColor"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinejoin="round"
			/>
		</svg>
	);
}

// ---------------------------------------------------------------------------
// Points (basketball / orb style)
// ---------------------------------------------------------------------------
export function TabPointsIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.6} />
			<path
				d="M3.5 9h17M3.5 15h17"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinecap="round"
			/>
			<path
				d="M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinecap="round"
			/>
			<path
				d="M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function TabPointsSolidIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<circle
				cx={12}
				cy={12}
				r={9}
				fill="currentColor"
				fillOpacity={0.15}
				stroke="currentColor"
				strokeWidth={1.6}
			/>
			<path
				d="M3.5 9h17M3.5 15h17"
				stroke="currentColor"
				strokeWidth={1.8}
				strokeLinecap="round"
			/>
			<path
				d="M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9"
				stroke="currentColor"
				strokeWidth={1.8}
				strokeLinecap="round"
			/>
			<path
				d="M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9"
				stroke="currentColor"
				strokeWidth={1.8}
				strokeLinecap="round"
			/>
		</svg>
	);
}

// ---------------------------------------------------------------------------
// Rewards (diamond / gem)
// ---------------------------------------------------------------------------
export function TabRewardsIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<path
				d="M6 3H18L22 9L12 21L2 9L6 3Z"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinejoin="round"
			/>
			<path
				d="M2 9H22M6 3L9 9L12 21L15 9L18 3"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function TabRewardsSolidIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<path
				d="M6 3H18L22 9L12 21L2 9L6 3Z"
				fill="currentColor"
				fillOpacity={0.15}
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinejoin="round"
			/>
			<path
				d="M2 9H22M6 3L9 9L12 21L15 9L18 3"
				stroke="currentColor"
				strokeWidth={1.8}
				strokeLinejoin="round"
			/>
		</svg>
	);
}

// ---------------------------------------------------------------------------
// Cards (credit card)
// ---------------------------------------------------------------------------
export function TabCardsIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<rect
				x={2}
				y={5}
				width={20}
				height={14}
				rx={3}
				stroke="currentColor"
				strokeWidth={1.6}
			/>
			<path
				d="M2 10H22"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
			/>
			<path
				d="M6 15H10"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function TabCardsSolidIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<rect
				x={2}
				y={5}
				width={20}
				height={14}
				rx={3}
				fill="currentColor"
				fillOpacity={0.12}
				stroke="currentColor"
				strokeWidth={1.6}
			/>
			<path d="M2 10H22" stroke="currentColor" strokeWidth={2.5} />
			<path
				d="M6 15H10"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
			/>
		</svg>
	);
}

// ---------------------------------------------------------------------------
// Account (user circle)
// ---------------------------------------------------------------------------
export function TabAccountIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.6} />
			<circle cx={12} cy={10} r={3} stroke="currentColor" strokeWidth={1.6} />
			<path
				d="M5.5 19.5C6.5 16.5 9 15 12 15s5.5 1.5 6.5 4.5"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function TabAccountSolidIcon(props: IconProps) {
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
			<circle
				cx={12}
				cy={12}
				r={9}
				fill="currentColor"
				fillOpacity={0.12}
				stroke="currentColor"
				strokeWidth={1.6}
			/>
			<circle
				cx={12}
				cy={10}
				r={3}
				fill="currentColor"
				stroke="currentColor"
				strokeWidth={1.6}
			/>
			<path
				d="M5.5 19.5C6.5 16.5 9 15 12 15s5.5 1.5 6.5 4.5"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinecap="round"
			/>
		</svg>
	);
}
