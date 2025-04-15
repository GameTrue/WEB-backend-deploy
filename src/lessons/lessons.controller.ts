import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Render, Req, NotFoundException, ParseUUIDPipe, Res, Query } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthService } from '../auth/auth.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Request, Response } from 'express';
import { CoursesService } from '../courses/courses.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { SubmissionsService } from '../submissions/submissions.service';
import { ProgressService } from 'src/progress/progress.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { Lesson } from './entities/lesson.entity';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly coursesService: CoursesService,
    private readonly authService: AuthService,
    private readonly submissionsService: SubmissionsService,
    private readonly progressService: ProgressService,
  ) {}

  @Get('course/:courseId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/my-courses/lessons')
  async getCourseLessons(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Req() req: Request
  ) {
    const course = await this.coursesService.findOne(courseId);
    const userData = await this.getUserData(req);

    if (!course || course.authorId !== req.user.id) {
      throw new Error('Course not found');
    }
    
    const lessons = await this.lessonsService.findByCourse(courseId);
    
    return {
      title: `${course.title} - Уроки`,
      course,
      lessons,
      currentPath: req.path,
      ...userData
    };
  }

  // Просмотр урока с лекцией и заданиями
  @Get(':id')
  @UseGuards(AuthGuard)
  @Render('pages/lessons/view')
  @ApiOperation({ 
    summary: 'Просмотр урока', 
    description: 'Отображает страницу с содержимым урока. Доступно для студентов, записанных на курс, и для автора курса.' 
  })
  @ApiParam({ name: 'id', description: 'ID урока', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Страница урока успешно отображена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Нет доступа к уроку - отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Урок не найден - отображается страница 404' })
  async viewLesson(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    // Получаем урок с заданиями и курсом
    const lesson = await this.lessonsService.findOne(id, {
      relations: {
        course: true,
        assignments: true,
        progress: true,
      }
    });
    
    if (!lesson) {
      throw new NotFoundException('Урок не найден');
    }
    
    const prevLesson = await this.lessonsService.findPreviousLesson(lesson.courseId, lesson.order);
    const nextLesson = await this.lessonsService.findNextLesson(lesson.courseId, lesson.order);
    
    // Получаем решения пользователя для этого урока
    const submissions = req.user 
      ? await this.submissionsService.findByUserAndLessonAssignments(req.user.id, id)
      : [];
    
    // Статистика прохождения для преподавателей
    let studentsProgress = { started: 0, completed: 0 };
    if (req.user.role === UserRole.TEACHER) {
      studentsProgress = await this.lessonsService.getLessonProgress(id);
    }
    
    const userData = await this.getUserData(req);

    return {
      title: lesson.title,
      currentPath: req.path,
      lesson,
      prevLesson,
      nextLesson,
      submissions,
      studentsProgress,
      isTeacher: req.user.role === UserRole.TEACHER,
      isAdmin: req.user.role === UserRole.ADMIN,
      ...userData
    };
  }

  @Get(':id/edit')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/lessons/edit')
  @ApiOperation({ 
    summary: 'Форма редактирования урока', 
    description: 'Отображает форму для редактирования урока. Требуется роль TEACHER и авторство курса.' 
  })
  @ApiParam({ name: 'id', description: 'ID урока', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Форма успешно отображена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль TEACHER, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Урок не найден или пользователь не является автором курса' })
  async getEditLessonPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    try {
      // Use correct format for relations
      const lesson = await this.lessonsService.findOne(id, {
        relations: {
          course: true,
          assignments: true
        }
      });
      
      // Проверяем, принадлежит ли урок курсу текущего преподавателя
      if (!lesson || lesson.course.authorId !== req.user.id) {
        throw new NotFoundException('Урок не найден');
      }
      
      const userData = await this.getUserData(req);

      return {
        title: `Редактирование урока: ${lesson.title}`,
        currentPath: req.path,
        lesson,
        course: lesson.course,
        ...userData
      };
    } catch (error) {
      throw new NotFoundException('Урок не найден');
    }
  }

  // Отметить урок как завершенный
  @Post(':id/complete')
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Отметить урок как завершенный', 
    description: 'Отмечает урок как пройденный для текущего пользователя. Требуется роль STUDENT и запись на курс.' 
  })
  @ApiParam({ name: 'id', description: 'ID урока', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Урок успешно отмечен как завершенный' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль STUDENT или запись на курс' })
  @ApiResponse({ status: 404, description: 'Урок не найден' })
  async completeLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    await this.lessonsService.markAsCompleted(id, req.user.id);
    
    // Проверяем, все ли уроки курса завершены
    const lesson = await this.lessonsService.findOne(id);
    const allLessonsCompleted = await this.lessonsService.checkAllLessonsCompleted(lesson.courseId, req.user.id);
    
    if (allLessonsCompleted) {
      // Если все уроки завершены, отмечаем прохождение курса
      await this.coursesService.markCourseAsCompleted(lesson.courseId, req.user.id);
    }
    
    // Возвращаемся на страницу курса
    return res.redirect(`/courses/${lesson.courseId}`);
  }

  // Создание нового урока
  @Post('api')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Создать урок', 
    description: 'Создает новый урок для курса. Требуется роль TEACHER и авторство курса.' 
  })
  @ApiBody({ type: CreateLessonDto })
  @ApiSecurity('auth-token')
  @ApiResponse({ 
    status: 201, 
    description: 'Урок успешно создан',
    type: Lesson
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль TEACHER, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Курс не найден или пользователь не является автором курса' })
  async create(@Body() createLessonDto: CreateLessonDto, @Req() req: Request) {
    // Проверяем, принадлежит ли курс этому преподавателю
    const course = await this.coursesService.findOne(createLessonDto.courseId);
    
    if (!course || course.authorId !== req.user.id) {
      throw new NotFoundException('Курс не найден');
    }
    
    return this.lessonsService.create(createLessonDto);
  }

  // Обновление урока
  @Patch('api/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Обновить урок', 
    description: 'Обновляет содержимое урока. Требуется роль TEACHER и авторство курса.' 
  })
  @ApiParam({ name: 'id', description: 'ID урока', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateLessonDto })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Урок успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль TEACHER' })
  @ApiResponse({ status: 404, description: 'Урок не найден или пользователь не является автором курса' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Req() req: Request
  ) {
    const lesson = await this.lessonsService.findOne(id, {
      relations: {
        course: true
      }
    });
    
    if (!lesson) {
      throw new NotFoundException('Урок не найден');
    }
    
    // Проверяем, принадлежит ли курс этому преподавателю
    if (lesson.course.authorId !== req.user.id) {
      throw new NotFoundException('У вас нет прав для редактирования этого урока');
    }
    
    return this.lessonsService.update(id, updateLessonDto);
  }

  // Удаление урока
  @Delete('api/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Удалить урок', 
    description: 'Удаляет урок из курса. Требуется роль TEACHER и авторство курса.' 
  })
  @ApiParam({ name: 'id', description: 'ID урока', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Урок успешно удален' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль TEACHER' })
  @ApiResponse({ status: 404, description: 'Урок не найден или пользователь не является автором курса' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const lesson = await this.lessonsService.findOne(id);
    
    if (!lesson) {
      throw new NotFoundException('Урок не найден');
    }
    
    if (lesson.course.authorId !== req.user.id) {
      throw new NotFoundException('У вас нет прав для удаления этого урока');
    }
    
    await this.lessonsService.remove(id);
    
    return { success: true };
  }

  @Get('api/recent')
  @UseGuards(AuthGuard)
  async getRecentLessons(@Req() req: Request) {
    const recentProgress = await this.progressService.findRecentByUserId(req.user.id, {
      relations: {
        lesson: {
          course: true
        }
      },
      take: 5
    });
    
    return recentProgress;
  }

  private async getUserData(req: Request) {
    const token = req.cookies['auth_token'];
    if (!token) {
      return { user: null, isAdmin: false };
    }
  
    try {
      const user = await this.authService.getUserByToken(token);
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        isAdmin: user.role === UserRole.ADMIN
      };
    } catch (error) {
      return { user: null, isAdmin: false };
    }
  }
}
