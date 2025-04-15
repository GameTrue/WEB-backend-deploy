import { IsNotEmpty, IsString, IsUUID, IsInt, IsOptional, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsUUID()
  lessonId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxScore?: number = 100;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;
}
