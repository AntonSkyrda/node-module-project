import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EnvService } from '../shared/services/env.service';
import { DataSource } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserRoleEnum } from '../constants/user-role.enum';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const envService = app.get(EnvService);
    const dataSource = app.get(DataSource);

    const email = envService.adminEmail;
    const password = envService.adminPassword;
    const firstName = envService.adminFirstName ?? 'System';
    const lastName = envService.adminLastName ?? 'Admin';

    if (!email || !password) {
      throw new Error('Admin credentials are not set in EnvService');
    }

    const userRepository = dataSource.getRepository(User);

    const existing = await userRepository.findOne({
      where: { email },
    });

    if (existing) {
      console.log(`Admin already exists: ${email}`);
      return;
    }

    const admin = userRepository.create({
      email,
      password,
      firstName,
      lastName,
      role: UserRoleEnum.ADMIN,
      isActive: true,
      isBlocked: false,
    });

    await userRepository.save(admin);

    console.log(`Admin created: ${email}`);
  } catch (error) {
    console.error('Failed to create admin:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
})();
