import { MigrationInterface, QueryRunner } from "typeorm";

export class User1719369662076 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE users (
              id SERIAL PRIMARY KEY,
              user_name VARCHAR(100) NOT NULL UNIQUE,
              email VARCHAR(320),
              password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP,
              deleted_at TIMESTAMP
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS users;`);
    }

}
