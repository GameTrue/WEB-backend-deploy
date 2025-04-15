import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional, Min, IsUUID, IsBoolean } from 'class-validator';
import { CourseLevel } from '../entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Название курса',
    example: 'Введение в программирование на Python',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Описание курса',
    example: 'Базовый курс для начинающих программистов',
    required: true
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Уровень сложности курса',
    enum: CourseLevel,
    example: CourseLevel.BEGINNER,
    default: CourseLevel.BEGINNER,
    required: true
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({
    description: 'Стоимость курса',
    example: 99.99,
    required: false
  })
  @Min(0)
  @IsOptional()
  @IsNumber()
  price: number = 0;

  @ApiProperty({
    description: 'ID категории курса',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: true
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Опубликован ли курс',
    example: false,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  published: boolean = false;

  // Это поле будет заполнено автоматически из токена
  @ApiProperty({
    description: 'ID автора курса (заполняется автоматически)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
    readOnly: true
  })
  @IsUUID()
  @IsOptional()
  authorId: string;
}
