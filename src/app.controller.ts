import { Controller, Get, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getIndexPage(@Req() req: Request) {
    return { 
      title: 'CourseMan',
      currentPath: req.path
    };
  }

  @Get('courses')
  @Render('courses')
  getCoursesPage(@Req() req: Request) {
    return { 
      title: 'CourseMan - Courses',
      currentPath: req.path
    };
  }

  @Get('lessons')
  @Render('lessons')
  getLessonsPage(@Req() req: Request) {
    return { 
      title: 'CourseMan - Lessons',
      currentPath: req.path
    };
  }

  @Get('auth')
  @Render('auth')
  getAuthPage(@Req() req: Request) {
    return { 
      title: 'Авторизация - CourseMan',
      currentPath: req.path
    };
  }
}
