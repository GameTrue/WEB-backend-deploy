import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateAssignmentInput {
  @Field({ description: 'Идентификатор урока, к которому относится задание' })
  @IsNotEmpty()
  @IsUUID()
  lessonId: string;

  @Field({ description: 'Название задания' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ description: 'Подробное описание задания' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => Int, { 
    description: 'Максимальное количество баллов за задание', 
    nullable: true, 
    defaultValue: 100 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxScore?: number = 100;

  @Field({ description: 'Крайний срок сдачи задания', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;
}

@InputType()
export class UpdateAssignmentInput {
  @Field({ description: 'Название задания', nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ description: 'Подробное описание задания', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { 
    description: 'Максимальное количество баллов за задание', 
    nullable: true 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxScore?: number;

  @Field({ description: 'Крайний срок сдачи задания', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;
}