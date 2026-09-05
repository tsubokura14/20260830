import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievementGroups } from "@drizzle/schema";
import { getCurrentUserId } from "@/lib/auth/session";
import { createGroupAction } from "@/actions/groups";
import { GroupForm } from "@/components/groups/group-form";
import { GroupListItem } from "@/components/groups/group-list-item";

export default async function GroupsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const groups = await db
    .select()
    .from(achievementGroups)
    .where(eq(achievementGroups.userId, userId));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">グループ</h1>

      <ul className="flex flex-col gap-3">
        {groups.map((group) => (
          <GroupListItem key={group.id} group={group} />
        ))}
      </ul>

      <div className="rounded-lg border border-dashed border-slate-300 p-4">
        <h2 className="mb-3 text-sm font-medium text-slate-600">
          新しいグループを追加
        </h2>
        <GroupForm action={createGroupAction} submitLabel="追加する" />
      </div>
    </div>
  );
}
