import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Shift1659168936703 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "shift",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isUnique: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "date",
                        type: "date",
                    },
                    {
                        name: "startTime",
                        type: "time",
                    },
                    {
                        name: "endTime",
                        type: "time",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp"
                    },
                    {
                        name: "isPublished",
                        type: "boolean",
                        default: "false",
                    },
                    {
                        name: "publishedAt",
                        type: "timestamp",
                        isNullable: true
                    }
                ],
            }),
            true,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
