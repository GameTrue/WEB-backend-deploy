import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentsRepository.create(createAssignmentDto);
    return await this.assignmentsRepository.save(assignment);
  }

  async findAllByLesson(lessonId: string): Promise<Assignment[]> {
    return await this.assignmentsRepository.find({
      where: { lessonId },
      order: { id: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
      relations: ['lesson']
    });
    
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID "${id}" not found`);
    }
    
    return assignment;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.findOne(id);
    
    const updatedAssignment = this.assignmentsRepository.merge(assignment, updateAssignmentDto);
    return await this.assignmentsRepository.save(updatedAssignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.assignmentsRepository.remove(assignment);
  }
}
