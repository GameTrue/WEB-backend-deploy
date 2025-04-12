import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1712940885624 implements MigrationInterface {
  name = 'CreateInitialSchema1712940885624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем uuid-ossp расширение если оно еще не существует
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Создаем enum типы
    await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('student', 'teacher', 'admin')`);
    await queryRunner.query(`CREATE TYPE "public"."course_level_enum" AS ENUM('beginner', 'intermediate', 'advanced')`);
    await queryRunner.query(`CREATE TYPE "public"."enrollment_status_enum" AS ENUM('active', 'completed', 'canceled')`);
    await queryRunner.query(`CREATE TYPE "public"."progress_status_enum" AS ENUM('not_started', 'in_progress', 'completed')`);

    // Создаем таблицу пользователей
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "name" character varying NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'student',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу категорий
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "parent_id" uuid,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу курсов
    await queryRunner.query(`
      CREATE TABLE "courses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" character varying,
        "level" "public"."course_level_enum" NOT NULL DEFAULT 'beginner',
        "price" decimal(10,2) NOT NULL DEFAULT '0',
        "author_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "published" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_courses" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу уроков
    await queryRunner.query(`
      CREATE TABLE "lessons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "order" integer NOT NULL,
        "duration" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lessons" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу записей на курсы
    await queryRunner.query(`
      CREATE TABLE "enrollments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "enrollment_date" TIMESTAMP NOT NULL DEFAULT now(),
        "status" "public"."enrollment_status_enum" NOT NULL DEFAULT 'active',
        "completion_date" TIMESTAMP,
        CONSTRAINT "PK_enrollments" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу заданий
    await queryRunner.query(`
      CREATE TABLE "assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lesson_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "max_score" integer NOT NULL DEFAULT '100',
        "deadline" TIMESTAMP,
        CONSTRAINT "PK_assignments" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу решений
    await queryRunner.query(`
      CREATE TABLE "submissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "assignment_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "content" text NOT NULL,
        "score" integer,
        "feedback" text,
        "submitted_at" TIMESTAMP NOT NULL DEFAULT now(),
        "graded_at" TIMESTAMP,
        CONSTRAINT "PK_submissions" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу прогресса
    await queryRunner.query(`
      CREATE TABLE "progress" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "lesson_id" uuid NOT NULL,
        "status" "public"."progress_status_enum" NOT NULL DEFAULT 'not_started',
        "last_viewed_at" TIMESTAMP,
        "completion_date" TIMESTAMP,
        CONSTRAINT "PK_progress" PRIMARY KEY ("id")
      )
    `);

    // Добавляем внешние ключи для связей
    await queryRunner.query(`
      ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_parent" 
      FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_author" 
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_category" 
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons" ADD CONSTRAINT "FK_lessons_course" 
      FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_course" 
      FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "assignments" ADD CONSTRAINT "FK_assignments_lesson" 
      FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "submissions" ADD CONSTRAINT "FK_submissions_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "submissions" ADD CONSTRAINT "FK_submissions_assignment" 
      FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "progress" ADD CONSTRAINT "FK_progress_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "progress" ADD CONSTRAINT "FK_progress_lesson" 
      FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешние ключи
    await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_progress_lesson"`);
    await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_progress_user"`);
    await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_submissions_assignment"`);
    await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_submissions_user"`);
    await queryRunner.query(`ALTER TABLE "assignments" DROP CONSTRAINT "FK_assignments_lesson"`);
    await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_course"`);
    await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_user"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_lessons_course"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_category"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_author"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_parent"`);

    // Удаляем таблицы
    await queryRunner.query(`DROP TABLE "progress"`);
    await queryRunner.query(`DROP TABLE "submissions"`);
    await queryRunner.query(`DROP TABLE "assignments"`);
    await queryRunner.query(`DROP TABLE "enrollments"`);
    await queryRunner.query(`DROP TABLE "lessons"`);
    await queryRunner.query(`DROP TABLE "courses"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Удаляем enum типы
    await queryRunner.query(`DROP TYPE "public"."progress_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."enrollment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."course_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
