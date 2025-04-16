import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CourseType } from '../../courses/entities/course.type';

@ObjectType({ description: 'Категория курсов' })
export class CategoryType {
  @Field(() => ID, { description: 'Уникальный идентификатор категории' })
  id: string;

  @Field({ description: 'Название категории' })
  name: string;

  @Field({ description: 'Описание категории', nullable: true })
  description?: string;

  @Field(() => ID, { description: 'ID родительской категории', nullable: true })
  parentId?: string;

  @Field(() => CategoryType, { description: 'Родительская категория', nullable: true })
  parent?: CategoryType;

  @Field(() => [CategoryType], { description: 'Дочерние категории', nullable: 'items' })
  children?: CategoryType[];

  @Field(() => [CourseType], { description: 'Курсы в данной категории', nullable: 'items' })
  courses?: CourseType[];
}