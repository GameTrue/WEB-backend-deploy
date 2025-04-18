import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class CreateLessonInput {
  @Field({ description: 'Название урока' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ description: 'Содержимое урока в формате Markdown' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field({ description: 'ID курса, к которому относится урок' })
  @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @Field(() => Int, { 
    description: 'Порядковый номер урока в курсе',
    nullable: true 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @Field(() => Int, { 
    description: 'Продолжительность урока в минутах',
    nullable: true 
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}

@InputType()
export class UpdateLessonInput {
  @Field({ description: 'Название урока', nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ description: 'Содержимое урока в формате Markdown', nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => Int, { 
    description: 'Порядковый номер урока в курсе',
    nullable: true 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @Field(() => Int, { 
    description: 'Продолжительность урока в минутах',
    nullable: true 
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}

@InputType()
export class LessonFilterInput {
  @Field({ description: 'ID курса для фильтрации уроков', nullable: true })
  @IsOptional()
  @IsUUID()
  courseId?: string;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { 
    description: 'Количество пропускаемых записей', 
    defaultValue: 0 
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number;

  @Field(() => Int, { 
    description: 'Количество возвращаемых записей', 
    defaultValue: 10 
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  take?: number;
}