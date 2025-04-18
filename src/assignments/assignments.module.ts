import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { AuthModule } from '../auth/auth.module';
import { LessonsModule } from '../lessons/lessons.module';
import { AssignmentsResolver } from './assignments.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    AuthModule,
    forwardRef(() => LessonsModule)
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsResolver],
  exports: [AssignmentsService]
})
export class AssignmentsModule {}
