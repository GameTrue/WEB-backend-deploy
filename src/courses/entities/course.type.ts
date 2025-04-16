import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CourseLevel } from '../entities/course.entity';
import { UserType } from '../../users/entities/user.type';
import { CategoryType } from '../../categories/entities/category.type';

registerEnumType(CourseLevel, {
  name: 'CourseLevel',
  description: 'Уровень сложности курса',
});

@ObjectType({ description: 'Учебный курс' })
export class CourseType {
  @Field(() => ID, { description: 'Уникальный идентификатор курса' })
  id: string;

  @Field({ description: 'Название курса' })
  title: string;

  @Field({ description: 'Описание курса', nullable: true })
  description?: string;

  @Field(() => CourseLevel, { description: 'Уровень сложности курса' })
  level: CourseLevel;

  @Field({ description: 'Стоимость курса' })
  price: number;

  @Field({ description: 'Опубликован ли курс' })
  published: boolean;

  @Field(() => UserType, { description: 'Автор курса' })
  author: UserType;

  @Field(() => CategoryType, { description: 'Категория курса' })
  category: CategoryType;

  @Field({ description: 'Дата создания курса' })
  createdAt: Date;

  @Field({ description: 'Дата последнего обновления курса' })
  updatedAt: Date;
}