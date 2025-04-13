import { Controller, Get, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('pages/home/index')
  getIndexPage(@Req() req: Request) {
    return { 
      title: 'CourseMan',
      currentPath: req.path
    };
  }

  @Get('courses')
  @Render('pages/courses/index')
  getCoursesPage(@Req() req: Request) {
    return { 
      title: 'CourseMan - Courses',
      currentPath: req.path
    };
  }

  @Get('lessons')
  @Render('pages/lessons/index')
  getLessonsPage(@Req() req: Request) {
    return { 
      title: 'CourseMan - Lessons',
      currentPath: req.path
    };
  }
}
