import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Submission } from '../../submissions/entities/submission.entity';
import { Progress } from '../../progress/entities/progress.entity';
import { Session } from '../../auth/entities/session.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Email пользователя (используется для входа)',
    example: 'user@example.com'
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Хешированный пароль пользователя',
    example: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    writeOnly: true
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов'
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Роль пользователя в системе',
    enum: UserRole,
    example: UserRole.STUDENT,
    default: UserRole.STUDENT
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Дата создания аккаунта',
    example: '2023-01-01T00:00:00Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления аккаунта',
    example: '2023-01-01T00:00:00Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Связи
  @ApiProperty({
    description: 'Курсы, созданные пользователем (для преподавателей)',
    type: () => [Course],
    required: false
  })
  @OneToMany(() => Course, course => course.author)
  courses: Course[];

  @ApiProperty({
    description: 'Записи на курсы пользователя',
    type: () => [Enrollment],
    required: false
  })
  @OneToMany(() => Enrollment, enrollment => enrollment.user)
  enrollments: Enrollment[];

  @ApiProperty({
    description: 'Ответы пользователя на задания',
    type: () => [Submission],
    required: false
  })
  @OneToMany(() => Submission, submission => submission.user)
  submissions: Submission[];

  @ApiProperty({
    description: 'Прогресс пользователя по урокам',
    type: () => [Progress],
    required: false
  })
  @OneToMany(() => Progress, progress => progress.user)
  progress: Progress[];
  
  @ApiProperty({
    description: 'Активные сессии пользователя',
    type: () => [Session],
    required: false
  })
  @OneToMany(() => Session, session => session.user)
  sessions: Session[];
}
