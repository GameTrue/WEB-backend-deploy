import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

export enum ProgressStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
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
    default: ProgressStatus.STARTED
  })
  status: ProgressStatus;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ nullable: true, name: 'completion_date' })
  completedAt: Date;


  @ManyToOne(() => User, user => user.progress)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Lesson, lesson => lesson.progress)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
