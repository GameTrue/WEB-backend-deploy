import { IsNotEmpty, IsString, IsUUID, IsInt, IsOptional, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ 
    description: 'Идентификатор урока, к которому относится задание', 
    example: 'f7dcc5c6-5a8e-4211-a93a-af42e5c6a5c4'
  })
  @IsNotEmpty()
  @IsUUID()
  lessonId: string;

  @ApiProperty({ 
    description: 'Название задания', 
    example: 'Контрольная работа №1'
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Подробное описание задания', 
    example: 'В этом задании вам необходимо решить следующие задачи...'
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Максимальное количество баллов за задание (от 1 до 100)', 
    default: 100,
    minimum: 1,
    maximum: 100,
    required: false,
    example: 100
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxScore?: number = 100;

  @ApiProperty({ 
    description: 'Крайний срок сдачи задания', 
    required: false,
    type: Date,
    example: '2023-06-30T23:59:59Z'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;
}
