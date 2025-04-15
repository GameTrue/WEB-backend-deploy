import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, Render, ParseUUIDPipe, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('api/admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Методы для управления пользователями
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      return await this.adminService.updateUser(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Ошибка при обновлении пользователя');
    }
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  @Delete('users/:userId/sessions/:sessionId')
  async terminateUserSession(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string
  ) {
    return this.adminService.terminateUserSession(userId, sessionId);
  }

  // Методы для управления курсами
  @Get('courses')
  async getAllCourses() {
    return this.adminService.getAllCourses();
  }

  @Get('courses/:id')
  async getCourseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getCourseById(id);
  }

  @Patch('courses/:id')
  async updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: any
  ) {
    try {
      return await this.adminService.updateCourse(id, updateCourseDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Ошибка при обновлении курса');
    }
  }

  @Delete('courses/:id')
  async deleteCourse(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCourse(id);
  }

  // Методы для управления категориями
  @Get('categories')
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Post('categories')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.adminService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.adminService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Методы для статистики
  @Get('statistics/summary')
  async getStatisticsSummary() {
    return this.adminService.getStatisticsSummary();
  }

  @Get('statistics/users')
  async getUsersStatistics(@Query('period') period: string = 'month') {
    return this.adminService.getUsersStatistics(period);
  }

  @Get('statistics/activity')
  async getActivityStatistics(@Query('period') period: string = 'month') {
    return this.adminService.getActivityStatistics(period);
  }

  @Get('statistics/roles')
  async getUserRolesStatistics() {
    return this.adminService.getUserRolesStatistics();
  }
}
