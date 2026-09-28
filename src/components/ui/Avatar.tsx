import { useState } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
};

const sizeStyles: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Profile photo with an initials fallback (no external default image needed). */
export const Avatar = ({ src, alt, size = "md", className = "" }: AvatarProps) => {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary ${sizeStyles[size]} ${className}`}
    >
      {src && !failed ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} loading="lazy" />
      ) : (
        <span aria-label={alt}>{initials(alt)}</span>
      )}
    </span>
  );
};

export default Avatar;
