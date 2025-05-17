import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, Render, ParseUUIDPipe, NotFoundException, ForbiddenException, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiSecurity, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('admin')
@Controller('api/admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiSecurity('auth-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Методы для управления пользователями
  @Get('users')
  @ApiOperation({ 
    summary: 'Получить всех пользователей', 
    description: 'Возвращает список всех пользователей системы. Требуется роль ADMIN.' 
  })
  @ApiResponse({ status: 200, description: 'Список пользователей успешно получен' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Получить пользователя по ID', 
    description: 'Возвращает подробную информацию о пользователе. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден - отображается страница 404' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  @ApiOperation({ 
    summary: 'Создать пользователя', 
    description: 'Создает нового пользователя с указанными данными. Требуется роль ADMIN.' 
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные - пользователь с таким email уже существует' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Patch('users/:id')
  @ApiOperation({ 
    summary: 'Обновить пользователя', 
    description: 'Обновляет данные существующего пользователя. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Пользователь успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Неверные данные - возникла ошибка при обновлении' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден - отображается страница 404' })
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
  @ApiOperation({ 
    summary: 'Удалить пользователя', 
    description: 'Удаляет пользователя из системы. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно удален' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден - отображается страница 404' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  @Delete('users/:userId/sessions/:sessionId')
  @ApiOperation({ 
    summary: 'Завершить сессию пользователя', 
    description: 'Удаляет активную сессию пользователя, вынуждая его заново авторизоваться. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiParam({ name: 'sessionId', description: 'ID сессии' })
  @ApiResponse({ status: 200, description: 'Сессия успешно завершена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Пользователь или сессия не найдены - отображается страница 404' })
  async terminateUserSession(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string
  ) {
    return this.adminService.terminateUserSession(userId, sessionId);
  }

  @Post('users/:id/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2 МБ максимальный размер
    },
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Только изображения допустимы'), false);
      }
      callback(null, true);
    }
  }))
  @ApiOperation({ 
    summary: 'Загрузить аватар пользователя', 
    description: 'Загружает и устанавливает аватар для пользователя. Требуется роль ADMIN.' 
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Файл аватара (поддерживаются jpg, jpeg, png, gif)'
        }
      }
    }
  })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Аватар пользователя успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Неверные данные - файл слишком большой или неправильный формат' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async uploadAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Файл аватара не предоставлен');
    }
    
    return this.adminService.updateUserAvatar(id, file);
  }

  // Методы для управления курсами
  @Get('courses')
  @ApiOperation({ 
    summary: 'Получить все курсы', 
    description: 'Возвращает список всех курсов с дополнительной информацией. Требуется роль ADMIN.' 
  })
  @ApiResponse({ status: 200, description: 'Список курсов успешно получен' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async getAllCourses() {
    return this.adminService.getAllCourses();
  }

  @Get('courses/:id')
  @ApiOperation({ 
    summary: 'Получить курс по ID', 
    description: 'Возвращает подробную информацию о курсе, включая зачисленных студентов. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса' })
  @ApiResponse({ status: 200, description: 'Курс успешно найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Курс не найден - отображается страница 404' })
  async getCourseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getCourseById(id);
  }

  @Patch('courses/:id')
  @ApiOperation({ 
    summary: 'Обновить курс', 
    description: 'Обновляет информацию о курсе. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса' })
  @ApiBody({ schema: { 
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Название курса' },
      description: { type: 'string', description: 'Описание курса' },
      price: { type: 'number', description: 'Стоимость курса' },
      isPublished: { type: 'boolean', description: 'Опубликован ли курс' },
      categoryId: { type: 'string', format: 'uuid', description: 'ID категории курса' }
    }
  }})
  @ApiResponse({ status: 200, description: 'Курс успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Неверные данные - возникла ошибка при обновлении' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Курс не найден - отображается страница 404' })
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
  @ApiOperation({ 
    summary: 'Удалить курс', 
    description: 'Удаляет курс из системы. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID курса' })
  @ApiResponse({ status: 200, description: 'Курс успешно удален' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Курс не найден - отображается страница 404' })
  async deleteCourse(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCourse(id);
  }

  // Методы для управления категориями
  @Get('categories')
  @ApiOperation({ 
    summary: 'Получить все категории', 
    description: 'Возвращает список всех категорий курсов с их иерархией. Требуется роль ADMIN.' 
  })
  @ApiResponse({ status: 200, description: 'Список категорий успешно получен' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Post('categories')
  @ApiOperation({ 
    summary: 'Создать категорию', 
    description: 'Создает новую категорию курсов. Требуется роль ADMIN.' 
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Категория успешно создана' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Родительская категория не найдена - отображается страница 404' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.adminService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  @ApiOperation({ 
    summary: 'Обновить категорию', 
    description: 'Обновляет существующую категорию курсов. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID категории' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Категория успешно обновлена' })
  @ApiResponse({ status: 400, description: 'Неверные данные - категория не может быть своим родителем' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Категория не найдена - отображается страница 404' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.adminService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @ApiOperation({ 
    summary: 'Удалить категорию', 
    description: 'Удаляет категорию. Невозможно удалить категорию с курсами или подкатегориями. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID категории' })
  @ApiResponse({ status: 200, description: 'Категория успешно удалена' })
  @ApiResponse({ status: 400, description: 'Невозможно удалить категорию с курсами или подкатегориями' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Категория не найдена - отображается страница 404' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Методы для статистики
  @Get('statistics/summary')
  @ApiOperation({ 
    summary: 'Сводная статистика', 
    description: 'Возвращает общую статистику по платформе. Требуется роль ADMIN.' 
  })
  @ApiResponse({ status: 200, description: 'Статистика успешно получена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async getStatisticsSummary() {
    return this.adminService.getStatisticsSummary();
  }

  @Get('statistics/users')
  @ApiOperation({ 
    summary: 'Статистика пользователей', 
    description: 'Возвращает статистику регистрации пользователей за указанный период. Требуется роль ADMIN.' 
  })
  @ApiQuery({ 
    name: 'period', 
    description: 'Период для анализа: week, month, year', 
    enum: ['week', 'month', 'year'],
    required: false
  })
  @ApiResponse({ status: 200, description: 'Статистика успешно получена' })
  @ApiResponse({ status: 400, description: 'Неверный параметр периода' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async getUsersStatistics(@Query('period') period: string = 'month') {
    return this.adminService.getUsersStatistics(period);
  }

  @Get('statistics/activity')
  @ApiOperation({ 
    summary: 'Статистика активности', 
    description: 'Возвращает статистику активности пользователей за указанный период. Требуется роль ADMIN.' 
  })
  @ApiQuery({ 
    name: 'period', 
    description: 'Период для анализа: week, month, year', 
    enum: ['week', 'month', 'year'],
    required: false
  })
  @ApiResponse({ status: 200, description: 'Статистика успешно получена' })
  @ApiResponse({ status: 400, description: 'Неверный параметр периода' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async getActivityStatistics(@Query('period') period: string = 'month') {
    return this.adminService.getActivityStatistics(period);
  }

  @Get('statistics/roles')
  @ApiOperation({ 
    summary: 'Статистика по ролям', 
    description: 'Возвращает распределение пользователей по ролям. Требуется роль ADMIN.' 
  })
  @ApiResponse({ status: 200, description: 'Статистика успешно получена' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async getUserRolesStatistics() {
    return this.adminService.getUserRolesStatistics();
  }
}
