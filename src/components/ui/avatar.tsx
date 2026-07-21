import Image from "next/image";

export function Avatar({
  username,
  url,
  size = "md",
}: {
  username: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  };
  if (url)
    return (
      <Image
        src={url}
        alt={`${username} avatar`}
        width={48}
        height={48}
        className={`${dimensions[size]} rounded-full object-cover`}
      />
    );
  return (
    <div
      role="img"
      aria-label={`${username} avatar`}
      className={`${dimensions[size]} flex shrink-0 items-center justify-center rounded-full bg-primary-fixed font-bold text-on-primary-fixed`}
    >
      {username.slice(0, 1).toUpperCase()}
    </div>
  );
}
