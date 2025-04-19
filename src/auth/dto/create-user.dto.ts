import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
    required: true
  })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  name: string;

  @ApiProperty({
    description: 'Email пользователя (используется для входа)',
    example: 'user@example.com',
    required: true
  })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя (минимум 6 символов)',
    example: 'password123',
    required: true,
    writeOnly: true,
    minLength: 6
  })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
  
  @ApiProperty({
    description: 'Роль пользователя в системе',
    enum: UserRole,
    default: UserRole.STUDENT,
    required: false,
    example: UserRole.STUDENT
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Некорректная роль пользователя' })
  role?: UserRole;


  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  @IsOptional()
  avatar?: string = "https://course-bucket.storage.yandexcloud.net/avatars/fb54f6a6-f01e-4600-82d6-a7345d456d96.png";
}
