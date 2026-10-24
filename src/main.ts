import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // rechaza requests con propiedades extra
      transform: true, // transforma el payload a instancias de los DTOs
    }),
  );

  await app.listen(envs.port);
  console.log(`Aplicacion corriendo en el puerto ${envs.port}`);
}
bootstrap();
