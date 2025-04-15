import { Controller, Get, Render, Req, UseGuards, NotFoundException, All } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { AuthService } from './auth/auth.service';
import { UserRole } from './users/entities/user.entity';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';

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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER) 
  @Render('pages/lessons/index')
  async getLessonsPage(@Req() req: Request) {
    const userData = await this.getUserData(req);
    
    if (userData.user?.role !== UserRole.STUDENT && userData.user?.role !== UserRole.TEACHER) {
      throw new NotFoundException('Page not found');
    }
    
    return { 
      title: 'CourseMan - Lessons',
      currentPath: req.path,
      ...userData
    };
  }

  @Get('my-courses')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/my-courses/index')
  async getMyCourses(@Req() req: Request) {
    const userData = await this.getUserData(req);
    
    if (userData.user?.role !== UserRole.TEACHER) {
      throw new NotFoundException('Page not found');
    }
    
    return { 
      title: 'CourseMan - My Courses',
      currentPath: req.path,
      ...userData
    };
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('pages/admin/index')
  async getAdminPage(@Req() req: Request) {
    const userData = await this.getUserData(req);
    
    if (userData.user?.role !== UserRole.ADMIN) {
      throw new NotFoundException('Page not found');
    }
    
    return { 
      title: 'CourseMan - Administration',
      currentPath: req.path,
      ...userData
    };
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

  // @All('*')
  // notFound() {
  //   throw new NotFoundException('Страница не найдена');
  // }
}
