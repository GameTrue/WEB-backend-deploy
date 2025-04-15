import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, NotFoundException, ParseUUIDPipe, Inject, forwardRef, Render } from '@nestjs/common';
import { Request } from 'express';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthService } from '../auth/auth.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { LessonsService } from '../lessons/lessons.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    @Inject(forwardRef(() => LessonsService))
    private readonly lessonsService: LessonsService,
    private readonly authService: AuthService,
  ) {}

  @Get('create/:lessonId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/assignments/create')
  async showCreateForm(@Param('lessonId', ParseUUIDPipe) lessonId: string, @Req() req: Request) {
    try {
      const lesson = await this.lessonsService.findOne(lessonId, {
        relations: {
          course: true
        }
      });
      
      if (!lesson || !lesson.course) {
        throw new NotFoundException('Урок не найден');
      }
      
      if (lesson.course.authorId !== req.user.id) {
        throw new NotFoundException('Вы не являетесь автором этого урока');
      }
      const userData = await this.getUserData(req);
      
      return {
        title: 'Создание задания',
        currentPath: req.path,
        lesson,
        course: lesson.course,
        ...userData
      };
    } catch (error) {
      throw new NotFoundException('Урок не найден или вы не имеете прав для создания заданий');
    }
  }

  @Post('api')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async create(@Body() createAssignmentDto: CreateAssignmentDto, @Req() req: Request) {
    const lesson = await this.lessonsService.findOne(createAssignmentDto.lessonId, {
      relations: {
        course: true
      }
    });
    
    if (!lesson || !lesson.course || lesson.course.authorId !== req.user.id) {
      throw new NotFoundException('Урок не найден или вы не являетесь его автором');
    }
    
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get('api/lesson/:lessonId')
  @UseGuards(AuthGuard)
  async findAllByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.assignmentsService.findAllByLesson(lessonId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Render('pages/assignments/view')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const assignment = await this.assignmentsService.findOne(id);
    const lesson = await this.lessonsService.findOne(assignment.lessonId);
    
    const isTeacher = lesson.course.authorId === req.user.id;
    const isCourseParticipant = req.user.role === UserRole.STUDENT; 
    
    if (!isTeacher && !isCourseParticipant) {
      throw new NotFoundException('Задание не найдено');
    }
    
    const userData = await this.getUserData(req);

    return {
      title: assignment.title,
      currentPath: req.path,
      assignment,
      lesson,
      course: lesson.course,
      isTeacher,
      isCourseParticipant,
      ...userData
    };
  }

  @Get('edit/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/assignments/edit')
  async showEditForm(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const assignment = await this.assignmentsService.findOne(id);
    const lesson = await this.lessonsService.findOne(assignment.lessonId, {
        relations: {
          course: true
        }
      }
    );
    
    if (!lesson || lesson.course.authorId !== req.user.id) {
      throw new NotFoundException('Задание не найдено или вы не являетесь его автором');
    }

    const userData = await this.getUserData(req);
    
    return {
      title: `Редактирование задания: ${assignment.title}`,
      currentPath: req.path,
      assignment,
      lesson,
      course: lesson.course,
      ...userData
    };
  }

  @Patch('api/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @Req() req: Request
  ) {
    const assignment = await this.assignmentsService.findOne(id);
    const lesson = await this.lessonsService.findOne(assignment.lessonId, {
      relations: {
        course: true
      }
    });
    
    if (!lesson || !lesson.course || lesson.course.authorId !== req.user.id) {
      throw new NotFoundException('Задание не найдено или вы не являетесь его автором');
    }
    
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete('api/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const assignment = await this.assignmentsService.findOne(id);
    const lesson = await this.lessonsService.findOne(assignment.lessonId, {
      relations: {
        course: true
      }
    });
    
    if (!lesson || !lesson.course || lesson.course.authorId !== req.user.id) {
      throw new NotFoundException('Задание не найдено или вы не являетесь его автором');
    }
    
    await this.assignmentsService.remove(id);
    return { success: true };
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
