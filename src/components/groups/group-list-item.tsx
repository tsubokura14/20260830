"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteGroupAction, updateGroupAction } from "@/actions/groups";
import { Button } from "@/components/ui/button";
import { GroupBadge } from "@/components/groups/group-badge";
import { GroupForm } from "@/components/groups/group-form";

type GroupListItemProps = {
  group: { id: number; name: string; color: string };
};

export function GroupListItem({ group }: GroupListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`「${group.name}」を削除しますか？`)) return;
    startTransition(async () => {
      const result = await deleteGroupAction(group.id);
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  if (isEditing) {
    return (
      <li className="rounded-lg border border-slate-200 bg-white p-4">
        <GroupForm
          action={updateGroupAction.bind(null, group.id)}
          initialValues={group}
          submitLabel="更新する"
        />
        <button
          type="button"
          className="mt-2 text-xs text-slate-500 hover:underline"
          onClick={() => setIsEditing(false)}
        >
          キャンセル
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <GroupBadge group={group} />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsEditing(true)}
        >
          編集
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleDelete}
          disabled={isPending}
        >
          削除
        </Button>
      </div>
    </li>
  );
}
