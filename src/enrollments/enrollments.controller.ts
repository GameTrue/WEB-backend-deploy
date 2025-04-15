import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Req() req: Request) {
    createEnrollmentDto.userId = req.user.id;
    return await this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get('course/:courseId')
  @UseGuards(AuthGuard)
  async findByCourse(@Param('courseId') courseId: string) {
    return await this.enrollmentsService.findByCourse(courseId);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async findByUser(@Req() req: Request) {
    return await this.enrollmentsService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return await this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return await this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return await this.enrollmentsService.remove(id);
  }
}
