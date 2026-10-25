# Water Leaks API

API en NestJS para que los ciudadanos reporten fugas de agua en la via publica.
Al crear un reporte, se guarda en PostgreSQL y se envia un correo de aviso a la
cuadrilla de mantenimiento con los datos de la fuga.

## Estructura

```
src/
  config/envs.ts             -> variables de entorno (env-var + dotenv)
  database/data-source.ts    -> DataSource de TypeORM para el CLI de migraciones
  migrations/                -> migraciones (synchronize: false)
  reports/
    entities/report.entity.ts     -> tabla WATER_REPORT (incluye photoUrl, repairPhotoUrl)
    dto/create-report.dto.ts
    templates/report.template.ts  -> generateReportTemplate(dto, photoUrl)
    reports.repository.ts
    reports.service.ts
    reports.controller.ts         -> POST /reports (multipart + foto), GET /reports
    reports.module.ts
  users/
    entities/user.entity.ts       -> tabla SYSTEM_USER
    users.repository.ts
    users.module.ts
  auth/
    dto/create-user.dto.ts
    dto/login.dto.ts
    auth.service.ts
    auth.controller.ts            -> POST /auth/register, POST /auth/login
    auth.module.ts
  email/
    email.service.ts              -> transporter nodemailer + sendEmail(to, subject, template)
    email.module.ts
  storage/
    storage.service.ts            -> uploadFile(file, folder) -> sube a S3 y devuelve la URL publica
    storage.module.ts
  app.module.ts
  main.ts
Dockerfile                   -> build multi-stage (node:22-alpine) + node dist/main
.dockerignore                 -> excluye .env, compose.yaml, node_modules, dist, .git
compose.yaml                  -> API (imagen de Docker Hub) + PostgreSQL
.github/workflows/
  docker-publish.yml          -> build y push a Docker Hub en cada push a main
```

## Requisitos previos

- Node.js 18+
- PostgreSQL corriendo (local o en contenedor)
- Cuenta SMTP (Gmail con "app password", Mailtrap, SendGrid, etc.)

## Instalacion

```bash
npm install
```

## Configuracion

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Variables principales:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`
- `MAINTENANCE_CREW_EMAIL` (correo que recibe el aviso de cada fuga reportada)
- `BCRYPT_SALT_ROUNDS`
- `AWS_REGION`, `AWS_S3_BUCKET_NAME` (requeridas), `AWS_ACCESS_KEY_ID` /
  `AWS_SECRET_ACCESS_KEY` (opcionales si usas un IAM Role), `AWS_S3_PUBLIC_BASE_URL`
  (opcional, ej. CloudFront)

Todas se leen y validan con `env-var` en `src/config/envs.ts`; si falta alguna
requerida, la aplicacion falla al arrancar con un mensaje claro.

## Base de datos y migraciones

`synchronize` esta en `false`. El esquema se gestiona 100% con migraciones.

Crear la base de datos vacia (ejemplo con psql):

```bash
createdb water_leaks_db
```

Ejecutar las migraciones incluidas (en orden: crean `WATER_REPORT` y
`SYSTEM_USER`, y luego agregan las columnas `photo_url` / `repair_photo_url`
a `WATER_REPORT`):

```bash
npm run migration:run
```

Otros comandos disponibles:

```bash
# generar una migracion nueva a partir de cambios en las entidades
npm run migration:generate -- src/migrations/NombreDeLaMigracion

# revertir la ultima migracion
npm run migration:revert
```

## Conectar a una base de datos en AWS (RDS / Aurora PostgreSQL)

La API no necesita cambios de codigo para apuntar a AWS, solo variables de
entorno distintas. Pasos recomendados:

1. **Crear la instancia** en RDS (o Aurora PostgreSQL Serverless v2), motor
   PostgreSQL, con un usuario maestro y una base de datos inicial.
2. **Red y seguridad**:
   - Si la API corre fuera de la VPC (tu maquina local, otro proveedor),
     la instancia debe ser "Publicly accessible" y su Security Group debe
     permitir el puerto `5432` solo desde tu IP.
   - Si la API corre dentro de AWS (EC2, ECS, Lambda, Elastic Beanstalk),
     lo ideal es que la instancia sea privada y solo el Security Group del
     servicio que corre la API tenga acceso al puerto `5432`.
3. **Variables de entorno** (`.env` o variables del entorno de despliegue):

   ```env
   DB_HOST=water-leaks-db.xxxxxxxxxx.us-east-1.rds.amazonaws.com
   DB_PORT=5432
   DB_USERNAME=admin_municipio
   DB_PASSWORD=tu_password
   DB_NAME=water_leaks_db
   DB_SSL=true
   DB_SSL_REJECT_UNAUTHORIZED=false
   ```

   RDS exige SSL por defecto en la mayoria de configuraciones, por eso
   `DB_SSL=true`. `DB_SSL_REJECT_UNAUTHORIZED=false` evita tener que
   descargar y referenciar el certificado CA de AWS; es equivalente a
   `sslmode=require`. Si prefieres validacion completa del certificado
   (`sslmode=verify-full`), descarga el bundle CA de RDS y ajusta
   `ssl` en `app.module.ts` / `data-source.ts` para pasar `ca: <contenido>`
   y `DB_SSL_REJECT_UNAUTHORIZED=true`.

4. **Ejecutar migraciones contra RDS**: con las variables anteriores ya
   apuntando a AWS, corre igual que en local:

   ```bash
   npm run migration:run
   ```

5. **Desplegar la API** (EC2, ECS/Fargate, Elastic Beanstalk, Lambda con
   adaptador, etc.) usando esas mismas variables de entorno en el entorno
   de destino, en vez de un archivo `.env` local.

## Levantar la aplicacion

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000` (o el `PORT` configurado).

