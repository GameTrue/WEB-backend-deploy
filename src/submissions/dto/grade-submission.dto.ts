import { IsNotEmpty, IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class GradeSubmissionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  score: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
