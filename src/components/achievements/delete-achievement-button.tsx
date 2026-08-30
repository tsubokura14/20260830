"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAchievementAction } from "@/actions/achievements";
import { Button } from "@/components/ui/button";

export function DeleteAchievementButton({
  achievementId,
}: {
  achievementId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("この実績を削除しますか？")) return;
    startTransition(async () => {
      const result = await deleteAchievementAction(achievementId);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.push("/");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="danger"
      onClick={handleDelete}
      disabled={isPending}
    >
      削除
    </Button>
  );
}
