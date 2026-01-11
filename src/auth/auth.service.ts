import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '../shared/services/env.service';
import { MailerService } from '../mailer/mailer.service';
import { RegisterDto } from './dto/register.dto';
import { UserRoleEnum } from '../constants/user-role.enum';
import { EMAIL_TEMPLATES } from '../constants/email.templates';
import { LoginDto } from './dto/login.dto';
import { ITokens } from './interfaces/tokens.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { IActivationTokenPayload } from './types/actIvation-token-payload';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: number;
  private readonly refreshTokenExpiresIn: number;
  private readonly activateTokenExpiresIn: number;
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
    private readonly mailerService: MailerService,
  ) {
    this.accessTokenExpiresIn = Number(envService.jwtAccessTokenExpireTime);
    this.refreshTokenExpiresIn = Number(envService.jwtRefreshTokenExpireTime);
    this.activateTokenExpiresIn = Number(envService.jwtActivateTokenExpireTime);
    this.frontendUrl = envService.frontendUrl;
  }

  async register(
    registerDto: RegisterDto,
    userRole: UserRoleEnum,
  ): Promise<User> {
    const existsUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existsUser) {
      throw new ConflictException('User with this email is already exists');
    }

    const user = this.userRepository.create({
      ...registerDto,
      role: userRole,
      isActive: false,
      isBlocked: false,
    });

    const savedUser = await this.userRepository.save(user);

    const activationToken = this.jwtService.sign(
      {
        sub: savedUser.id,
        email: savedUser.email,
        type: 'activation',
      },
      { expiresIn: this.activateTokenExpiresIn },
    );

    const activationLink = `${this.frontendUrl}/activate?token=${activationToken}`;

    await this.mailerService.sendEmail(
      savedUser.email,
      EMAIL_TEMPLATES.ACTIVATION,
      {
        title: 'Account Activation',
        year: new Date().getFullYear(),
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        activationLink,
      },
    );

    return savedUser;
  }

  async login(loginDto: LoginDto): Promise<ITokens> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const jti = this.generateJti();
    const payload = { userId: user.id, email: loginDto.email, jti: jti };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.refreshTokenExpiresIn,
    });

    await this.saveTokens(
      user,
      accessToken,
      refreshToken,
      this.accessTokenExpiresIn,
      this.refreshTokenExpiresIn,
      jti,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    const { refreshToken } = refreshTokenDto;
    const tokenEntity = await this.tokenRepository.findOne({
      where: {
        refreshToken,
        isBlocked: false,
      },
    });

    if (tokenEntity) {
      tokenEntity.isBlocked = true;
      await this.tokenRepository.save(tokenEntity);
    }
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<ITokens> {
    const { refreshToken } = refreshTokenDto;
    try {
      const tokenEntity = await this.tokenRepository.findOne({
        where: { refreshToken, isBlocked: false },
        relations: ['user'],
      });

      if (!tokenEntity || tokenEntity.refreshTokenExpiresAt < new Date()) {
        throw new ConflictException('Invalid or expired refresh token');
      }

      if (!tokenEntity.user.isActive || tokenEntity.user.isBlocked) {
        throw new UnauthorizedException('User is not allowed to refresh token');
      }

      tokenEntity.isBlocked = true;
      await this.tokenRepository.save(tokenEntity);

      const jti = this.generateJti();
      const payload = {
        userId: tokenEntity.user.id,
        email: tokenEntity.user.email,
        jti,
      };

      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: this.accessTokenExpiresIn,
      });
      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: this.refreshTokenExpiresIn,
      });

      await this.saveTokens(
        tokenEntity.user,
        newAccessToken,
        newRefreshToken,
        this.accessTokenExpiresIn,
        this.refreshTokenExpiresIn,
        jti,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('User is not active');
    if (user.isBlocked) throw new UnauthorizedException('User is blocked');

    const ok = await user.validatePassword(password);

    if (!ok) throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  private async saveTokens(
    user: User,
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
    jti: string,
  ): Promise<void> {
    const tokenEntity = this.tokenRepository.create({
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + accessTokenExpiresIn * 1000),
      refreshTokenExpiresAt: new Date(
        Date.now() + refreshTokenExpiresIn * 1000,
      ),
      user,
      jti,
    });
    await this.tokenRepository.save(tokenEntity);
  }

  async activate(token: string, password: string): Promise<void> {
    let payload: IActivationTokenPayload;

    try {
      payload = this.jwtService.verify<IActivationTokenPayload>(token, {
        secret: this.envService.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid activation token');
    }

    if (payload.type !== 'activation' || !payload.sub) {
      throw new ConflictException('Invalid activation token');
    }

    const user = await this.userRepository.findOneBy({ id: payload.sub });

    if (!user) {
      throw new ConflictException('User not found');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('User is blocked');
    }

    if (user.isActive) {
      return;
    }

    user.password = password;
    user.isActive = true;

    await this.userRepository.save(user);
  }

  private generateJti(): string {
    return Math.random().toString(36).slice(2);
  }
}
