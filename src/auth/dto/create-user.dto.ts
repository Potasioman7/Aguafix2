import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150)
  name: string;

  @IsEmail({}, { message: 'El correo no tiene un formato valido' })
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @MaxLength(72) // limite practico de bcrypt
  password: string;

  @IsOptional()
  @IsBoolean()
  isNotificationEnabled?: boolean;
}
