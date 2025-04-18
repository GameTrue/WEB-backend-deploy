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


/*
1. Получить список курсов:
query {
     courses {
       id
       title
       description
       price
       category {
         id
         name
       }
     }
   }
   
2. Получить курс по ID:
query { 
      course(id: "550e8400-e29b-41d4-a716-446655440001") {
        id
        title
        description
        price
        category {
          id
          name
        }
      }
    }

3. Создать курс:
mutation {
      createCourse(input: {
        title: "Новый курс",
        description: "Описание нового курса",
        price: 99.99,
        categoryId: "550e8400-e29b-41d4-a716-446655440002"
      }) {
        id
        title
        description
        price
      }
    }
4. Обновить курс: 
mutation {
      updateCourse(id: "550e8400-e29b-41d4-a716-446655440001", input: {
        title: "Обновленный курс",
        description: "Обновленное описание",
        price: 79.99
      }) {
        id
        title
        description
        price
      }
    }
*/