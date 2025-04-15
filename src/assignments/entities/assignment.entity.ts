import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Submission } from '../../submissions/entities/submission.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('assignments')
export class Assignment {
  @ApiProperty({ description: 'Уникальный идентификатор задания', example: 'e89cc5c6-5a8e-4211-a93a-af42e5c6a5c4' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Идентификатор урока, к которому относится задание', example: 'f7dcc5c6-5a8e-4211-a93a-af42e5c6a5c4' })
  @Column({ name: 'lesson_id' })
  lessonId: string;

  @ApiProperty({ description: 'Название задания', example: 'Контрольная работа №1' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Подробное описание задания', example: 'В этом задании вам необходимо решить следующие задачи...' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Максимальное количество баллов за задание', default: 100, example: 100 })
  @Column({ name: 'max_score', default: 100 })
  maxScore: number;

  @ApiProperty({ 
    description: 'Крайний срок сдачи задания', 
    example: '2023-06-30T23:59:59Z',
    nullable: true,
    type: Date
  })
  @Column({ nullable: true })
  deadline: Date;

  // Связи
  @ManyToOne(() => Lesson, lesson => lesson.assignments)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => Submission, submission => submission.assignment)
  submissions: Submission[];
}
