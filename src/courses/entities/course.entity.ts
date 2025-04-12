import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Связи
  @ManyToOne(() => User, user => user.courses)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Category, category => category.courses)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Lesson, lesson => lesson.course)
  lessons: Lesson[];

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];
}
