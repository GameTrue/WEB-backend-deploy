import { Controller, Get, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { AuthService } from './auth/auth.service';
import { UserRole } from './users/entities/user.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService
  ) {}

  @Get()
  @Render('pages/home/index')
  async getIndexPage(@Req() req: Request) {
    const userData = await this.getUserData(req);
    return { 
      title: 'CourseMan',
      currentPath: req.path,
      ...userData
    };
  }

  @Get('courses')
  @Render('pages/courses/index')
  async getCoursesPage(@Req() req: Request) {
    const userData = await this.getUserData(req);
    return { 
      title: 'CourseMan - Courses',
      currentPath: req.path,
      ...userData
    };
  }

  @Get('lessons')
  @Render('pages/lessons/index')
  async getLessonsPage(@Req() req: Request) {
    const userData = await this.getUserData(req);
    return { 
      title: 'CourseMan - Lessons',
      currentPath: req.path,
      ...userData
    };
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
