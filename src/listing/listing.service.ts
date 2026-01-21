import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AutoService } from '../auto/auto.service';
import { AuthService } from '../auth/auth.service';
import { ProfanityCheckerService } from '../profanity-checker/profanity-checker.service';
import { ExchangeRateService } from '../exchange-rate/exchenge-rate.service';
import { PriceCalculatorService } from './services/price-calculator.service';

import { CreateCarListingDto } from './dto/create-car-listing.dto';
import { UpdateListingTextDto } from './dto/update-car-listing-text.dto';
import { GetAllListingsQueryDto } from './dto/get-all-listings-query.dto';

import { AccountTypeEnum } from '../constants/account-type.enum';
import { ListingStatusEnum } from '../constants/listening-status.enum';
import { CurrencyEnum } from '../constants/currency.enum';
import { CarListing } from './entities/listing.entity';
import { MailerService } from '../mailer/mailer.service';
import { EMAIL_TEMPLATES } from '../constants/email.templates';
import { EnvService } from '../shared/services/env.service';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(CarListing)
    private readonly listingRepository: Repository<CarListing>,

    private readonly autoService: AutoService,
    private readonly authService: AuthService,
    private readonly profanityCheckerService: ProfanityCheckerService,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly priceCalculatorService: PriceCalculatorService,
    private readonly mailerService: MailerService,
    private readonly envService: EnvService,
  ) {}

  async getAll(query: GetAllListingsQueryDto) {
    const page = query.page ?? 1;
    const limitRaw = query.limit ?? 20;
    const limit = Math.min(Math.max(limitRaw, 1), 50);
    const skip = (page - 1) * limit;

    const priceColumn =
      query.currency === CurrencyEnum.USD
        ? 'listing.priceUsd'
        : query.currency === CurrencyEnum.EUR
          ? 'listing.priceEur'
          : 'listing.priceUah';

    const qb = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.auto', 'auto')
      .leftJoinAndSelect('listing.model', 'model')
      .where('listing.status = :status', { status: ListingStatusEnum.ACTIVE });

    if (query.autoId)
      qb.andWhere('auto.id = :autoId', { autoId: query.autoId });
    if (query.modelId)
      qb.andWhere('model.id = :modelId', { modelId: query.modelId });

    if (query.minPrice !== undefined) {
      qb.andWhere(`${priceColumn} >= :minPrice`, { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere(`${priceColumn} <= :maxPrice`, { maxPrice: query.maxPrice });
    }

    if (query.sortBy === 'price') {
      qb.orderBy(priceColumn, query.sortDir ?? 'DESC');
    } else {
      qb.orderBy('listing.createdAt', query.sortDir ?? 'DESC');
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async getById(id: number) {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: {
        auto: true,
        model: true,
        seller: true,
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async create(sellerId: number, createCarListingDto: CreateCarListingDto) {
    const seller = await this.authService.me(sellerId); // me() вже тягне account
    const accType = seller.account?.type ?? AccountTypeEnum.BASIC;

    if (accType === AccountTypeEnum.BASIC) {
      const count = await this.listingRepository.count({
        where: { seller: { id: sellerId } },
      });
      if (count >= 1) {
        throw new ForbiddenException('BASIC account can create only 1 listing');
      }
    }

    const auto = await this.autoService.getAutoById(createCarListingDto.autoId); // кидає 404 якщо нема

    const model = await this.autoService.getModelByIdWithAuto(
      createCarListingDto.modelId,
    );

    if (model.auto.id !== auto.id) {
      throw new ConflictException('Model does not belong to selected mark');
    }

    const profanityResult = this.profanityCheckerService.checkFields(
      createCarListingDto.title,
      createCarListingDto.description,
    );

    const rate = await this.exchangeRateService.getLatest();
    const rateSide: 'BUY' | 'SALE' = 'SALE';

    const prices = this.priceCalculatorService.recalcAll(
      createCarListingDto.originalCurrency,
      createCarListingDto.originalAmount,
      rate,
      rateSide,
    );

    const isOk = profanityResult.ok;

    const listing = this.listingRepository.create({
      seller,
      auto,
      model,
      year: createCarListingDto.year,
      mileage: createCarListingDto.mileage,
      city: createCarListingDto.city,
      title: createCarListingDto.title,
      description: createCarListingDto.description,

      originalCurrency: createCarListingDto.originalCurrency,
      originalAmount: createCarListingDto.originalAmount.toFixed(2),

      priceUah: prices.priceUah,
      priceUsd: prices.priceUsd,
      priceEur: prices.priceEur,

      currentRateId: rate.id,
      currentRateSide: rateSide,
      recalculatedAt: new Date(),

      status: isOk ? ListingStatusEnum.ACTIVE : ListingStatusEnum.NEEDS_EDIT,
      moderationFails: isOk ? 0 : 1,
      flaggedWords: isOk ? null : profanityResult.matches,

      createdRateId: isOk ? rate.id : null,
      createdRateSide: isOk ? rateSide : null,
    });

    return this.listingRepository.save(listing);
  }

  async updateText(
    sellerId: number,
    listingId: number,
    dto: UpdateListingTextDto,
  ) {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
      relations: { seller: true, auto: true, model: true }, // 👈 треба для листа
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.seller.id !== sellerId)
      throw new ForbiddenException('Not your listing');

    if (listing.status === ListingStatusEnum.INACTIVE) {
      throw new ForbiddenException('Listing is inactive and cannot be edited');
    }

    if (dto.title !== undefined) listing.title = dto.title;
    if (dto.description !== undefined) listing.description = dto.description;

    const profanityResult = this.profanityCheckerService.checkFields(
      listing.title,
      listing.description,
    );

    if (profanityResult.ok) {
      listing.status = ListingStatusEnum.ACTIVE;
      listing.flaggedWords = null;

      if (!listing.createdRateId && listing.currentRateId) {
        listing.createdRateId = listing.currentRateId;
        listing.createdRateSide = listing.currentRateSide ?? 'SALE';
      }
    } else {
      listing.moderationFails = (listing.moderationFails ?? 0) + 1;
      listing.flaggedWords = profanityResult.matches;

      if (listing.moderationFails >= 3) {
        listing.status = ListingStatusEnum.INACTIVE;

        if (listing.moderationFails === 3) {
          const managers = await this.authService.getActiveManagers();

          const listingUrl = `${this.envService.frontendUrl}/listings/${listing.id}`;

          for (const manager of managers) {
            await this.mailerService.sendEmail(
              manager.email,
              EMAIL_TEMPLATES.MANAGER_LISTING_BLOCKED,
              {
                title: 'Лістинг заблоковано',
                year: new Date().getFullYear(),

                listingId: listing.id,
                moderationFails: listing.moderationFails,

                sellerName: `${listing.seller.firstName} ${listing.seller.lastName}`,
                sellerEmail: listing.seller.email,

                autoMark: listing.auto?.mark ?? '-',
                modelName: listing.model?.name ?? '-',
                carYear: listing.year,
                city: listing.city,

                listingTitle: listing.title,
                description: listing.description,

                flaggedWords: (listing.flaggedWords ?? []).join(', '),
                listingUrl,
              },
            );
          }
        }
      } else {
        listing.status = ListingStatusEnum.NEEDS_EDIT;
      }
    }

    return this.listingRepository.save(listing);
  }
}
