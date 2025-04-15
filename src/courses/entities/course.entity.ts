import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('courses')
export class Course {
  @ApiProperty({
    description: 'Уникальный идентификатор курса',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Название курса',
    example: 'Введение в программирование на Python'
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Описание курса',
    example: 'Базовый курс для начинающих программистов',
    nullable: true
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    description: 'Уровень сложности курса',
    enum: CourseLevel,
    example: CourseLevel.BEGINNER
  })
  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @ApiProperty({
    description: 'Стоимость курса',
    example: 99.99
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({
    description: 'ID автора курса',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @Column({ name: 'author_id' })
  authorId: string;

  @ApiProperty({
    description: 'ID категории курса',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  @Column({ name: 'category_id' })
  categoryId: string;

  @ApiProperty({
    description: 'Опубликован ли курс',
    example: true
  })
  @Column({ default: false })
  published: boolean;

  @ApiProperty({
    description: 'Дата создания курса',
    example: '2023-01-01T00:00:00Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления курса',
    example: '2023-01-02T00:00:00Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Связи
  @ApiProperty({
    description: 'Автор курса',
    type: () => User,
    required: false
  })
  @ManyToOne(() => User, user => user.courses)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ApiProperty({
    description: 'Категория курса',
    type: () => Category,
    required: false
  })
  @ManyToOne(() => Category, category => category.courses)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({
    description: 'Уроки курса',
    type: () => [Lesson],
    required: false
  })
  @OneToMany(() => Lesson, lesson => lesson.course)
  lessons: Lesson[];

  @ApiProperty({
    description: 'Записи на курс',
    type: () => [Enrollment],
    required: false
  })
  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];
}
