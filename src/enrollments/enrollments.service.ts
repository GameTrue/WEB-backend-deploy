import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const enrollment = this.enrollmentsRepository.create(createEnrollmentDto);
    return await this.enrollmentsRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return await this.enrollmentsRepository.find();
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return await this.enrollmentsRepository.find({
      where: { courseId },
      relations: ['user'],
    });
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    return await this.enrollmentsRepository.find({
      where: { userId },
      relations: ['course'],
    });
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['course', 'user'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);
    Object.assign(enrollment, updateEnrollmentDto);
    return await this.enrollmentsRepository.save(enrollment);
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentsRepository.remove(enrollment);
  }


  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    return this.enrollmentsRepository.findOne({
      where: {
        userId,
        courseId
      },
      relations: {
        course: true,
        user: true
      }
    });
  }

  async cancel(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.status = EnrollmentStatus.CANCELED;
    await this.enrollmentsRepository.save(enrollment);
  }
  
  async complete(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.status = EnrollmentStatus.COMPLETED;
    enrollment.completionDate = new Date();
    await this.enrollmentsRepository.save(enrollment);
  }

  async findByUserWithDetails(userId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { 
        userId,
        status: Not(EnrollmentStatus.CANCELED) 
      },
      relations: {
        course: {
          author: true,
          category: true,
          lessons: {
            progress: {
              user: true 
            } 
          }
        }
      },
      order: {
        enrollmentDate: 'DESC' 
      }
    });
  }
}
