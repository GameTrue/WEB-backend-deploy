import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateCourseInput {
  @Field({ description: 'Название курса' })
  @IsNotEmpty()
  title: string;

  @Field({ description: 'Описание курса', nullable: true })
  @IsOptional()
  description?: string;

  @Field({ description: 'Стоимость курса' })
  @Min(0)
  price: number;

  @Field({ description: 'ID категории курса' })
  @IsUUID()
  categoryId: string;
}

@InputType()
export class UpdateCourseInput {
  @Field({ description: 'Название курса', nullable: true })
  @IsOptional()
  title?: string;

  @Field({ description: 'Описание курса', nullable: true })
  @IsOptional()
  description?: string;

  @Field({ description: 'Стоимость курса', nullable: true })
  @IsOptional()
  @Min(0)
  price?: number;

  @Field({ description: 'ID категории курса', nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}