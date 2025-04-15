import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Название категории',
    example: 'Программирование',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Описание категории',
    example: 'Курсы по различным языкам программирования и технологиям',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID родительской категории (если это подкатегория)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
