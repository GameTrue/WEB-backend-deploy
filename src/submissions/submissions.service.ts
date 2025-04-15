import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { ProgressService } from '../progress/progress.service';
import { ProgressStatus } from '../progress/entities/progress.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    private progressService: ProgressService
  ) {}


  async create(data: { userId: string; assignmentId: string; content: string }): Promise<Submission> {
    const submission = this.submissionsRepository.create({
      userId: data.userId,
      assignmentId: data.assignmentId,
      content: data.content,
      submittedAt: new Date()
    });
    
    const savedSubmission = await this.submissionsRepository.save(submission);
    
    const submissionWithRelations = await this.submissionsRepository.findOne({
      where: { id: savedSubmission.id },
      relations: {
        assignment: {
          lesson: true
        }
      } 
    });
    
    if (submissionWithRelations?.assignment?.lesson) {
      await this.progressService.markAsInProgress(
        data.userId, 
        submissionWithRelations.assignment.lesson.id
      );
    }
    
    return savedSubmission;
  }

  async create2(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    const submission = this.submissionsRepository.create(createSubmissionDto);
    return await this.submissionsRepository.save(submission);
  }

  async findAll(): Promise<Submission[]> {
    return await this.submissionsRepository.find();
  }

  async findByAssignment(assignmentId: string): Promise<Submission[]> {
    return await this.submissionsRepository.find({
      where: { assignmentId },
      relations: ['user'],
    });
  }



  async findByUserAndAssignment(userId: string, assignmentId: string): Promise<Submission[]> {
    return await this.submissionsRepository.find({
      where: { 
        assignmentId,
        userId
       },
      relations: ['user'],
    });
  }

  async findUngradedByTeacher(teacherId: string): Promise<Submission[]> {
    return await this.submissionsRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.assignment', 'assignment')
      .leftJoinAndSelect('assignment.lesson', 'lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .leftJoinAndSelect('submission.user', 'user')
      .where('course.authorId = :teacherId', { teacherId })
      .andWhere('submission.score IS NULL')
      .getMany();
  }

  async findByUser(userId: string): Promise<Submission[]> {
    return await this.submissionsRepository.find({
      where: { userId },
      relations: ['assignment'],
    });
  }

  async findByUserAndLessonAssignments(userId: string, lessonId: string): Promise<Submission[]> {
    return this.submissionsRepository.find({
      where: {
        userId,
        assignment: {
          lessonId
        }
      },
      relations: {
        assignment: true
      }
    });
  }

  async findOne(id: string): Promise<Submission> {
    const submission = await this.submissionsRepository.findOne({
      where: { id },
      relations: ['assignment', 'user', 'assignment.lesson', 'assignment.lesson.course'],
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  async grade(id: string, gradeSubmissionDto: GradeSubmissionDto): Promise<Submission> {
    const submission = await this.findOne(id);
    
    submission.score = gradeSubmissionDto.score;
    submission.feedback = gradeSubmissionDto.feedback;
    submission.gradedAt = new Date();
    
    return await this.submissionsRepository.save(submission);
  }

  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    await this.submissionsRepository.remove(submission);
  }
}
