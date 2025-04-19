import { Controller, Get, Post, Body, Res, Req, UnauthorizedException, ConflictException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ 
    summary: 'Регистрация нового пользователя', 
    description: 'Создает нового пользователя и возвращает токен авторизации в cookie' 
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
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
  @ApiOperation({ 
    summary: 'Авторизация пользователя', 
    description: 'Авторизует пользователя и возвращает токен в cookie' 
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Пользователь успешно авторизован, токен установлен' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
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
  @ApiOperation({ 
    summary: 'Выход из системы', 
    description: 'Инвалидирует текущую сессию и удаляет cookie авторизации' 
  })
  @ApiResponse({ status: 200, description: 'Пользователь успешно вышел из системы' })
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
  @ApiOperation({ 
    summary: 'Получить информацию о текущем пользователе', 
    description: 'Возвращает данные о текущем авторизованном пользователе' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Информация о пользователе', 
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Иван Иванов' },
        email: { type: 'string', example: 'user@example.com' },
        role: { type: 'string', enum: ['admin', 'teacher', 'student'], example: 'student' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
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
        role: user.role,
        avatar: user.avatar
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}
