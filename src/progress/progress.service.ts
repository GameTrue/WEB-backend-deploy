import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress, ProgressStatus } from './entities/progress.entity';
import { Lesson } from '../lessons/entities/lesson.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>
  ) {}


  async findByUserAndCourse(userId: string, courseId: string): Promise<Progress[]> {
    return this.progressRepository.find({
      where: {
        userId,
        lesson: {
          courseId
        }
      },
      relations: {
        lesson: true
      }
    });
  }


  async findRecentByUserId(userId: string, options?: { relations?: any, take?: number }): Promise<Progress[]> {
    return this.progressRepository.find({
      where: { userId },
      relations: options?.relations || {},
      order: {
        startedAt: 'DESC'
      },
      take: options?.take || 10
    });
  }


  async getEnrollmentProgress(userId: string, courseId: string): Promise<number> {
    const lessons = await this.lessonRepository.find({
      where: { courseId }
    });
    
    if (lessons.length === 0) return 0;
    
    const completedLessons = await this.progressRepository.count({
      where: {
        userId,
        status: ProgressStatus.COMPLETED,
        lesson: {
          courseId
        }
      },
      relations: {
        lesson: true
      }
    });
    
    return completedLessons / lessons.length;
  }


  async upsertProgress(userId: string, lessonId: string, status: ProgressStatus): Promise<Progress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId }
    });
    
    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        lessonId,
        status,
        startedAt: new Date()
      });
    } else {
      progress.status = status;
      if (status === ProgressStatus.COMPLETED) {
        progress.completedAt = new Date();
      }
    }
    
    return this.progressRepository.save(progress);
  }


  async markAsCompleted(userId: string, lessonId: string): Promise<Progress> {
    return this.upsertProgress(userId, lessonId, ProgressStatus.COMPLETED);
  }


  async markAsInProgress(userId: string, lessonId: string): Promise<Progress> {
    return this.upsertProgress(userId, lessonId, ProgressStatus.IN_PROGRESS);
  }
}
