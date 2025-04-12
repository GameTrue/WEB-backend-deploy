import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionsTable1712950000000 implements MigrationInterface {
  name = 'AddSessionsTable1712950000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создание таблицы сессий
    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "expires_at" TIMESTAMP NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "user_agent" character varying,
        "ip_address" character varying,
        CONSTRAINT "UQ_sessions_token" UNIQUE ("token"),
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id")
      )
    `);

    // Добавление внешнего ключа
    await queryRunner.query(`
      ALTER TABLE "sessions" ADD CONSTRAINT "FK_sessions_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление внешнего ключа
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_user"`);
    
    // Удаление таблицы
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
