import { IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';
import { CourseLevel } from '../entities/course.entity';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price: number = 0;

  @IsUUID()
  @IsOptional()
  authorId: string;

  @IsUUID()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  published: boolean = false;
}