## Endpoints

### Reportes de fuga

**POST /reports** — `multipart/form-data`

| Campo           | Tipo    | Obligatorio | Notas                                  |
|-----------------|---------|-------------|-----------------------------------------|
| `address`       | texto   | si          |                                          |
| `description`   | texto   | si          |                                          |
| `severity`      | texto   | si          | `low` \| `medium` \| `high`             |
| `reporterPhone` | texto   | si          |                                          |
| `photo`         | archivo | si          | jpg/png/webp, maximo 5 MB               |

Ejemplo con curl:

```bash
curl -X POST http://localhost:3000/reports \
  -F "address=Av. Reforma 123, esquina con Insurgentes" \
  -F "description=Se observa un chorro de agua saliendo del pavimento" \
  -F "severity=high" \
  -F "reporterPhone=5512345678" \
  -F "photo=@/ruta/local/fuga.jpg"
```

En Postman: Body -> `form-data`, los primeros cuatro campos como `Text` y
`photo` como `File`.

Si el campo `photo` no viene en el request, responde `400 Bad Request`.

El flujo del endpoint:
1. Sube la foto a la carpeta `reports/` del bucket S3 (`StorageService.uploadFile`).
2. Guarda el reporte en `WATER_REPORT` con el `photoUrl` resultante.
3. Envia un correo HTML a `MAINTENANCE_CREW_EMAIL` con la plantilla de
   `report.template.ts`, incluyendo la foto con un `<img>`.

**GET /reports**

Devuelve la lista de todos los reportes, mas recientes primero, incluyendo
`photoUrl` (foto de la fuga) y `repairPhotoUrl` (foto de la reparacion;
`null` hasta que exista un flujo que la establezca).

### Autenticacion

**POST /auth/register**

```json
{
  "name": "Ana Perez",
  "email": "ana@example.com",
  "password": "unaClaveSegura123",
  "isNotificationEnabled": true
}
```

La contrasena se hashea con `bcryptjs` antes de guardarse.

**POST /auth/login**

```json
{
  "email": "ana@example.com",
  "password": "unaClaveSegura123"
}
```

Si el correo no existe o la contrasena no coincide, responde
`400 Bad Request` con un mensaje claro ("Credenciales invalidas").

## Fotos en S3

1. Crea un bucket de S3 (bloqueando el acceso publico por ACL/politica de
   bucket por defecto, y habilitando solo lectura publica de objetos si
   decides servir las imagenes directo desde S3; alternativamente usa
   CloudFront y define `AWS_S3_PUBLIC_BASE_URL`).
2. Crea un usuario/IAM policy con permiso `s3:PutObject` (y `s3:GetObject`
   si las imagenes se leen con URL firmada) limitado a ese bucket.
3. Completa en `.env`: `AWS_REGION`, `AWS_S3_BUCKET_NAME`,
   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
4. Si la API corre dentro de AWS (EC2/ECS) y le asocias un IAM Role con
   permisos sobre el bucket, puedes dejar `AWS_ACCESS_KEY_ID` y
   `AWS_SECRET_ACCESS_KEY` vacios: el SDK usa las credenciales del rol.

`StorageService.uploadFile(file, folder)` sube el archivo (en memoria, via
Multer) a `<folder>/<uuid>.<extension>` y devuelve la URL publica del objeto.

## Docker

**Build local:**

```bash
docker build -t aguafix-api:local .
```

**Correr el contenedor** (variables via `--env-file`, nunca horneadas en la imagen):

```bash
docker run --env-file .env -p 3000:3000 aguafix-api:local
```

**Levantar API + PostgreSQL con `compose.yaml`:**

```bash
cp .env.example .env
# completa .env y agrega: DOCKER_IMAGE=<tu_usuario_dockerhub>/aguafix-api:latest
docker compose up -d
```

El `Dockerfile` usa build multi-stage sobre `node:22-alpine`: una etapa
compila el proyecto (`npm run build`) y la etapa final solo copia `dist/`
e instala dependencias de produccion, arrancando con `node dist/main`.
El `.dockerignore` excluye `.env`, `compose.yaml`, `node_modules`, `dist`
y `.git`, por lo que ningun secreto ni archivo de orquestacion local queda
dentro de la imagen.

## CI/CD con GitHub Actions

El workflow `.github/workflows/docker-publish.yml` corre en cada push a
`main`: hace login en Docker Hub, construye la imagen con el `Dockerfile`
de la raiz y la publica como `<DOCKER_USER>/aguafix-api:latest`.

Antes de hacer push, configura en GitHub (**Settings -> Secrets and
variables -> Actions -> New repository secret**):

- `DOCKER_USER`: tu usuario de Docker Hub.
- `DOCKER_PASSWORD`: un **access token** de Docker Hub (no la contrasena de
  la cuenta) con permiso de lectura/escritura.

Ninguna credencial de Docker Hub, AWS, SMTP o base de datos esta escrita en
el codigo, el `Dockerfile` o el workflow; todas se leen desde Secrets (en
CI) o variables de entorno (en runtime).

## Notas de diseno

- Arquitectura por capas dentro de cada modulo: `controller -> service -> repository`.
- Los DTOs validan la entrada de cada endpoint con `class-validator`
  (`whitelist` y `forbidNonWhitelisted` activados globalmente en `main.ts`).
- Si el guardado del reporte tiene exito pero el envio de correo falla, el
  reporte NO se pierde: el error solo queda registrado en el log, para no
  bloquear al ciudadano por un problema de SMTP.

//Prueba push patata 5
