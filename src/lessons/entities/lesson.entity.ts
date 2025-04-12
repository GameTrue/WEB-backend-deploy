import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Progress } from '../../progress/entities/progress.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_id' })
  courseId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  order: number;

  @Column({ nullable: true })
  duration: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Связи
  @ManyToOne(() => Course, course => course.lessons)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => Assignment, assignment => assignment.lesson)
  assignments: Assignment[];

  @OneToMany(() => Progress, progress => progress.lesson)
  progress: Progress[];
}
