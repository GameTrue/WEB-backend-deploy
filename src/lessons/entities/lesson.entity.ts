import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Progress } from '../../progress/entities/progress.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('lessons')
export class Lesson {
  @ApiProperty({
    description: 'Уникальный идентификатор урока',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({ name: 'course_id' })
  courseId: string;


  @ApiProperty({
    description: 'Название урока',
    example: 'Введение в TypeScript'
  })
  @Column()
  title: string;


  @ApiProperty({
    description: 'Содержимое урока в формате',
    example: '# Введение\nTypeScript - это язык программирования...'
  })
  @Column({ type: 'text' })
  content: string; // Содержание урока (текст лекции)


  @ApiProperty({
    description: 'Порядковый номер урока в курсе',
    example: 1,
    default: 1,
    minimum: 1
  })
  @Column({ default: 1 })
  @Column({ default: 0 })
  order: number;


  @ApiProperty({
    description: 'Продолжительность урока в минутах',
    example: 30,
    default: 0,
    minimum: 0
  })
  @Column({ nullable: true })
  duration: number;

  @ApiProperty({
    description: 'Время создания урока',
    example: '2023-01-01T00:00:00Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Время последнего обновления урока',
    example: '2023-01-01T00:00:00Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Связь с курсом
  @ApiProperty({
    description: 'Курс, к которому относится урок',
    type: () => Course
  })
  @ManyToOne(() => Course, course => course.lessons)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // Связь с заданиями
  @ApiProperty({
    description: 'Задания к уроку',
    type: () => [Assignment],
    required: false
  })
  @OneToMany(() => Assignment, assignment => assignment.lesson)
  assignments: Assignment[];

  // Связь с прогрессом студентов
  @ApiProperty({
    description: 'Прогресс студентов по этому уроку',
    type: () => [Progress],
    required: false
  })
  @OneToMany(() => Progress, progress => progress.lesson)
  progress: Progress[];
}
