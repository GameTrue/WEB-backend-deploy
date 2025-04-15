import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sessions')
export class Session {
  @ApiProperty({
    description: 'Уникальный идентификатор сессии',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Идентификатор пользователя, которому принадлежит сессия',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'Уникальный токен сессии, используемый для аутентификации',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    writeOnly: true
  })
  @Column({ unique: true })
  token: string;

  @ApiProperty({
    description: 'Время создания сессии',
    example: '2023-01-01T00:00:00Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Время истечения срока действия сессии',
    example: '2023-01-08T00:00:00Z'
  })
  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @ApiProperty({
    description: 'Активна ли сессия',
    example: true,
    default: true
  })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({
    description: 'User-Agent браузера пользователя',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    required: false
  })
  @Column({ nullable: true, name: 'user_agent' })
  userAgent: string;

  @ApiProperty({
    description: 'IP-адрес пользователя',
    example: '192.168.1.1',
    required: false
  })
  @Column({ nullable: true, name: 'ip_address' })
  ipAddress: string;

  @ApiProperty({
    description: 'Пользователь, которому принадлежит сессия',
    type: () => User,
    required: false
  })
  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
