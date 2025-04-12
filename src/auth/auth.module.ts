import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, User]),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
