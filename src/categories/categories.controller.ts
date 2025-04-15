import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { Category } from './entities/category.entity';

@ApiTags('categories')
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Создать категорию', 
    description: 'Создает новую категорию курсов. Требуется роль ADMIN.' 
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiSecurity('auth-token')
  @ApiResponse({ 
    status: 201, 
    description: 'Категория успешно создана',
    type: Category
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Получить все категории', 
    description: 'Возвращает список всех категорий курсов.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Список категорий успешно получен',
    type: [Category]
  })
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Получить категорию по ID', 
    description: 'Возвращает информацию о конкретной категории по её ID.' 
  })
  @ApiParam({ name: 'id', description: 'ID категории', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Категория успешно найдена',
    type: Category
  })
  @ApiResponse({ status: 404, description: 'Категория не найдена - отображается страница 404' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Обновить категорию', 
    description: 'Обновляет информацию о категории. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID категории', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiSecurity('auth-token')
  @ApiResponse({ 
    status: 200, 
    description: 'Категория успешно обновлена',
    type: Category
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Категория не найдена - отображается страница 404' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Удалить категорию', 
    description: 'Удаляет категорию. Невозможно удалить категорию с курсами или подкатегориями. Требуется роль ADMIN.' 
  })
  @ApiParam({ name: 'id', description: 'ID категории', type: 'string', format: 'uuid' })
  @ApiSecurity('auth-token')
  @ApiResponse({ status: 200, description: 'Категория успешно удалена' })
  @ApiResponse({ status: 400, description: 'Невозможно удалить категорию с курсами или подкатегориями' })
  @ApiResponse({ status: 401, description: 'Не авторизован - отображается страница 401' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен - требуется роль ADMIN, отображается страница 403' })
  @ApiResponse({ status: 404, description: 'Категория не найдена - отображается страница 404' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.categoriesService.remove(id);
      return { success: true };
    } catch (error) {
      throw new BadRequestException('Невозможно удалить категорию с курсами или подкатегориями');
    }
  }
}
