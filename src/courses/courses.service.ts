import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Category } from '../categories/entities/category.entity';
import { Enrollment, EnrollmentStatus } from '../enrollments/entities/enrollment.entity';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class CoursesService {
  private courseEvents = new Subject<any>();
  
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto);
    const savedCourse = await this.coursesRepository.save(course);
    
    // Emit event about new course
    const eventData = {
      action: 'create',
      courseId: savedCourse.id,
      title: savedCourse.title,
      timestamp: new Date().toISOString()
    };
    console.log('Emitting course create event:', eventData);
    this.courseEvents.next(eventData);
    
    return savedCourse;
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find({ 
      where: { published: true },
      relations: ['author', 'category'] 
    });
  }

  async findByAuthorId(authorId: string, options?: { relations?: any }): Promise<Course[]> {
    return this.coursesRepository.find({ 
      where: { authorId },
      relations: options?.relations || {
        author: true,
        enrollments: true,
        lessons: true,
        category: true
      },
      order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: string, options?: { relations?: any }): Promise<Course> {
    const course = await this.coursesRepository.findOne({ 
      where: { id },
      relations: options?.relations || {
      author: true,
      category: true,
      lessons: true,
      enrollments: {
          user: true
        }
      } 
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    
    let hasChanges = false;
    for (const key in updateCourseDto) {
      if (updateCourseDto[key] !== course[key]) {
        hasChanges = true;
        break;
      }
    }
    
    if (hasChanges) {
      Object.assign(course, updateCourseDto);
      const updatedCourse = await this.coursesRepository.save(course);
      
      return updatedCourse;
    }
    
    return course;
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
    
    this.courseEvents.next({
      action: 'delete',
      courseId: id,
      title: course.title,
      timestamp: new Date().toISOString()
    });
  }
  
  async getCategories(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }
  
  async getEnrollments(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({ 
      where: { courseId },
      relations: ['user']
    });
  }
  
  getCourseUpdateEvents(userId: string): Observable<any> {
    console.log(`Getting course update events for user ID: ${userId}`);
    return this.courseEvents.asObservable();
  }

  // Отметить курс как завершенный для пользователя
  async markCourseAsCompleted(courseId: string, userId: string): Promise<void> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { courseId, userId }
    });
    
    if (!enrollment) {
      throw new NotFoundException('Пользователь не записан на этот курс');
    }
    
    enrollment.status = EnrollmentStatus.COMPLETED;
    enrollment.completionDate = new Date();
    
    await this.enrollmentsRepository.save(enrollment);
  }


  async countByAuthorId(authorId: string): Promise<number> {
    return this.coursesRepository.count({
      where: { authorId }
    });
  }


  async findAvailable(options?: { relations?: any }): Promise<Course[]> {
    return this.coursesRepository.find({
      where: { published: true },
      relations: options?.relations || {},
      order: {
        updatedAt: 'DESC'
      }
    });
  }
}
