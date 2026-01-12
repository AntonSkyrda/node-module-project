import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AutoService } from './auto.service';
import { CreateAutoDto } from './dto/create-auto.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../constants/user-role.enum';
import { UpdateAutoDto } from './dto/update-auto.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Controller('auto')
export class AutoController {
  constructor(private readonly autoService: AutoService) {}

  @Get()
  async getAllAutos() {
    return await this.autoService.getAllAutos();
  }

  @Get(':id')
  async getOneAuto(@Param('id', ParseIntPipe) id: number) {
    return await this.autoService.getAutoById(id);
  }

  @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
  @Post()
  async createAuto(@Body() createAutoDto: CreateAutoDto) {
    return await this.autoService.createAuto(createAutoDto);
  }

  @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
  @Patch(':id')
  async updateAuto(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAutoDto: UpdateAutoDto,
  ) {
    return await this.autoService.updateAutoById(id, updateAutoDto);
  }

  @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.autoService.deleteAuto(id);
  }

  @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
  @Post(':id/model')
  async createModel(
    @Param('id', ParseIntPipe) id: number,
    @Body() createModelDto: CreateModelDto,
  ) {
    return await this.autoService.createModel(id, createModelDto);
  }

  @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
  @Patch('model/:id')
  async updateModel(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModelDto: UpdateModelDto,
  ) {
    return await this.autoService.updateModelById(id, updateModelDto);
  }

  @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
  @Delete('model/:id')
  async deleteModel(@Param('id', ParseIntPipe) id: number) {
    return await this.autoService.deleteModel(id);
  }
}
