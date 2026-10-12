import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useCopyToClipboard } from "usehooks-ts";
import CopyIcon from "../icons/copy-icon";
import LoadingCircleIcon from "../icons/loading-circle-icon";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  `
  inline-flex text-xl font-medium items-center w-[300px] justify-center gap-1.5 whitespace-nowrap rounded-full ring-offset-background
  transition duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-black/50
  dark:[&_svg]:text-white active:scale-[0.99] select-none cursor-pointer`,
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-accent",
        secondary: "bg-secondary text-foreground hover:bg-secondary/80",
        black:
          "bg-c-90 hover:bg-[#111] text-white dark:text-black/80 [&_svg]:text-white",
        green: "bg-light-green text-white hover:bg-light-green/95",
        tertiary:
          "bg-[#F6F8FA] dark:bg-[#1c1d1f] dark:hover:bg-[#292c33] text-c-90 font-medium border-0.8 border-border hover:bg-[#F1F3F5]",
        outline:
          "border md:border-0.8 border-c-20 bg-background hover:bg-accent",
        select:
          "font-normal bg-background w-full border border-neutral-300 px-5 outline-none placeholder:text-c-50 focus-visible:border-[#5037ff] focus-visible:ring-2 focus-visible:ring-[#5037ff]/20 data-[state=open]:border-[#5037ff] data-[state=open]:ring-2 data-[state=open]:ring-[#5037ff]/20 rounded-2xl transition-all",
        destructiveOutline:
          "border border-border bg-background hover:bg-accent [&_svg]:text-red dark:[&_svg]:text-red text-red",
        purple: "bg-purple text-white hover:bg-purple-accent",
        orange: "bg-orange text-white hover:bg-orange-accent",
        pink: "bg-pink text-white hover:bg-pink-accent",
        red: "bg-red text-white hover:bg-red-accent",
        "light green": "bg-light-green text-white hover:bg-light-green-accent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-red-500",
        ghost: "text-c-80 hover:bg-c-5 hover:text-c-80",
        ghostDestructive:
          "text-c-80 bg-background md:bg-transparent hover:bg-red/10 hover:text-c-80 [&_svg]:text-red dark:[&_svg]:text-red px-4 w-fit border-0.8 border-border md:border-0",
        link: "text-black/60 hover:text-black/80 [&_svg]:text-black/60 [&_svg]:hover:text-black/80",
        bullet:
          "text-c-80 bg-background font-normal shadow-bullet hover:shadow-bullet-hover rounded-xl gap-3 md:gap-1 text-lg md:text-sm [&_svg]:text-c-70 [&_svg]:size-4",
        grey: "bg-c-5 hover:bg-c-10",
        deepGrey: "bg-hover-10 hover:bg-hover-15",
        deepGreyIcon:
          "bg-hover-3 hover:bg-hover-5 [&_svg]:size-5 [&_svg]:text-c-60 hover:[&_svg]:text-c-80",
        leaderboardGrey:
          "bg-[#2D2D2D] hover:bg-[#3D3D3D] active:bg-[#202020] text-white rounded-[12px]",
      },
      size: {
        default: "h-16 md:h-14 px-10",
        select:
          "h-[56px] md:h-12 px-3 md:px-2.5 text-lg md:text-base rounded-2xl md:rounded-xl",
        bullet: "h-10 px-3",
        xs: "h-8 text-[15px] px-4 rounded-lg",
        sm: "h-9 px-7 rounded-[10px]",
        lg: "h-10 px-7",
        xl: "h-11 px-8",
        "2xl": "h-12 md:h-14 px-6",
        "3xl": "h-[52px] px-6",
        "4xl": "h-[56px] px-8 text-lg rounded-2xl",
        "5xl": "h-[60px] px-8 text-lg rounded-2xl",
        "extra-large":
          "h-[52px] rounded-[16px] w-full font-medium [&_svg]:size-5",
        "icon-sm":
          "size-7 hover:text-c-80 flex items-center justify-center hover:[&_svg]:text-c-80",
        "icon-md":
          "size-8 hover:text-c-80 flex items-center justify-center hover:[&_svg]:text-c-80",
        "icon-lg":
          "size-9 hover:text-c-80 flex items-center justify-center hover:[&_svg]:text-c-80",
        "icon-xl":
          "size-10 hover:text-c-80 flex items-center justify-center hover:[&_svg]:text-c-80",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      icon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <LoadingCircleIcon className="size-4 animate-spin" />
            {children}
          </div>
        ) : icon ? (
          <>
            {icon}
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export const Bullet = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    showError?: boolean;
    disabled?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ children, showError, disabled, className, ...props }, ref) => {
  return (
    <Button
      variant={"bullet"}
      size={"bullet"}
      className={cn(
        "border-0.8 border-c-5",
        showError && "border-red",
        className,
      )}
      disabled={disabled}
      asChild
      {...(props as any)}
    >
      <div ref={ref}>{children}</div>
    </Button>
  );
});
Bullet.displayName = "Bullet";

export const CopyButton = ({
  textToCopy,
  className,
}: {
  textToCopy: string;
  className?: string;
}) => {
  const [buttonText, setButtonText] = React.useState<"Copy" | "Copied!">(
    "Copy",
  );
  const [_, copyToClipboard] = useCopyToClipboard();

  const handleCopy = () => {
    copyToClipboard(textToCopy);
    setButtonText("Copied!");
    // toast.custom((id) => <AppToast title="Link copied" mode="success" id={id} />)
    setTimeout(() => setButtonText("Copy"), 2000);
  };

  return (
    <Button
      variant="outline"
      className={cn("rounded-[16px] w-full text-c-80 font-medium", className)}
      onMouseDown={buttonText === "Copy" ? handleCopy : undefined}
    >
      {/* {buttonText === "Copy" ? <><Copy /> <p>Copy</p></> : <Check className="size-4 text-c-80" strokeWidth="2.5" />} */}
      {buttonText === "Copy" && <CopyIcon />}
      <p>{buttonText}</p>
    </Button>
  );
};

export { Button, buttonVariants };
