// Tailwindはクラス名を静的に解決する必要があるため、色は固定パレットから選ばせる。
export const GROUP_COLOR_PALETTE = [
  "slate",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "violet",
  "pink",
] as const;

export type GroupColor = (typeof GROUP_COLOR_PALETTE)[number];

const BADGE_CLASSES: Record<GroupColor, string> = {
  slate: "bg-slate-200 text-slate-700",
  red: "bg-red-200 text-red-800",
  orange: "bg-orange-200 text-orange-800",
  amber: "bg-amber-200 text-amber-800",
  yellow: "bg-yellow-200 text-yellow-800",
  lime: "bg-lime-200 text-lime-800",
  green: "bg-green-200 text-green-800",
  teal: "bg-teal-200 text-teal-800",
  cyan: "bg-cyan-200 text-cyan-800",
  blue: "bg-blue-200 text-blue-800",
  indigo: "bg-indigo-200 text-indigo-800",
  violet: "bg-violet-200 text-violet-800",
  pink: "bg-pink-200 text-pink-800",
};

export function getGroupBadgeClasses(color: string): string {
  return BADGE_CLASSES[color as GroupColor] ?? BADGE_CLASSES.slate;
}
