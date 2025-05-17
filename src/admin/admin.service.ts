import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Category } from '../categories/entities/category.entity';
import { Enrollment, EnrollmentStatus } from '../enrollments/entities/enrollment.entity';
import { Session } from '../auth/entities/session.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import { Progress } from '../progress/entities/progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { randomBytes, createHash } from 'crypto';
import { StorageService } from '../storage/storage.service';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    private storageService: StorageService
  ) {}

  // Методы для управления пользователями
  async getAllUsers() {
    const users = await this.userRepository.find({
      relations: ['sessions', 'enrollments']
    });

    console.log
    
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        coursesCount: user.enrollments?.length || 0,
        active: user.sessions.map(session => session.active).includes(true),
      };
    });
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'sessions', 
        'enrollments', 
        'enrollments.course',
        'progress',
        'progress.lesson',
        'submissions'
      ]
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const { password, ...userWithoutPassword } = user;
    
    const enrollments = user.enrollments || [];
    const courses = enrollments.map(enrollment => {
      const course = enrollment.course;
      if (!course) return null;
      
      let progress = 0;
      if (user.progress && user.progress.length > 0 && course.lessons) {
        const courseLessonIds = course.lessons.map(lesson => lesson.id);
        const completedLessons = user.progress
          .filter(p => courseLessonIds.includes(p.lessonId) && p.status === 'completed')
          .length;
          
        if (courseLessonIds.length > 0) {
          progress = Math.round((completedLessons / courseLessonIds.length) * 100);
        }
      }
      
      return {
        id: course.id,
        title: course.title,
        enrollmentDate: enrollment.enrollmentDate,
        progress
      };
    }).filter(Boolean);
    
    return {
      ...userWithoutPassword,
      courses,
      active: true 
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    // Проверка на уникальность email
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    
    // Хеширование пароля
    const hashedPassword = createHash('sha256').update(createUserDto.password).digest('hex');
    
    // Создание пользователя
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword
    });
    
    return await this.userRepository.save(newUser);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });
      
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    }
    
    if (updateUserDto.password) {
      updateUserDto.password = createHash('sha256').update(updateUserDto.password).digest('hex');
    }
    
    await this.userRepository.update(id, updateUserDto);
    
    return await this.userRepository.findOne({
      where: { id }
    });
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    await this.userRepository.remove(user);
    
    return { success: true };
  }

  async terminateUserSession(userId: string, sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId }
    });
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    
    await this.sessionRepository.remove(session);
    
    return { success: true };
  }

  /**
   * Обновить аватар пользователя
   * @param id ID пользователя
   * @param file Загруженный файл аватара
   * @returns Обновленные данные пользователя
   */
  async updateUserAvatar(id: string, file: Express.Multer.File) {
    // Проверяем наличие пользователя
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    // Получаем расширение файла
    const fileExtension = path.extname(file.originalname);
    
    // Генерируем путь для хранения в объектном хранилище
    const avatarPath = this.storageService.generateAvatarPath(id, fileExtension);
    
    // Загружаем файл в хранилище и получаем URL
    const avatarUrl = await this.storageService.uploadFile(file, avatarPath);
    
    // Обновляем данные пользователя
    user.avatar = avatarUrl;
    await this.userRepository.save(user);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };
  }

  // Методы для управления курсами
  async getAllCourses() {
    const courses = await this.courseRepository.find({
      relations: ['author', 'category', 'enrollments', 'lessons']
    });
    
    return courses.map(course => ({
      ...course,
      studentsCount: course.enrollments?.length || 0,
      lessonsCount: course.lessons?.length || 0
    }));
  }

  async getCourseById(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'lessons', 'enrollments', 'enrollments.user']
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return course;
  }

  async updateCourse(id: string, updateCourseDto: any) {
    const course = await this.courseRepository.findOne({
      where: { id }
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    await this.courseRepository.update(id, updateCourseDto);
    
    return await this.courseRepository.findOne({
      where: { id }
    });
  }

  async deleteCourse(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id }
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    await this.courseRepository.remove(course);
    
    return { success: true };
  }

  // Методы для управления категориями
  async getAllCategories() {
    return await this.categoryRepository.find({
      relations: ['courses', 'parent', 'children']
    });
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId }
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parentId} not found`);
      }
    }
    
    const newCategory = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(newCategory);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id }
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId }
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${updateCategoryDto.parentId} not found`);
      }
    }
    
    await this.categoryRepository.update(id, updateCategoryDto);
    
    return await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['courses', 'children']
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    if ((category.courses && category.courses.length > 0) || 
        (category.children && category.children.length > 0)) {
      throw new BadRequestException('Cannot delete category with courses or subcategories');
    }
    
    await this.categoryRepository.remove(category);
    
    return { success: true };
  }

  // Методы для статистики
  async getStatisticsSummary() {
    const usersCount = await this.userRepository.count();
    const coursesCount = await this.courseRepository.count();
    const enrollmentsCount = await this.enrollmentRepository.count();
    
    const completedEnrollments = await this.enrollmentRepository.count({
      where: { status: EnrollmentStatus.COMPLETED }
    });
    
    return {
      usersCount,
      coursesCount,
      enrollmentsCount,
      completedEnrollments
    };
  }

  async getUsersStatistics(period: string) {
    const today = new Date();
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    } else {
      throw new BadRequestException('Invalid period parameter. Use "week", "month", or "year"');
    }
    
    const users = await this.userRepository.find({
      where: {
        createdAt: Between(startDate, today)
      },
      order: {
        createdAt: 'ASC'
      }
    });
    
    const usersByDate = users.reduce((acc, user) => {
      const dateStr = user.createdAt.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = 0;
      }
      
      acc[dateStr]++;
      return acc;
    }, {});
    
    const labels = [];
    const data = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      labels.push(dateStr);
      data.push(usersByDate[dateStr] || 0);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      labels,
      data
    };
  }

  async getActivityStatistics(period: string) {
    const today = new Date();
    let startDate = new Date();
    
    // Определяем период
    if (period === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    } else {
      throw new BadRequestException('Invalid period parameter');
    }
    
    // Получаем активности пользователей (последние логины)
    const sessions = await this.sessionRepository.find({
      where: {
        createdAt: Between(startDate, today)
      },
      order: {
        createdAt: 'ASC'
      }
    });
    
    // Группируем сессии по дате
    const sessionsByDate = sessions.reduce((acc, session) => {
      const dateStr = session.createdAt.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = 0;
      }
      
      acc[dateStr]++;
      return acc;
    }, {});
    
    const labels = [];
    const data = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      labels.push(dateStr);
      data.push(sessionsByDate[dateStr] || 0);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      labels,
      data
    };
  }

  async getUserRolesStatistics() {
    const admins = await this.userRepository.count({
      where: { role: UserRole.ADMIN }
    });
    
    const teachers = await this.userRepository.count({
      where: { role: UserRole.TEACHER }
    });
    
    const students = await this.userRepository.count({
      where: { role: UserRole.STUDENT }
    });
    
    return {
      labels: ['Администраторы', 'Преподаватели', 'Студенты'],
      data: [admins, teachers, students]
    };
  }
}
