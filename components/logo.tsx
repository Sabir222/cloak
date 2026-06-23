import { cn } from "@/lib/utils";

export type LogoProps = React.HTMLAttributes<SVGElement>;

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" className="fill-foreground" />
      <path
        d="M8 12l3 3 5-6"
        stroke="hsl(var(--background))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Logo;
