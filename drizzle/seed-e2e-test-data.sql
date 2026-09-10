-- E2Eテスト(e2e/golden-paths.spec.ts)用のデータ準備SQL
--
-- 「実績が紐づくグループは削除できない」テストは、E2E_USER_NAMEのユーザーに
-- 「未設定」グループが存在し、かつそのグループに実績が最低1件紐づいている
-- ことを前提としている（未設定グループは実績登録時に自動作成される仕様のため、
-- 一度も実績登録していないユーザーには存在しない）。
--
-- 実行前に .env.test.local の E2E_USER_NAME をこのSQLの 'test' 部分に合わせること。
-- NeonのSQL Editorで実行する。既に対象データがあれば何もしない（再実行しても安全）。

WITH target_user AS (
  SELECT id FROM users WHERE name = 'test'
),
existing_group AS (
  SELECT ag.id
  FROM achievement_groups ag
  JOIN target_user tu ON ag.user_id = tu.id
  WHERE ag.name = '未設定'
),
inserted_group AS (
  INSERT INTO achievement_groups (user_id, name)
  SELECT id, '未設定' FROM target_user
  WHERE NOT EXISTS (SELECT 1 FROM existing_group)
  RETURNING id
),
resolved_group AS (
  SELECT id FROM existing_group
  UNION ALL
  SELECT id FROM inserted_group
)
INSERT INTO achievements (user_id, group_id, type, theme)
SELECT
  (SELECT id FROM target_user),
  (SELECT id FROM resolved_group),
  'input',
  'E2Eテスト用初期実績'
WHERE NOT EXISTS (
  SELECT 1
  FROM achievements a
  JOIN target_user tu ON a.user_id = tu.id
  JOIN resolved_group rg ON a.group_id = rg.id
);
