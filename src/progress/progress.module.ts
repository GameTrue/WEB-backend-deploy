import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';
import { ProgressService } from './progress.service';
import { Lesson } from '../lessons/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Progress, Lesson])],
  providers: [ProgressService],
  exports: [ProgressService]
})
export class ProgressModule {}
