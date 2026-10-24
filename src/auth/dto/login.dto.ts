import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo no tiene un formato valido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contrasena es obligatoria' })
  password: string;
}
