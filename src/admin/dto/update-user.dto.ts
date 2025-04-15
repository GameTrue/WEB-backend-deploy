import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Пароль пользователя (будет захеширован)',
    example: 'strongPassword123',
    required: false,
    writeOnly: true
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Роль пользователя в системе',
    enum: UserRole,
    example: UserRole.STUDENT,
    required: false
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Активен ли пользователь',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
