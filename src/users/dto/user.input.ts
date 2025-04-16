import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field({ description: 'Email пользователя' })
  @IsEmail()
  email: string;

  @Field({ description: 'Пароль пользователя' })
  @MinLength(6)
  password: string;

  @Field({ description: 'Имя пользователя' })
  @IsNotEmpty()
  name: string;

  @Field(() => UserRole, { description: 'Роль пользователя', nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

@InputType()
export class UpdateUserInput {
  @Field({ description: 'Email пользователя', nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ description: 'Пароль пользователя', nullable: true })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @Field({ description: 'Имя пользователя', nullable: true })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @Field(() => UserRole, { description: 'Роль пользователя', nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}