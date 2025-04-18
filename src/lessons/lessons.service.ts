import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations, FindOptionsWhere, LessThan, MoreThan } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Progress, ProgressStatus } from '../progress/entities/progress.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const maxOrderResult = await this.lessonsRepository
      .createQueryBuilder('lesson')
      .select('MAX(lesson.order)', 'maxOrder')
      .where('lesson.course_id = :courseId', { courseId: createLessonDto.courseId })
      .getRawOne();
    
    const newOrder = maxOrderResult.maxOrder ? maxOrderResult.maxOrder + 1 : 1;
    
    const lesson = this.lessonsRepository.create({
      ...createLessonDto,
      order: newOrder
    });
    
    return this.lessonsRepository.save(lesson);
  }

  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.lessonsRepository.find({ 
      where: { courseId },
      order: { order: 'ASC' }
    });
  }

  async findOne(id: string, options?: { relations?: FindOptionsRelations<Lesson> }): Promise<Lesson> {
    try {
      const lesson = await this.lessonsRepository.findOne({
        where: { id },
        relations: options?.relations
      });
      
      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }
      
      return lesson;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(id);
    
    Object.assign(lesson, updateLessonDto);
    
    return this.lessonsRepository.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.findOne(id);
    await this.lessonsRepository.remove(lesson);
  }

  // Находит предыдущий урок в курсе
  async findPreviousLesson(courseId: string, currentOrder: number): Promise<Lesson | null> {
    return await this.lessonsRepository.findOne({
      where: {
        courseId,
        order: LessThan(currentOrder)
      },
      order: {
        order: 'DESC'
      }
    });
  }

  // Находит следующий урок в курсе
  async findNextLesson(courseId: string, currentOrder: number): Promise<Lesson | null> {
    return await this.lessonsRepository.findOne({
      where: {
        courseId,
        order: MoreThan(currentOrder)
      },
      order: {
        order: 'ASC'
      }
    });
  }

  // Получает статистику прохождения урока
  async getLessonProgress(lessonId: string): Promise<{ started: number, completed: number }> {
    const startedCount = await this.progressRepository.count({
      where: { lessonId }
    });
    
    const completedCount = await this.progressRepository.count({
      where: { 
        lessonId, 
        status: ProgressStatus.COMPLETED
     }
    });
    
    return {
      started: startedCount,
      completed: completedCount
    };
  }

  // Отмечает урок как завершенный
  async markAsCompleted(lessonId: string, userId: string): Promise<void> {
    // Проверяем, есть ли запись о прогрессе
    const progress = await this.progressRepository.findOne({
      where: { lessonId, userId }
    });
    
    if (progress) {
      // Обновляем существующую запись
      progress.status = ProgressStatus.COMPLETED;
      progress.completedAt = new Date();
      await this.progressRepository.save(progress);
    } else {
      // Создаем новую запись
      const newProgress = this.progressRepository.create({
        lessonId,
        userId,
        status: ProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date()
      });
      await this.progressRepository.save(newProgress);
    }
  }

  // Проверяет, все ли уроки курса завершены
  async checkAllLessonsCompleted(courseId: string, userId: string): Promise<boolean> {
    // Получаем все опубликованные уроки курса
    const lessons = await this.lessonsRepository.find({
      where: {
        courseId
      }
    });
    
    if (lessons.length === 0) return false;
    
    // Получаем все завершенные уроки пользователя в этом курсе
    const completedLessons = await this.progressRepository.find({
      where: {
        userId,
        status: ProgressStatus.COMPLETED,
        lesson: {
          courseId
        }
      },
      relations: ['lesson']
    });

    // Если количество завершенных уроков равно общему количеству уроков курса, значит все уроки завершены
    return completedLessons.length === lessons.length;
  }
}
