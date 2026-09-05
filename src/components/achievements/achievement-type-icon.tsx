type AchievementTypeIconProps = {
  type: "input" | "output";
};

export function AchievementTypeIcon({ type }: AchievementTypeIconProps) {
  const label = type === "input" ? "インプット" : "アウトプット";
  const colorClass = type === "input" ? "text-blue-500" : "text-orange-500";

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={`h-4 w-4 shrink-0 ${colorClass}`}
    >
      <title>{label}</title>
      {type === "input" ? (
        <path d="M12 4v10m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M12 14V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
      )}
      <path d="M5 18h14" strokeLinecap="round" />
    </svg>
  );
}
