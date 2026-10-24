import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/envs';
import { Report } from './reports/entities/report.entity';
import { User } from './users/entities/user.entity';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      username: envs.dbUsername,
      password: envs.dbPassword,
      database: envs.dbName,
      entities: [Report, User],
      synchronize: false, // el esquema se gestiona con migraciones
      autoLoadEntities: true,
      ssl: envs.dbSsl
        ? { rejectUnauthorized: envs.dbSslRejectUnauthorized }
        : false,
    }),
    ReportsModule,
    AuthModule,
    UsersModule,
    EmailModule,
  ],
})
export class AppModule {}
