import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { envs } from '../config/envs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: envs.awsRegion,
      // Si no hay credenciales explicitas en las env vars, se omite este
      // bloque y el SDK usa la cadena de credenciales por defecto de AWS
      // (IAM Role de EC2/ECS/Lambda, perfil local, etc.).
      ...(envs.awsAccessKeyId && envs.awsSecretAccessKey
        ? {
            credentials: {
              accessKeyId: envs.awsAccessKeyId,
              secretAccessKey: envs.awsSecretAccessKey,
            },
          }
        : {}),
    });
  }

  /**
   * Sube un archivo (recibido via Multer, en memoria) a S3 dentro de la
   * carpeta indicada y devuelve la URL publica del objeto.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const extension = file.originalname.split('.').pop();
    const key = `${folder}/${randomUUID()}.${extension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: envs.awsS3BucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error(`Error subiendo archivo a S3 (key: ${key}): ${error.message}`);
      throw error;
    }

    return this.buildPublicUrl(key);
  }

  private buildPublicUrl(key: string): string {
    if (envs.awsS3PublicBaseUrl) {
      return `${envs.awsS3PublicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    return `https://${envs.awsS3BucketName}.s3.${envs.awsRegion}.amazonaws.com/${key}`;
  }
}
