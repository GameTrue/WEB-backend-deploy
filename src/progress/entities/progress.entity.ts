import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ProgressStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

@Entity('progress')
export class Progress {
  @ApiProperty({
    description: 'Уникальный идентификатор записи о прогрессе',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Идентификатор пользователя',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'Идентификатор урока',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ name: 'lesson_id' })
  lessonId: string;

  @ApiProperty({
    description: 'Статус прохождения урока',
    enum: ProgressStatus,
    example: ProgressStatus.COMPLETED,
    default: ProgressStatus.STARTED
  })
  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.STARTED
  })
  status: ProgressStatus;

  @ApiProperty({
    description: 'Дата начала прохождения урока',
    example: '2023-01-01T00:00:00Z'
  })
  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @ApiProperty({
    description: 'Дата завершения урока',
    example: '2023-01-02T00:00:00Z',
    required: false,
    nullable: true
  })
  @Column({ nullable: true, name: 'completion_date' })
  completedAt: Date;

  @ApiProperty({
    description: 'Связь с пользователем',
    type: () => User
  })
  @ManyToOne(() => User, user => user.progress)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Связь с уроком',
    type: () => Lesson
  })
  @ManyToOne(() => Lesson, lesson => lesson.progress)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
