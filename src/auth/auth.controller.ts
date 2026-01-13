import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UserRoleEnum } from '../constants/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register-user')
  async registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto, UserRoleEnum.USER);
  }

  @Public()
  @Post('register-seller')
  async registerSeller(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto, UserRoleEnum.SELLER);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Post('register-manager')
  async registerManager(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto, UserRoleEnum.MANAGER);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Public()
  @Post('activate')
  async activate(
    @Query('token') token: string,
    @Body() activateTokenDto: ActivateAccountDto,
  ) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    if (activateTokenDto.password !== activateTokenDto.confirmPassword) {
      throw new BadRequestException('Password do not match');
    }

    await this.authService.activate(token, activateTokenDto.password);
  }

  @Get('me')
  async me(@CurrentUser() user: User) {
    return await this.authService.me(user.id);
  }
}
