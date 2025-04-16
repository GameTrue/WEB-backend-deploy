import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserType } from './entities/user.type';
import { CreateUserInput, UpdateUserInput } from './dto/user.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType], { description: 'Получить список всех пользователей' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async users(): Promise<UserType[]> {
    return this.usersService.findAll();
  }

  @Query(() => UserType, { description: 'Получить пользователя по ID' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async user(@Args('id') id: string): Promise<UserType> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => UserType, { description: 'Создать нового пользователя' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Args('input') input: CreateUserInput): Promise<UserType> {
    return this.usersService.create(input);
  }

//   @Mutation(() => UserType, { description: 'Обновить данные пользователя' })
//   @UseGuards(AuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   async updateUser(
//     @Args('id') id: string,
//     @Args('input') input: UpdateUserInput,
//   ): Promise<UserType> {
//     return this.usersService.update(id, input);
//   }

//   @Mutation(() => Boolean, { description: 'Удалить пользователя' })
//   @UseGuards(AuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   async deleteUser(@Args('id') id: string): Promise<boolean> {
//     await this.usersService.remove(id);
//     return true;
//   }
}