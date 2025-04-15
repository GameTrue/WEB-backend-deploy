import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email пользователя (должен быть уникальным)',
    example: 'user@example.com',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя (будет захеширован)',
    example: 'strongPassword123',
    required: true,
    writeOnly: true
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Роль пользователя в системе',
    enum: UserRole,
    example: UserRole.STUDENT,
    required: true
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
