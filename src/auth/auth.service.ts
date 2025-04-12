import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { randomBytes, createHash } from 'crypto';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Создание новой сессии
  async createSession(user: User, req: Request): Promise<Session> {
    // Генерация безопасного токена
    const token = randomBytes(32).toString('hex');
    
    // Определение срока действия (7 дней)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Создание записи сессии
    const session = this.sessionsRepository.create({
      userId: user.id,
      token,
      expiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    
    return this.sessionsRepository.save(session);
  }
  
  // Проверка валидности сессии по токену
  async validateSession(token: string): Promise<Session> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    const session = await this.sessionsRepository.findOne({
      where: { token, active: true },
      relations: ['user'],
    });
    
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }
    
    if (new Date() > session.expiresAt) {
      // Если сессия истекла, деактивируем её
      session.active = false;
      await this.sessionsRepository.save(session);
      throw new UnauthorizedException('Session expired');
    }
    
    return session;
  }
  
  // Получение пользователя по токену
  async getUserByToken(token: string): Promise<User> {
    const session = await this.validateSession(token);
    return session.user;
  }
  
  // Деактивация сессии (выход)
  async invalidateSession(token: string): Promise<void> {
    const session = await this.sessionsRepository.findOne({
      where: { token },
    });
    
    if (session) {
      session.active = false;
      await this.sessionsRepository.save(session);
    }
  }
  
  // Авторизация пользователя (логин)
  async login(email: string, password: string, req: Request): Promise<{token: string, user: User}> {
    // Хеширование пароля (должно соответствовать вашему методу хранения)
    const hashedPassword = createHash('sha256').update(password).digest('hex');
    
    const user = await this.usersRepository.findOne({
      where: { email, password: hashedPassword },
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const session = await this.createSession(user, req);
    
    return {
      token: session.token,
      user,
    };
  }
  
  // Настройка куков для ответа
  setAuthCookies(res: Response, token: string, userName: string): void {
    // Безопасные настройки для cookies
    res.cookie('auth_token', token, {
      httpOnly: true, // Недоступен для JavaScript
      secure: process.env.NODE_ENV === 'production', // Только по HTTPS в продакшене
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });
    
    // Имя пользователя доступно для клиентского JS
    res.cookie('user_name', userName, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  
  // Удаление авторизационных куков
  clearAuthCookies(res: Response): void {
    res.clearCookie('auth_token');
    res.clearCookie('user_name');
  }
}
