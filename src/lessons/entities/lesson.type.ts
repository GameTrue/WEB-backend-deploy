import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { CourseType } from '../../courses/entities/course.type';
import { AssignmentType } from '../../assignments/entities/assignment.type';

@ObjectType({ description: 'Статистика прохождения урока' })
export class ProgressStatsType {
  @Field(() => Int, { description: 'Количество студентов, начавших урок' })
  started: number;

  @Field(() => Int, { description: 'Количество студентов, завершивших урок' })
  completed: number;
}

@ObjectType({ description: 'Урок курса' })
export class LessonType {
  @Field(() => ID, { description: 'Уникальный идентификатор урока' })
  id: string;

  @Field({ description: 'Название урока' })
  title: string;

  @Field({ description: 'Содержимое урока в формате Markdown' })
  content: string;

  @Field({ description: 'ID курса, к которому относится урок' })
  courseId: string;

  @Field(() => Int, { 
    description: 'Порядковый номер урока в курсе',
    defaultValue: 1 
  })
  order: number;

  @Field(() => Int, { 
    description: 'Продолжительность урока в минутах',
    nullable: true
  })
  duration?: number;

  @Field({ description: 'Дата создания урока' })
  createdAt: Date;

  @Field({ description: 'Дата последнего обновления урока' })
  updatedAt: Date;

  @Field(() => CourseType, { 
    description: 'Курс, к которому относится урок',
    nullable: true 
  })
  course?: CourseType;

  @Field(() => [AssignmentType], { 
    description: 'Задания к уроку',
    nullable: 'items' 
  })
  assignments?: AssignmentType[];

  @Field(() => ProgressStatsType, {
    description: 'Статистика прохождения урока',
    nullable: true
  })
  progressStats?: ProgressStatsType;
}

