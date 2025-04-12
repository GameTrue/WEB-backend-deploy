import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('progress')
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Column({ nullable: true, name: 'last_viewed_at' })
  lastViewedAt: Date;

  @Column({ nullable: true, name: 'completion_date' })
  completionDate: Date;

  // Связи
  @ManyToOne(() => User, user => user.progress)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Lesson, lesson => lesson.progress)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
