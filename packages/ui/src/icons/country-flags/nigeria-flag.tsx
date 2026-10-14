import type { SVGProps } from "react";

const NigeriaFlag = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_54_1211)">
        <path
          d="M0.75 12C0.75 16.9124 3.9 21.0749 8.25 22.6124V1.38745C3.9 2.92495 0.75 7.08745 0.75 12ZM23.25 12C23.25 7.08745 20.1375 2.92495 15.75 1.38745V22.6124C20.1375 21.0749 23.25 16.9124 23.25 12Z"
          fill="#009A49"
        />
        <path
          d="M8.25 22.6125C9.4125 23.025 10.6875 23.25 12 23.25C13.3125 23.25 14.5875 23.025 15.75 22.6125V1.3875C14.5875 0.975 13.3125 0.75 12 0.75C10.6875 0.75 9.4125 0.975 8.25 1.3875V22.6125Z"
          fill="#F9F9F9"
        />
      </g>
      <defs>
        <clipPath id="clip0_54_1211">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default NigeriaFlag;
