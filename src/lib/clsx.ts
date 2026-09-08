/**
 * 複数のクラス名候補を1つの文字列に結合する。
 *
 * Reactのclassnameは単一の文字列しか受け付けないため、
 * 基本スタイルと呼び出し元からの追加スタイルを+演算子で直接結合すると、
 * 値が渡されなかった場合（undefined）や `条件 && "class"` の条件付き指定が
 * falseになった場合に、壊れた文字列（"undefined"等）が混入してしまう。
 * それを防ぎ、有効な文字列だけを安全に結合する責任を持つ。
 */
export function clsx(
  ...classes: Array<string | false | null | undefined>
): string {
  // false/null/undefinedはfalsyなため、filter(Boolean)で自動的に除外される。
  return classes.filter(Boolean).join(" ");
}
