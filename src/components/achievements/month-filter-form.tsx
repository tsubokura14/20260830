import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type Group = { id: number; name: string };

type MonthFilterFormProps = {
  year: number;
  month: number;
  groupId?: number;
  groups: Group[];
};

export function MonthFilterForm({
  year,
  month,
  groupId,
  groups,
}: MonthFilterFormProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        年
        <Select name="year" defaultValue={year}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        月
        <Select name="month" defaultValue={month}>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}月
            </option>
          ))}
        </Select>
      </label>
      {groups.length > 0 && (
        <label className="flex flex-col gap-1 text-sm">
          グループ
          <Select name="groupId" defaultValue={groupId ?? ""}>
            <option value="">すべて</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </label>
      )}
      <Button type="submit" variant="secondary">
        反映
      </Button>
    </form>
  );
}
