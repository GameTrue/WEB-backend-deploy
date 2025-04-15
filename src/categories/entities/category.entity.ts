import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('categories')
export class Category {
  @ApiProperty({
    description: 'Уникальный идентификатор категории',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @ApiProperty({
    description: 'Название категории',
    example: 'Программирование',
    required: true
  })
  @Column()
  name: string;


  @ApiProperty({
    description: 'Описание категории',
    example: 'Курсы по различным языкам программирования и технологиям',
    required: false,
    nullable: true
  })
  @Column({ nullable: true })
  description: string;


  @ApiProperty({
    description: 'ID родительской категории',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    nullable: true
  })
  @Column({ nullable: true, name: 'parent_id' })
  parentId: string;




  // Связи
  @ApiProperty({
    description: 'Родительская категория',
    type: () => Category,
    required: false
  })
  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Category;


  @ApiProperty({
    description: 'Дочерние категории',
    type: () => [Category],
    required: false
  })
  @OneToMany(() => Category, category => category.parent)
  children: Category[];


  @ApiProperty({
    description: 'Курсы в данной категории',
    type: () => [Course],
    required: false
  })
  @OneToMany(() => Course, course => course.category)
  courses: Course[];
}
