import 'dotenv/config';
import * as env from 'env-var';

export const envs = {
  // App
  port: env.get('PORT').default(3000).asPortNumber(),

  // Database
  dbHost: env.get('DB_HOST').required().asString(),
  dbPort: env.get('DB_PORT').default(5432).asPortNumber(),
  dbUsername: env.get('DB_USERNAME').required().asString(),
  dbPassword: env.get('DB_PASSWORD').required().asString(),
  dbName: env.get('DB_NAME').required().asString(),
  // RDS/Aurora normalmente requieren SSL. En local se deja en false.
  dbSsl: env.get('DB_SSL').default('false').asBool(),
  // En RDS con el certificado por defecto de AWS a veces no se valida la
  // cadena completa desde el cliente; con esto en false se permite la
  // conexion igual (equivalente a sslmode=require, no verify-full).
  dbSslRejectUnauthorized: env.get('DB_SSL_REJECT_UNAUTHORIZED').default('true').asBool(),

  // Mail
  mailHost: env.get('MAIL_HOST').required().asString(),
  mailPort: env.get('MAIL_PORT').default(587).asPortNumber(),
  mailSecure: env.get('MAIL_SECURE').default('false').asBool(),
  mailUser: env.get('MAIL_USER').required().asString(),
  mailPassword: env.get('MAIL_PASSWORD').required().asString(),
  mailFrom: env.get('MAIL_FROM').required().asString(),

  // Cuadrilla de mantenimiento
  maintenanceCrewEmail: env.get('MAINTENANCE_CREW_EMAIL').required().asString(),

  // Bcrypt
  bcryptSaltRounds: env.get('BCRYPT_SALT_ROUNDS').default(10).asIntPositive(),

  // AWS S3 (fotos de los reportes)
  awsRegion: env.get('AWS_REGION').required().asString(),
  awsS3BucketName: env.get('AWS_S3_BUCKET_NAME').required().asString(),
  // Opcionales: si la API corre en EC2/ECS/Lambda con un IAM Role asociado,
  // no hace falta definirlas y el SDK toma las credenciales del rol.
  awsAccessKeyId: env.get('AWS_ACCESS_KEY_ID').asString(),
  awsSecretAccessKey: env.get('AWS_SECRET_ACCESS_KEY').asString(),
  // Opcional: dominio publico alterno (ej. CloudFront) en lugar de la URL
  // directa de S3. Si no se define, se arma la URL estandar del bucket.
  awsS3PublicBaseUrl: env.get('AWS_S3_PUBLIC_BASE_URL').asString(),
};
