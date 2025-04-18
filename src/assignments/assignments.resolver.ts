import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { LessonsService } from '../lessons/lessons.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AssignmentType } from './entities/assignment.type';
import { LessonType } from '../lessons/entities/lesson.type';
import { CreateAssignmentInput, UpdateAssignmentInput } from './dto/assignment.input';

@Resolver(() => AssignmentType)
export class AssignmentsResolver {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly lessonsService: LessonsService
  ) {}

  @Query(() => [AssignmentType], { description: 'Получить задания урока' })
  @UseGuards(AuthGuard)
  async assignmentsByLesson(
    @Args('lessonId') lessonId: string,
  ): Promise<AssignmentType[]> {
    return this.assignmentsService.findAllByLesson(lessonId);
  }

  @Query(() => AssignmentType, { description: 'Получить задание по ID' })
  @UseGuards(AuthGuard)
  async assignment(
    @Args('id') id: string
  ): Promise<AssignmentType> {
    return this.assignmentsService.findOne(id);
  }

  @Mutation(() => AssignmentType, { description: 'Создать новое задание' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async createAssignment(
    @Args('input') input: CreateAssignmentInput,
  ): Promise<AssignmentType> {
    // Проверка, что урок принадлежит курсу преподавателя
    const lesson = await this.lessonsService.findOne(input.lessonId, {
      relations: {
        course: true
      }
    });
    
    if (!lesson || !lesson.course) {
      throw new Error('Урок не найден или вы не являетесь его автором');
    }
    
    return this.assignmentsService.create(input);
  }

  @Mutation(() => AssignmentType, { description: 'Обновить задание' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateAssignment(
    @Args('id') id: string,
    @Args('input') input: UpdateAssignmentInput,
  ): Promise<AssignmentType> {
    const assignment = await this.assignmentsService.findOne(id);
    const lesson = await this.lessonsService.findOne(assignment.lessonId, {
      relations: {
        course: true
      }
    });
    
    if (!lesson || !lesson.course) {
      throw new Error('Задание не найдено или вы не являетесь его автором');
    }
    
    return this.assignmentsService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Удалить задание' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async deleteAssignment(
    @Args('id') id: string,
  ): Promise<boolean> {
    const assignment = await this.assignmentsService.findOne(id);
    const lesson = await this.lessonsService.findOne(assignment.lessonId, {
      relations: {
        course: true
      }
    });
    
    if (!lesson || !lesson.course ) {
      throw new Error('Задание не найдено или вы не являетесь его автором');
    }
    
    await this.assignmentsService.remove(id);
    return true;
  }

  @ResolveField(() => LessonType, { description: 'Урок, к которому относится задание' })
  async lesson(@Parent() assignment: AssignmentType): Promise<LessonType> {
    const result = await this.assignmentsService.findOne(assignment.id);
    return result.lesson;
  }
}

/*
1. Получить задания урока:
query {
    assignmentsByLesson(lessonId: "e89cc5c6-5a8e-4211-a93a-af42e5c6a5c4") {
        id
        title
        description
        maxScore
        deadline
    }
    }
2. Получить задание по ID:
query {
    assignment(id: "e89cc5c6-5a8e-4211-a93a-af42e5c6a5c4") {
        id
        title
        description
        maxScore
        deadline
    }
}
3. Создать новое задание:
mutation {
    createAssignment(input: {
        lessonId: "e89cc5c6-5a8e-4211-a93a-af42e5c6a5c4",
        title: "Контрольная работа №1",
        description: "В этом задании вам необходимо решить следующие задачи...",
        maxScore: 100,
        deadline: "2023-06-30T23:59:59Z"
    }) {
        id
        title
        description
        maxScore
        deadline
    }
}
4. Обновить задание:
mutation {
    updateAssignment(id: "e89cc5c6-5a8e-4211-a93a-af42e5c6a5c4", input: {
        title: "Обновленное задание",
        description: "Обновленное описание задания",
        maxScore: 90,
        deadline: "2023-07-15T23:59:59Z"
    }) {
        id
        title
        description
        maxScore
        deadline
    }
}
*/