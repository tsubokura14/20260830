import { getGroupBadgeClasses } from "@/lib/colors";

type GroupBadgeProps = {
  group?: { name: string; color: string };
};

export function GroupBadge({ group }: GroupBadgeProps) {
  if (!group) return null;
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getGroupBadgeClasses(group.color)}`}
    >
      {group.name}
    </span>
  );
}
