import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  @IsNotEmpty()
  assignmentId: string;

  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
