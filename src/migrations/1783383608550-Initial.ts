import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1783383608550 implements MigrationInterface {
  name = 'Initial1783383608550';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`planets\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`image\` varchar(255) NOT NULL,
        \`isDestroyed\` tinyint NOT NULL,
        \`description\` text NOT NULL,
        \`deletedAt\` datetime(6) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_70a170f032a2ca04a6ec6eb2d9\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`deleteAt\` datetime(6) DEFAULT NULL,
        \`role\` enum('admin','user') NOT NULL DEFAULT 'user',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`characters\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`image\` varchar(255) NOT NULL,
        \`ki\` varchar(255) NOT NULL,
        \`maxKi\` varchar(255) NOT NULL,
        \`race\` enum('Saiyan','Namekian','Human','Majin','Frieza Race','Jiren Race','Android','God','Angel','Evil','Unknown','Nucleico benigno','Nucleico') NOT NULL,
        \`gender\` enum('Male','Female','Other','Unknown') NOT NULL,
        \`affiliation\` enum('Z Fighter','Red Ribbon Army','Namekian Warrior','Freelancer','Army of Frieza','Other','Pride Troopers','Assistant of Vermoud','Assistant of Beerus','Villain') NOT NULL,
        \`description\` text NOT NULL,
        \`originPlanetId\` int DEFAULT NULL,
        \`deletedAt\` datetime(6) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_86a2bcc85e3473ecf3693dfe5a\` (\`name\`),
        KEY \`FK_f405e481bb6e17e788baf8b093a\` (\`originPlanetId\`),
        CONSTRAINT \`FK_f405e481bb6e17e788baf8b093a\` FOREIGN KEY (\`originPlanetId\`) REFERENCES \`planets\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`transformations\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`image\` varchar(255) NOT NULL,
        \`ki\` varchar(255) NOT NULL,
        \`characterId\` int DEFAULT NULL,
        \`deletedAt\` datetime(6) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`FK_068112b73febc41f6659e2386f1\` (\`characterId\`),
        CONSTRAINT \`FK_068112b73febc41f6659e2386f1\` FOREIGN KEY (\`characterId\`) REFERENCES \`characters\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`transformations\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`characters\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`planets\``);
  }
}
