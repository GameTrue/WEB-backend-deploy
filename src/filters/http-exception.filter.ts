import { ExceptionFilter, Catch, ArgumentsHost, HttpException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    
    const acceptHeader = request.headers.accept || '';
    
    // If API request (accepts JSON), return JSON
    if (acceptHeader.includes('application/json') || request.xhr || request.path.startsWith('/api')) {
      return response.status(status).json(exception.getResponse());
    }
    
    const baseTemplateVars = {
      user: request.user || null,
      isAdmin: request.user?.role === 'admin' || false,
      currentPath: request.path || '/'
    };
    
    // For HTML requests, render the appropriate error page
    if (exception instanceof UnauthorizedException) {
      return response.status(status).render('pages/errors/401', {
        title: '401 - Требуется авторизация',
        ...baseTemplateVars
      });
    } else if (exception instanceof NotFoundException) {
      return response.status(status).render('pages/errors/404', {
        title: '404 - Страница не найдена',
        ...baseTemplateVars
      });
    } else if (exception instanceof ForbiddenException) {
      return response.status(status).render('pages/errors/error', {
        title: '403 - Доступ запрещен',
        statusCode: 403,
        message: 'Доступ запрещен',
        description: 'У вас недостаточно прав для доступа к этому ресурсу.',
        ...baseTemplateVars
      });
    } else {
      return response.status(status).render('pages/errors/error', {
        title: `${status} - Ошибка`,
        statusCode: status,
        message: exception.message || 'Произошла ошибка',
        description: 'Что-то пошло не так при обработке вашего запроса.',
        ...baseTemplateVars
      });
    }
  }
}
