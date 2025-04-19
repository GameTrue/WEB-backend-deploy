import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { CategoriesModule } from './categories/categories.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AdminModule } from './admin/admin.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ProgressModule } from './progress/progress.module';
import { StorageModule } from './storage/storage.module';
import getTypeOrmConfig from './config/database.config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { createComplexityRule } from 'graphql-query-complexity';
import { CacheModule } from '@nestjs/cache-manager';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: getTypeOrmConfig }),
    CacheModule.register({
      isGlobal: true,
      ttl: 10, // time to live in seconds
      max: 100, // maximum number of items in cache
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    CategoriesModule,
    EnrollmentsModule,
    SubmissionsModule,
    AssignmentsModule,
    AdminModule,
    ProgressModule,
    StorageModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
      validationRules: [
        // Ограничение сложности запросов
        
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
