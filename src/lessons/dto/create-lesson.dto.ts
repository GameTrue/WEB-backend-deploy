import { IsNotEmpty, IsString, IsUUID, IsInt, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Название урока',
    example: 'Введение в TypeScript',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  title: string;


  @ApiProperty({
    description: 'Краткое описание урока',
    example: 'Базовые концепции TypeScript и настройка окружения',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;


  @ApiProperty({
    description: 'ID курса, к которому относится урок',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true
  })
  @IsNotEmpty()
  @IsUUID()
  courseId: string;


  @ApiProperty({
    description: 'Порядковый номер урока в курсе',
    example: 1,
    required: false,
    default: 1
  })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({
    description: 'Продолжительность урока',
    example: '120',
    required: false,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  duration?: number;


  @ApiProperty({
    description: 'Содержимое урока',
    example: '# Введение\nTypeScript - это язык программирования...',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Флаг, указывающий, опубликован ли урок',
    example: true,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
