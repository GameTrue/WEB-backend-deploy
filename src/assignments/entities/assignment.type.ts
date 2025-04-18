import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { LessonType } from '../../lessons/entities/lesson.type';

@ObjectType({ description: 'Задание к уроку' })
export class AssignmentType {
  @Field(() => ID, { description: 'Уникальный идентификатор задания' })
  id: string;

  @Field({ description: 'Идентификатор урока, к которому относится задание' })
  lessonId: string;

  @Field({ description: 'Название задания' })
  title: string;

  @Field({ description: 'Подробное описание задания' })
  description: string;

  @Field(() => Int, { description: 'Максимальное количество баллов за задание' })
  maxScore: number;

  @Field({ description: 'Крайний срок сдачи задания', nullable: true })
  deadline?: Date;

  @Field(() => LessonType, { description: 'Урок, к которому относится задание' })
  lesson: LessonType;
}