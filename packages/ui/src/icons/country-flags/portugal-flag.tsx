import type { SVGProps } from "react";

const PortugalFlag = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_54_1039)">
        <mask
          id="mask0_54_1039"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <path
            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_54_1039)">
          <path
            d="M0 24H7.82812L9.60469 11.7984L7.82812 0H0V24Z"
            fill="#6DA544"
          />
          <path d="M24 0H7.82812V24H24V0Z" fill="#D80027" />
          <path
            d="M7.82812 16.1719C10.1322 16.1719 12 14.3041 12 12C12 9.69594 10.1322 7.82812 7.82812 7.82812C5.52406 7.82812 3.65625 9.69594 3.65625 12C3.65625 14.3041 5.52406 16.1719 7.82812 16.1719Z"
            fill="#FFDA44"
          />
          <path
            d="M5.47974 9.91411V12.5157C5.47974 13.1379 5.72691 13.7346 6.16689 14.1746C6.60687 14.6146 7.20361 14.8618 7.82583 14.8618C8.44805 14.8618 9.04479 14.6146 9.48477 14.1746C9.92475 13.7346 10.1719 13.1379 10.1719 12.5157V9.90942H5.48442L5.47974 9.91411Z"
            fill="#D80027"
          />
          <path
            d="M7.8281 13.3031C7.39685 13.3031 7.04529 12.9516 7.04529 12.5203V11.4844H8.61091V12.5156C8.61091 12.9469 8.25935 13.2984 7.8281 13.2984V13.3031Z"
            fill="#EEEEEE"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_54_1039">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PortugalFlag;
