import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { CategoryType } from './entities/category.type';
import { CreateCategoryInput, UpdateCategoryInput } from './dto/category.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Resolver(() => CategoryType)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [CategoryType], { description: 'Получить список всех категорий' })
  async categories(): Promise<CategoryType[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => CategoryType, { description: 'Получить категорию по ID' })
  async category(@Args('id') id: string): Promise<CategoryType> {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => CategoryType, { description: 'Создать новую категорию' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
  ): Promise<CategoryType> {
    return this.categoriesService.create(input);
  }

  @Mutation(() => CategoryType, { description: 'Обновить категорию' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCategory(
    @Args('id') id: string,
    @Args('input') input: UpdateCategoryInput,
  ): Promise<CategoryType> {
    return this.categoriesService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Удалить категорию' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCategory(@Args('id') id: string): Promise<boolean> {
    await this.categoriesService.remove(id);
    return true;
  }

  @ResolveField(() => [CategoryType], { description: 'Дочерние категории' })
  async children(@Parent() category: CategoryType): Promise<CategoryType[]> {
    return this.categoriesService.findChildren(category.id);
  }

  @ResolveField(() => [CategoryType], { description: 'Родительская категория' })
  async parent(@Parent() category: CategoryType): Promise<CategoryType> {
    return this.categoriesService.findParent(category.parentId);
  }
}


/*
1. Получить список категорий:
    query {
        categories {
            id
            name
            description
            children {
            id
            name
            }
        }
    }

2. Создать категорию:
    mutation {
        createCategory(input: {
            name: "Новая категория"
            description: "Описание новой категории"
        }) {
            id
            name
        }
    }
3. Обновить категорию:
    mutation {
        updateCategory(id: "id_категории", input: {
            name: "Обновленное название"
            description: "Обновленное описание"
        }) {
            id
            name
        }
    }
4. Удалить категорию:
    mutation {
        deleteCategory(id: "id_категории")
    }
5. Получить категорию по ID:
    query {
        category(id: "id_категории") {
            id
            name
            description
            children {
                id
                name
            }
        }
    }
6. Получить дочерние категории:
    query {
        category(id: "id_категории") {
            id
            name
            description
            children {
                id
                name
            }
        }
    }
7. Получить родительскую категорию:
    query {
        category(id: "id_категории") {
            id
            name
            description
            parent {
                id
                name
            }
        }
    }
*/
