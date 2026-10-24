import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhotoUrlToReport1760000000000 implements MigrationInterface {
  name = 'AddPhotoUrlToReport1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'WATER_REPORT',
      new TableColumn({
        name: 'photo_url',
        type: 'varchar',
        length: '1000',
        // Se agrega como nullable para no romper filas existentes; a nivel
        // de aplicacion (CreateReportDto + controller) la foto sigue siendo
        // obligatoria para los reportes nuevos.
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'WATER_REPORT',
      new TableColumn({
        name: 'repair_photo_url',
        type: 'varchar',
        length: '1000',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('WATER_REPORT', 'repair_photo_url');
    await queryRunner.dropColumn('WATER_REPORT', 'photo_url');
  }
}
