import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['auth_token'];

    if (!token) {
      throw new UnauthorizedException('Не авторизован');
    }

    try {
      const user = await this.authService.getUserByToken(token);
      
      request['user'] = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}
