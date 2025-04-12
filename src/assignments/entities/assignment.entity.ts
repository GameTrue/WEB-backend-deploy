import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Submission } from '../../submissions/entities/submission.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'max_score', default: 100 })
  maxScore: number;

  @Column({ nullable: true })
  deadline: Date;

  // Связи
  @ManyToOne(() => Lesson, lesson => lesson.assignments)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => Submission, submission => submission.assignment)
  submissions: Submission[];
}
