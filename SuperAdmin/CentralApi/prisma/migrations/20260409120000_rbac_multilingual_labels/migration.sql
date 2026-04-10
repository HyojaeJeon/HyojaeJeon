-- 한국어: Role / Permission 다국어 라벨 도입
-- Tiếng Việt: Thêm nhãn đa ngôn ngữ cho Role / Permission
--
-- 원칙 (CLAUDE.md): 다국어 필드는 name (vi 기본) / nameKo / nameEn, description / descriptionKo / descriptionEn 3쌍만 사용.
-- 기존 Role.roleName 은 name 으로 RENAME (기존 한국어 값은 그대로 유지). nameKo/nameEn 은 NULL 로 초기화 후 seed 에서 덮어쓴다.

-- Role ------------------------------------------------------------
ALTER TABLE "Role" RENAME COLUMN "roleName" TO "name";
ALTER TABLE "Role" ADD COLUMN "nameKo" VARCHAR(200);
ALTER TABLE "Role" ADD COLUMN "nameEn" VARCHAR(200);
ALTER TABLE "Role" ADD COLUMN "descriptionKo" VARCHAR(500);
ALTER TABLE "Role" ADD COLUMN "descriptionEn" VARCHAR(500);

-- Permission ------------------------------------------------------
ALTER TABLE "Permission" ADD COLUMN "name" VARCHAR(200);
ALTER TABLE "Permission" ADD COLUMN "nameKo" VARCHAR(200);
ALTER TABLE "Permission" ADD COLUMN "nameEn" VARCHAR(200);
ALTER TABLE "Permission" ADD COLUMN "descriptionKo" VARCHAR(500);
ALTER TABLE "Permission" ADD COLUMN "descriptionEn" VARCHAR(500);
