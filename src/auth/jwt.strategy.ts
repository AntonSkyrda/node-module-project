import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { EnvService } from '../shared/services/env.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { IJWTPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly envService: EnvService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envService.jwtSecret,
    });
  }

  async validate(payload: IJWTPayload): Promise<User> {
    const tokenEntity = await this.tokenRepository.findOne({
      where: {
        jti: payload.jti,
        isBlocked: false,
      },
      relations: ['user'],
    });

    if (!tokenEntity || tokenEntity.user.isBlocked) {
      throw new UnauthorizedException('Token is blocked or invalid');
    }

    return tokenEntity.user;
  }
}
