import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Category } from '../categories/entities/category.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { Progress } from '../progress/entities/progress.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { Session } from '../auth/entities/session.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Course, 
      Category, 
      Enrollment, 
      Submission, 
      Progress,
      Session
    ]),
    AuthModule,
    UsersModule,
    StorageModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
