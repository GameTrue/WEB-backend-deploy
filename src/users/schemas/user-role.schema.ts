import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

/**
 * Схема для документации перечисления ролей пользователей
 */
export class UserRoleSchema {
  @ApiProperty({
    description: 'Роль пользователя в системе',
    enum: UserRole,
    enumName: 'UserRole',
    examples: [
      {
        value: UserRole.STUDENT,
        description: 'Студент - может просматривать и записываться на курсы, проходить уроки'
      },
      {
        value: UserRole.TEACHER,
        description: 'Преподаватель - может создавать и управлять курсами, создавать уроки и задания'
      },
      {
        value: UserRole.ADMIN,
        description: 'Администратор - имеет полный доступ к системе, включая управление пользователями'
      }
    ]
  })
  role: UserRole;
}
