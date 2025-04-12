import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Submission } from '../../submissions/entities/submission.entity';
import { Progress } from '../../progress/entities/progress.entity';
import { Session } from '../../auth/entities/session.entity';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Связи
  @OneToMany(() => Course, course => course.author)
  courses: Course[];

  @OneToMany(() => Enrollment, enrollment => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => Submission, submission => submission.user)
  submissions: Submission[];

  @OneToMany(() => Progress, progress => progress.user)
  progress: Progress[];
  
  @OneToMany(() => Session, session => session.user)
  sessions: Session[];
}
