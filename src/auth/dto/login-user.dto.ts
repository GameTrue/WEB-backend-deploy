import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Email пользователя для входа',
    example: 'user@example.com',
    required: true
  })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'password123',
    required: true,
    writeOnly: true
  })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  password: string;
}
