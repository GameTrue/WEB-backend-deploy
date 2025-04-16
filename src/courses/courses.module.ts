import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { Category } from '../categories/entities/category.entity';
import { AuthModule } from '../auth/auth.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { ProgressModule } from '../progress/progress.module';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { CoursesResolver } from './courses.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Category, Enrollment]), 
    AuthModule,
    EnrollmentsModule,
    ProgressModule
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesResolver],
  exports: [CoursesService]
})
export class CoursesModule {}
