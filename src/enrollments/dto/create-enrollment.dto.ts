import { IsNotEmpty, IsUUID } from 'class-validator';
import { EnrollmentStatus } from '../entities/enrollment.entity';

export class CreateEnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsUUID()
  userId: string;
  
  status?: EnrollmentStatus;
}
