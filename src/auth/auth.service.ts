import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../users/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { envs } from '../config/envs';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async register(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario registrado con ese correo');
    }

    const hashedPassword = await bcrypt.hash(dto.password, envs.bcryptSaltRounds);

    const newUser = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      isNotificationEnabled: dto.isNotificationEnabled ?? true,
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async login(dto: LoginDto): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('Credenciales invalidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Credenciales invalidas');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
