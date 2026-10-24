import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInitialTables1757000000000 implements MigrationInterface {
  name = 'CreateInitialTables1757000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'WATER_REPORT',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'reporter_phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'is_resolved',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'SYSTEM_USER',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '150',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_notification_enabled',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('SYSTEM_USER');
    await queryRunner.dropTable('WATER_REPORT');
  }
}
