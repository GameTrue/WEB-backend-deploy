import { Controller, Get, Post, Patch, Delete, Body, Param, Req, Res, Render, UseGuards, NotFoundException, Sse, ParseUUIDPipe, Query, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { CoursesService } from './courses.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Observable, interval, map, merge } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { ProgressService } from '../progress/progress.service';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { Course } from './entities/course.entity';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly authService: AuthService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly progressService: ProgressService
  ) {}

  @Get('my')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/my-courses/index')
  @ApiOperation({ 
    summary: 'Страница с курсами преподавателя', 
    description: 'Отображает страницу со списком курсов, созданных преподавателем. Требуется роль TEACHER.' 
  })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Страница успешно отображена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - отображается страница 403' })
  async getTeacherCourses(@Req() req: Request) {
    const userData = await this.getUserData(req);

    return {
      title: 'Мои курсы',
      currentPath: req.path,
      ...userData
    };
  }

  @Get('my/create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/my-courses/create')
  @ApiOperation({ 
    summary: 'Форма создания курса', 
    description: 'Отображает форму для создания нового курса. Требуется роль TEACHER.' 
  })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Форма успешно отображена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - отображается страница 403' })
  async createCourseForm(@Req() req: Request) {
    const categories = await this.coursesService.getCategories();
    const userData = await this.getUserData(req);
    
    return {
      title: 'Создание курса',
      currentPath: req.path,
      categories,
      ...userData
    };
  }

  @Get('my/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/my-courses/detail')
  @ApiOperation({ 
    summary: 'Детальная информация о курсе', 
    description: 'Отображает страницу с детальной информацией о курсе преподавателя. Требуется роль TEACHER.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Страница успешно отображена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Курс не найден - отображается страница 404' })
  async getTeacherCourseDetail(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const course = await this.coursesService.findOne(id);
    if (!course || course.authorId !== req.user.id) {
      throw new NotFoundException('Курс не найден');
    }
    const userData = await this.getUserData(req);
    
    return {
      title: `${course.title} - Управление курсом`,
      currentPath: req.path,
      course,
      ...userData
    };
  }

  @Get('my/:id/lessons')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/my-courses/lessons')
  @ApiOperation({ 
    summary: 'Уроки курса', 
    description: 'Отображает страницу со списком уроков курса. Требуется роль TEACHER.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Страница успешно отображена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Курс не найден - отображается страница 404' })
  async getTeacherCourseLessons(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    const course = await this.coursesService.findOne(id);
    
    if (!course || course.authorId !== req.user.id) {
      throw new NotFoundException('Курс не найден');
    }
    const userData = await this.getUserData(req);
    
    if (course.lessons) {
      course.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    return {
      title: `${course.title} - Уроки`,
      currentPath: req.path,
      course,
      ...userData
    };
  }

  @Get('my/:id/lessons/create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/my-courses/create-lesson')
  @ApiOperation({ 
    summary: 'Форма создания урока', 
    description: 'Отображает форму для создания нового урока в курсе. Требуется роль TEACHER.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Форма успешно отображена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Курс не найден - отображается страница 404' })
  async getCreateLessonForm(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    const course = await this.coursesService.findOne(id);
    const userData = await this.getUserData(req);
    
    if (!course || course.authorId !== req.user.id) {
      throw new NotFoundException('Курс не найден');
    }
    
    let nextOrder = 1;
    if (course.lessons && course.lessons.length > 0) {
      nextOrder = Math.max(...course.lessons.map(lesson => lesson.order || 0)) + 1;
    }
    
    return {
      title: `${course.title} - Создание урока`,
      currentPath: req.path,
      course,
      nextOrder,
      ...userData
    };
  }

  @Get('api/my')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Получить курсы преподавателя', 
    description: 'Возвращает список курсов, созданных преподавателем. Требуется роль TEACHER.' 
  })
  @ApiSecurity('auth-token')
  @ApiResponse({ 
    status: 200, 
    description: 'Список курсов успешно получен',
    type: [Course]
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль TEACHER' })
  async getTeacherCoursesApi(@Req() req: Request) {
    const userId = req.user.id;
    const courses = await this.coursesService.findByAuthorId(userId);
    return courses;
  }

  @Post('api/create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Создать курс', 
    description: 'Создает новый курс. Требуется роль TEACHER.' 
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiSecurity('auth-token')
  @ApiResponse({ 
    status: 201, 
    description: 'Курс успешно создан',
    type: Course
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль TEACHER' })
  async createCourse(@Body() createCourseDto: CreateCourseDto, @Req() req: Request) {
    createCourseDto.authorId = req.user.id;
    const course = await this.coursesService.create(createCourseDto);
    return course;
  }

  @Patch('api/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Обновить курс', 
    description: 'Обновляет существующий курс. Требуется роль TEACHER и авторство курса.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateCourseDto })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль TEACHER' })
  async updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req: Request
  ) {
    // Verify this course belongs to this teacher
    const course = await this.coursesService.findOne(id);
    if (!course || course.authorId !== req.user.id) {
      throw new NotFoundException('Курс не найден');
    }
    
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete('api/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ 
    summary: 'Удалить курс', 
    description: 'Удаляет существующий курс. Требуется роль TEACHER и авторство курса.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Курс успешно удален' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль TEACHER' })
  @ApiResponse({ status: 404, description: 'Курс не найден' })
  async deleteCourse(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    // Verify this course belongs to this teacher
    const course = await this.coursesService.findOne(id);
    if (!course || course.authorId !== req.user.id) {
      throw new NotFoundException('Курс не найден');
    }
    
    await this.coursesService.remove(id);
    return { success: true };
  }

  @Sse('events')
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'События курсов', 
    description: 'Устанавливает SSE-соединение для получения обновлений о курсах в реальном времени.' 
  })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Соединение установлено' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  events(@Req() req: Request): Observable<MessageEvent> {
    const userId = req.user.id;
    console.log(`SSE connection established for user ID: ${userId}`);
    
    return merge(
      interval(30000).pipe(
        map(() => ({ 
          data: JSON.stringify({ 
            message: 'heartbeat',
            timestamp: new Date().toISOString() 
          }),
          id: String(Date.now()),
          type: 'heartbeat'
        }) as MessageEvent)
      ),
      this.coursesService.getCourseUpdateEvents(userId).pipe(
        map(event => ({
          data: JSON.stringify(event),
          id: String(Date.now()),
          type: 'course-update'
        }) as MessageEvent)
      )
    );
  }

  // /**
  //  * API endpoint for fetching teacher's courses with full relations
  //  */
  // @Get('api/my')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(UserRole.TEACHER)
  // async getMyCourses(@Req() req: Request) {
  //   // Make sure to include lessons relation
  //   const courses = await this.coursesService.findByAuthorId(req.user.id, {
  //     relations: {
  //       category: true,
  //       lessons: true,
  //       enrollments: true
  //     }
  //   });
    
  //   return courses;
  // }

  // API endpoint для получения списка доступных курсов
  @Get('api/available')
  @ApiOperation({ 
    summary: 'Получить доступные курсы', 
    description: 'Возвращает список всех опубликованных курсов. Для авторизованных пользователей отмечает записанные курсы.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Список курсов успешно получен',
    type: [Course]
  })
  async getAvailableCourses(@Req() req: Request) {
    const courses = await this.coursesService.findAvailable({
      relations: {
        author: true,
        category: true,
        lessons: true,
        enrollments: true
      }
    });
    
    // Если пользователь авторизован, проверяем статус записи
    if (req.user) {
      const enrollments = await this.enrollmentsService.findByUser(req.user.id);
      const enrolledCourseIds = enrollments.map(e => e.courseId);
      
      courses.forEach(course => {
        (course as any).isEnrolled = enrolledCourseIds.includes(course.id);
      });
    }
    
    return courses;
  }

  @Get('api/my-enrollments')
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Получить записи на курсы', 
    description: 'Возвращает список курсов, на которые записан текущий пользователь.' 
  })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Записи успешно получены' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getMyEnrollments(@Req() req: Request) {
    try {
      const enrollments = await this.enrollmentsService.findByUserWithDetails(req.user.id);
      
      for (const enrollment of enrollments) {
        const progress = await this.progressService.getEnrollmentProgress(
          enrollment.userId, 
          enrollment.courseId
        );
        
        // enrollment.progress = progress;
      }
      
      return enrollments;
    } catch (error) {
      throw new Error(`Failed to load enrolled courses: ${error.message}`);
    }
  }

  @Get(':id')
  @Render('pages/courses/view')
  @ApiOperation({ 
    summary: 'Просмотр курса', 
    description: 'Отображает страницу с подробной информацией о курсе.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Страница успешно отображена' })
  @ApiResponse({ status: 404, description: 'Курс не найден - отображается страница 404' })
  async viewCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    try {
      const course = await this.coursesService.findOne(id, {
        relations: {
          author: true,
          category: true,
          lessons: true,
          enrollments: true
        }
      });
      
      if (!course) {
        throw new NotFoundException('Курс не найден');
      }
      
      course.author = {
        id: course.author.id,
        name: course.author.name,
        email: course.author.email,
        role: course.author.role,
        coursesCount: await this.coursesService.countByAuthorId(course.author.id)
      } as any;
      
      if (course.lessons) {
        course.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      
      let isEnrolled = false;
      let enrollment = null;
      
      const userData = await this.getUserData(req);
      
      if (userData.user && userData.user.id) {
        enrollment = await this.enrollmentsService.findByUserAndCourse(userData.user.id, id);
        isEnrolled = !!enrollment;
        
        if (isEnrolled) {
          enrollment.progress = await this.progressService.findByUserAndCourse(userData.user.id, id);
        }
      }
      
      return {
        title: course.title,
        currentPath: req.path,
        course,
        isEnrolled,
        enrollment,
        ...userData
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Ошибка при загрузке курса');
    }
  }

  @Post('api/:id/enroll')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ 
    summary: 'Записаться на курс', 
    description: 'Записывает текущего пользователя на указанный курс. Требуется роль STUDENT.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Запись на курс успешно создана' })
  @ApiResponse({ status: 400, description: 'Пользователь уже записан на курс' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль STUDENT, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Курс не найден - отображается страница 404' })
  async enrollInCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    try {
      const course = await this.coursesService.findOne(id);
      
      // console.log(course);
      if (!course) {
        throw new NotFoundException('Курс не найден');
      }
      
      const existingEnrollment = await this.enrollmentsService.findByUserAndCourse(req.user.id, id);
      
      // console.log(existingEnrollment);
      if (existingEnrollment) {
        throw new BadRequestException('Вы уже записаны на этот курс');
      }

      await this.enrollmentsService.create({
        userId: req.user.id,
        courseId: id
      });
      
      return { success: true, message: 'Вы успешно записаны на курс' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Ошибка при записи на курс :' + error);
    }
  }

  @Delete('api/:id/unenroll')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ 
    summary: 'Отписаться от курса', 
    description: 'Отменяет запись текущего пользователя на указанный курс. Требуется роль STUDENT.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Запись на курс успешно отменена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль STUDENT, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Запись не найдена - отображается страница 404' })
  async unenrollFromCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    try {
      const enrollment = await this.enrollmentsService.findByUserAndCourse(req.user.id, id);
      
      if (!enrollment) {
        throw new NotFoundException('Вы не записаны на этот курс');
      }
      
      await this.enrollmentsService.cancel(enrollment.id);
      
      return { success: true, message: 'Запись на курс отменена' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Ошибка при отмене записи на курс');
    }
  }

  // Вспомогательный метод для получения данных пользователя
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
