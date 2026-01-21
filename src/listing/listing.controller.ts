import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { Public } from '../auth/decorators/public.decorator';
import { GetAllListingsQueryDto } from './dto/get-all-listings-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../constants/user-role.enum';
import { CreateCarListingDto } from './dto/create-car-listing.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { UpdateListingTextDto } from './dto/update-car-listing-text.dto';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Public()
  @Get()
  async getAll(@Query() getAllListingsQueryDto: GetAllListingsQueryDto) {
    return await this.listingService.getAll(getAllListingsQueryDto);
  }

  @Public()
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.listingService.getById(id);
  }

  @Roles(UserRoleEnum.SELLER)
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createCarListingDto: CreateCarListingDto,
  ) {
    return await this.listingService.create(user.id, createCarListingDto);
  }

  @Roles(UserRoleEnum.SELLER)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() updateListingTextDto: UpdateListingTextDto,
  ) {
    return await this.listingService.updateText(
      user.id,
      id,
      updateListingTextDto,
    );
  }
}
