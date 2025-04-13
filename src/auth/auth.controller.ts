import { Controller, Get, Post, Body, Res, Req, UnauthorizedException, ConflictException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const existingUser = await this.usersService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      const user = await this.usersService.create(createUserDto);
      
      const { token } = await this.authService.login(createUserDto.email, createUserDto.password, req);
      
      this.authService.setAuthCookies(res, token, user.name);

      return { success: true };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Ошибка при регистрации');
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { token, user } = await this.authService.login(
        loginUserDto.email,
        loginUserDto.password,
        req
      );

      this.authService.setAuthCookies(res, token, user.name);

      return { success: true };
    } catch (error) {
      throw new UnauthorizedException('Неверные учетные данные');
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['auth_token'];
    
    if (token) {
      await this.authService.invalidateSession(token);
    }
    
    this.authService.clearAuthCookies(res);
    
    return { success: true };
  }

  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const token = req.cookies['auth_token'];
    
    if (!token) {
      throw new UnauthorizedException('Не авторизован');
    }
    
    try {
      const user = await this.authService.getUserByToken(token);
      return { 
        name: user.name,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}
