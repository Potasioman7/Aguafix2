import { DataSource } from 'typeorm';
import { envs } from '../config/envs';
import { Report } from '../reports/entities/report.entity';
import { User } from '../users/entities/user.entity';

// DataSource usado exclusivamente por el CLI de TypeORM para generar
// y ejecutar migraciones (npm run migration:*). synchronize siempre en false.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: envs.dbHost,
  port: envs.dbPort,
  username: envs.dbUsername,
  password: envs.dbPassword,
  database: envs.dbName,
  synchronize: false,
  logging: false,
  ssl: envs.dbSsl
    ? { rejectUnauthorized: envs.dbSslRejectUnauthorized }
    : false,
  entities: [Report, User],
  migrations: ['src/migrations/*.ts'],
});
