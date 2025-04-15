import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Category } from '../categories/entities/category.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Session } from '../auth/entities/session.entity';
import { Progress } from '../progress/entities/progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Course, 
      Category, 
      Enrollment, 
      Session,
      Progress,
      Submission
    ]),
    AuthModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
