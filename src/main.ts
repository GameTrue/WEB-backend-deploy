import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as expressLayouts from 'express-ejs-layouts';
import * as methodOverride from 'method-override';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Включаем валидацию данных
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Подключаем cookie-parser
  app.use(cookieParser());
  
  // Добавляем поддержку method-override для HTTP методов
  app.use(methodOverride('_method'));
  
  // Настройка шаблонизатора EJS с layouts
  app.use(expressLayouts);
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  
  // Конфигурация express-ejs-layouts
  app.set('layout', 'layouts/main');
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);
  
  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Получение порта из переменных окружения или использование порта по умолчанию
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
