import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Подключаем cookie-parser
  app.use(cookieParser());

  // Настройка шаблонизатора EJS
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Получение порта из переменных окружения или использование порта по умолчанию
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
