import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from './user.entity';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Роль пользователя в системе',
});

@ObjectType({ description: 'Пользователь системы' })
export class UserType {
  @Field(() => ID, { description: 'Уникальный идентификатор пользователя' })
  id: string;

  @Field({ description: 'Email пользователя' })
  email: string;

  @Field({ description: 'Имя пользователя' })
  name: string;

  @Field(() => UserRole, { description: 'Роль пользователя в системе' })
  role: UserRole;

  @Field({ description: 'Дата создания аккаунта' })
  createdAt: Date;

  @Field({ description: 'Дата последнего обновления аккаунта' })
  updatedAt: Date;
}