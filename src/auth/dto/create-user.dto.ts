import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  name: string;

  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
  
  @IsOptional()
  @IsEnum(UserRole, { message: 'Некорректная роль пользователя' })
  role?: UserRole;
}
