import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { createHash } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = createHash('sha256').update(createUserDto.password).digest('hex');
    
    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      role: createUserDto.role || UserRole.STUDENT,
      avatar: createUserDto.avatar || "https://course-bucket.storage.yandexcloud.net/avatars/fb54f6a6-f01e-4600-82d6-a7345d456d96.png",
    });
    
    return await this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }
  
  async findAll(): Promise<User[] | null> {
    return await this.usersRepository.find();
  }
}
