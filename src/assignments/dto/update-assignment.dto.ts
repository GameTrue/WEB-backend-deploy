import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDto } from './create-assignment.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {
  @ApiProperty({ 
    description: 'Название задания', 
    required: false,
    example: 'Обновленная контрольная работа №1'
  })
  title?: string;

  @ApiProperty({ 
    description: 'Подробное описание задания', 
    required: false,
    example: 'Обновленное описание задания...'
  })
  description?: string;

  @ApiProperty({ 
    description: 'Максимальное количество баллов за задание (от 1 до 100)', 
    required: false,
    minimum: 1,
    maximum: 100,
    example: 90
  })
  maxScore?: number;

  @ApiProperty({ 
    description: 'Крайний срок сдачи задания', 
    required: false,
    type: Date,
    example: '2023-07-15T23:59:59Z'
  })
  deadline?: Date;
}
