import { ApiProperty } from '@nestjs/swagger';
import { ProgressStatus } from '../entities/progress.entity';

export class ProgressStatusSchema {
  @ApiProperty({
    description: 'Статус прохождения урока',
    enum: ProgressStatus,
    enumName: 'ProgressStatus',
    examples: [
      {
        value: ProgressStatus.STARTED,
        description: 'Урок начат, но прогресс минимальный'
      },
      {
        value: ProgressStatus.IN_PROGRESS,
        description: 'Урок в процессе изучения'
      },
      {
        value: ProgressStatus.COMPLETED,
        description: 'Урок успешно завершен'
      }
    ]
  })
  status: ProgressStatus;
}
