import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auto } from './entities/auto.entity';
import { Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { CreateAutoDto } from './dto/create-auto.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { isMysqlDuplicateError } from '../errors/dublicate.error';
import { UpdateAutoDto } from './dto/update-auto.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Injectable()
export class AutoService {
  constructor(
    @InjectRepository(Auto)
    private readonly autoRepository: Repository<Auto>,
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
  ) {}

  async getAllAutos(): Promise<Auto[]> {
    return await this.autoRepository.find({ relations: ['models'] });
  }

  async getAutoById(id: number): Promise<Auto> {
    const auto = await this.autoRepository.findOne({
      where: { id },
      relations: ['models'],
    });

    if (!auto) {
      throw new NotFoundException(`Auto with id ${id} not found`);
    }

    return auto;
  }

  async createAuto(createAutoDto: CreateAutoDto): Promise<Auto> {
    const auto = await this.autoRepository.findOneBy({
      mark: createAutoDto.mark,
    });

    if (auto)
      throw new ConflictException(
        `Auto with mark ${auto.mark} is already exists`,
      );

    const newAuto = this.autoRepository.create(createAutoDto);

    return await this.autoRepository.save(newAuto);
  }

  async updateAutoById(
    id: number,
    updateAutoDto: UpdateAutoDto,
  ): Promise<Auto> {
    const auto = await this.autoRepository.preload({
      id,
      ...updateAutoDto,
    });

    if (!auto) {
      throw new NotFoundException(`Auto with id ${id} not found`);
    }

    return await this.autoRepository.save(auto);
  }

  async deleteAuto(id: number): Promise<void> {
    await this.autoRepository.delete(id);
  }

  async createModel(
    autoId: number,
    createModelDto: CreateModelDto,
  ): Promise<Model> {
    const auto = await this.autoRepository.findOneBy({
      id: autoId,
    });

    if (!auto) throw new NotFoundException(`Auto with id ${autoId} not found`);

    const model = this.modelRepository.create({
      name: createModelDto.name,
      auto,
    });

    try {
      return await this.modelRepository.save(model);
    } catch (error) {
      if (
        isMysqlDuplicateError(error) &&
        error.driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          `Model "${createModelDto.name}" already exists for "${auto.mark}"`,
        );
      }
      throw error;
    }
  }

  async updateModelById(
    id: number,
    updateModelDto: UpdateModelDto,
  ): Promise<Model> {
    const model = await this.modelRepository.preload({
      id,
      ...updateModelDto,
    });

    if (!model) {
      throw new NotFoundException(`Model with id ${id} not found`);
    }

    try {
      return await this.modelRepository.save(model);
    } catch (error) {
      if (
        isMysqlDuplicateError(error) &&
        error.driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          `Model "${updateModelDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async deleteModel(id: number): Promise<void> {
    await this.modelRepository.delete(id);
  }
}
