import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field({ description: 'Название категории' })
  @IsNotEmpty()
  name: string;

  @Field({ description: 'Описание категории', nullable: true })
  @IsOptional()
  description?: string;

  @Field({ description: 'ID родительской категории', nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field({ description: 'Название категории', nullable: true })
  @IsOptional()
  name?: string;

  @Field({ description: 'Описание категории', nullable: true })
  @IsOptional()
  description?: string;

  @Field({ description: 'ID родительской категории', nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}