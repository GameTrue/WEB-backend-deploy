import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'assignment_id' })
  assignmentId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  score: number;

  @Column({ nullable: true, type: 'text' })
  feedback: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @Column({ nullable: true, name: 'graded_at' })
  gradedAt: Date;

  // Связи
  @ManyToOne(() => User, user => user.submissions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Assignment, assignment => assignment.submissions)
  @JoinColumn({ name: 'assignment_id' })
  assignment: Assignment;
}
