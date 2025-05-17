import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as expressLayouts from 'express-ejs-layouts';
import * as methodOverride from 'method-override';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TimingInterceptor } from './interceptors/timing.interceptor';
import { EtagInterceptor } from './interceptors/etag.interceptor';
import { XmlResponseInterceptor } from './interceptors/xml-response.interceptor';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new XmlResponseInterceptor());
  
  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Learning Platform API')
    .setDescription('API документация для платформы онлайн-обучения')
    .setVersion('1.0')
    .addTag('admin', 'Управление системой (только для администраторов)')
    .addTag('assignments', 'Задания к урокам')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('categories', 'Категории курсов')
    .addTag('courses', 'Учебные курсы')
    .addTag('enrollments', 'Зачисления на курсы')
    .addTag('lessons', 'Уроки курсов')
    // .addTag('progress', 'Прогресс обучения')
    .addTag('submissions', 'Ответы на задания')
    // .addTag('users', 'Управление пользователями')
    .addApiKey(
      { 
        type: 'apiKey', 
        in: 'cookie',
        name: 'auth_token',
        description: 'Аутентификация через cookie. Получите токен через /auth/login'
      },
      'auth-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  Object.values(document.paths).forEach(path => {
    Object.values(path as Record<string, any>).forEach(method => {
      if (method.responses) {
        Object.values(method.responses).forEach(response => {
          const typedResponse = response as Record<string, any>;
          if (typedResponse.content) {
            typedResponse.content['application/xml'] = {
              schema: {
                type: 'object',
                properties: {
                  response: typedResponse.content['application/json'].schema
                }
              }
            };
          }
        });
      }
    });
  });
  
  app.set('trust proxy', true) 
  
  // Добавляем документацию о ролях пользователей
  document.components.schemas['UserRoles'] = {
    type: 'string',
    enum: ['ADMIN', 'TEACHER', 'STUDENT'],
    description: 'Роли пользователей в системе'
  };
  
  SwaggerModule.setup('api/docs', app, document);

  // Включаем валидацию данных
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Register global interceptors
  app.useGlobalInterceptors(
    new TimingInterceptor(),
    new EtagInterceptor()
  );

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

  // Получение порта из переменных окружения или использования порта по умолчанию
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
