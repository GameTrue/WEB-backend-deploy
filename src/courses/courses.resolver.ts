import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { CoursesService } from './courses.service';
import { CourseType } from './entities/course.type';
import { CreateCourseInput, UpdateCourseInput } from './dto/course.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CategoryType } from '../categories/entities/category.type';

@Resolver(() => CourseType)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  @Query(() => [CourseType], { description: 'Получить список всех курсов' })
  async courses(): Promise<CourseType[]> {
    return this.coursesService.findAll();
  }

  @Query(() => CourseType, { description: 'Получить курс по ID' })
  async course(@Args('id') id: string): Promise<CourseType> {
    return this.coursesService.findOne(id);
  }

//   @Mutation(() => CourseType, { description: 'Создать новый курс' })
//   @UseGuards(AuthGuard, RolesGuard)
//   @Roles(UserRole.TEACHER)
//   async createCourse(
//     @Args('input') input: CreateCourseInput,
//   ): Promise<CourseType> {
//     return this.coursesService.create(input);
//   }

  @Mutation(() => CourseType, { description: 'Обновить курс' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateCourse(
    @Args('id') id: string,
    @Args('input') input: UpdateCourseInput,
  ): Promise<CourseType> {
    return this.coursesService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Удалить курс' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async deleteCourse(@Args('id') id: string): Promise<boolean> {
    await this.coursesService.remove(id);
    return true;
  }

//   @ResolveField(() => CategoryType, { description: 'Категория курса' })
//   async category(@Parent() course: CourseType): Promise<CategoryType> {
//     return this.coursesService.getCategory(course.categoryId);
//   }
}