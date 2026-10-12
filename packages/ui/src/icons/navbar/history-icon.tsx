import type { SVGProps } from "react";

const HistoryIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.266 16.06C5.11187 17.7707 6.48407 19.1649 8.181 20.038C9.86551 20.9034 11.7864 21.1955 13.652 20.87C15.5233 20.5407 17.2377 19.6145 18.539 18.23C19.852 16.8321 20.688 15.0539 20.927 13.151C21.1693 11.2437 20.804 9.30866 19.883 7.62101C18.9705 5.9462 17.5441 4.60883 15.814 3.80601C14.0957 3.01017 12.1646 2.7967 10.314 3.19801C8.464 3.59901 6.948 4.51101 5.694 5.95301C5.543 6.11301 4.959 6.75901 4.474 7.73401M7.5 8.00001L3.891 8.72001L3 5.00001M12 9.00001V13L15 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HistoryIcon;
