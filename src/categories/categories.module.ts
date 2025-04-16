import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { AuthModule } from '../auth/auth.module'; 
import { CategoriesResolver } from './categories.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AuthModule, 
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesResolver],
  exports: [CategoriesService]
})
export class CategoriesModule {}
