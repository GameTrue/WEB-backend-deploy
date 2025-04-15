import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException, BadRequestException, ParseUUIDPipe, Inject, forwardRef, Render } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Request } from 'express';
import { AssignmentsService } from '../assignments/assignments.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
    @Inject(forwardRef(() => AssignmentsService))
    private readonly assignmentsService: AssignmentsService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createSubmissionDto: CreateSubmissionDto, @Req() req: Request) {
    createSubmissionDto.userId = req.user.id;
    return await this.submissionsService.create(createSubmissionDto);
  }

  @Post('api/submit')
  @UseGuards(AuthGuard)
  async submitSolution(@Body() submissionData: { assignmentId: string, content: string }, @Req() req: Request) {
    try {
      const assignment = await this.assignmentsService.findOne(submissionData.assignmentId);
      
      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }
      
      const existingSubmissions = await this.submissionsService.findByUserAndAssignment(
        req.user.id, 
        submissionData.assignmentId
      );
      
      if (existingSubmissions && existingSubmissions.length > 0) {
        throw new BadRequestException('You have already submitted a solution for this assignment');
      }
      
      const newSubmission = await this.submissionsService.create({
        userId: req.user.id,
        assignmentId: submissionData.assignmentId,
        content: submissionData.content
      });
      
      return {
        success: true,
        message: 'Solution submitted successfully',
        submission: newSubmission
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({ 
          success: false,
          message: error.message
        });
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException({ 
          success: false,
          message: error.message 
        });
      }
      throw new BadRequestException({ 
        success: false, 
        message: `Error submitting solution: ${error.message}` 
      });
    }
  }

  @Get('api/lessons/:lessonId')
  @UseGuards(AuthGuard)
  async getSubmissionsForLesson(@Param('lessonId') lessonId: string, @Req() req: Request) {
    try {
      return await this.submissionsService.findByUserAndLessonAssignments(req.user.id, lessonId);
    } catch (error) {
      throw new BadRequestException({ 
        success: false, 
        message: `Error fetching submissions: ${error.message}` 
      });
    }
  }

  @Get('ungraded')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async findUngraded(@Req() req: Request) {
    return await this.submissionsService.findUngradedByTeacher(req.user.id);
  }

  @Get('assignment/:assignmentId')
  @UseGuards(AuthGuard)
  async findByAssignment(@Param('assignmentId') assignmentId: string) {
    return await this.submissionsService.findByAssignment(assignmentId);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async findByUser(@Req() req: Request) {
    return await this.submissionsService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return await this.submissionsService.findOne(id);
  }

  @Patch(':id/grade')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async grade(@Param('id') id: string, @Body() gradeSubmissionDto: GradeSubmissionDto) {
    return await this.submissionsService.grade(id, gradeSubmissionDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const submission = await this.submissionsService.findOne(id);
    if (submission.userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new Error('You are not authorized to delete this submission');
    }
    return await this.submissionsService.remove(id);
  }


  @Get(':id/grade')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Render('pages/submissions/grade')
  async viewSubmissionGrading(@Param('id') id: string, @Req() req: Request) {
    const submission = await this.submissionsService.findOne(id);
    
    if (!submission) {
      throw new NotFoundException('Решение не найдено');
    }
    
    if (submission.assignment?.lesson?.course?.authorId !== req.user.id) {
      throw new NotFoundException('У вас нет прав для оценки этого решения');
    }
    
    return {
      title: 'Оценка решения',
      currentPath: req.path,
      submission: submission,
      assignment: submission.assignment,
      student: submission.user
    };
  }


  @Post(':id/grade')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async gradeSubmission(
    @Param('id') id: string,
    @Body() gradeDto: GradeSubmissionDto,
    @Req() req: Request
  ) {
    const submission = await this.submissionsService.findOne(id);
    
    if (!submission) {
      throw new NotFoundException('Решение не найдено');
    }
    
    if (submission.assignment?.lesson?.course?.authorId !== req.user.id) {
      throw new NotFoundException('У вас нет прав для оценки этого решения');
    }
    
    if (gradeDto.score > submission.assignment.maxScore) {
      throw new BadRequestException(`Оценка не может превышать максимальный балл (${submission.assignment.maxScore})`);
    }
    
    const updatedSubmission = await this.submissionsService.grade(id, gradeDto);
    
    return {
      success: true,
      message: 'Решение успешно оценено',
      submission: updatedSubmission
    };
  }
}
