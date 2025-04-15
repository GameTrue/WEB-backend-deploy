import { ExceptionFilter, Catch, ArgumentsHost, HttpException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    
    // Check if the request accepts JSON (API request)
    const acceptHeader = request.headers.accept || '';
    
    // If API request (accepts JSON), return JSON
    if (acceptHeader.includes('application/json') || request.xhr || request.path.startsWith('/api')) {
      return response.status(status).json(exception.getResponse());
    }
    
    // Base variables for all templates
    const baseTemplateVars = {
      title: `${status} - Ошибка`,
      user: request.user || null,
      isAdmin: request.user?.role === 'admin' || false,
      currentPath: request.path || '/'
    };
    
    // For HTML requests, render the appropriate error page
    if (exception instanceof UnauthorizedException) {
      return response.status(status).render('pages/errors/401', {
        ...baseTemplateVars,
        title: '401 - Требуется авторизация'
      });
    } else if (exception instanceof NotFoundException) {
      return response.status(status).render('pages/errors/404', {
        ...baseTemplateVars,
        title: '404 - Страница не найдена'
      });
    } else if (exception instanceof ForbiddenException) {
      return response.status(status).render('pages/errors/error', {
        ...baseTemplateVars,
        title: '403 - Доступ запрещен',
        statusCode: 403,
        message: 'Доступ запрещен',
        description: 'У вас недостаточно прав для доступа к этому ресурсу.'
      });
    } else {
      // For other types of errors
      return response.status(status).render('pages/errors/error', {
        ...baseTemplateVars,
        statusCode: status,
        message: exception.message || 'Произошла ошибка',
        description: 'Что-то пошло не так при обработке вашего запроса.'
      });
    }
  }
}
