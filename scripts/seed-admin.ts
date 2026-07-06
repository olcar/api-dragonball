import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx ts-node scripts/seed-admin.ts <email>');
    console.error('Promotes the user with the given email to admin role.');
    await app.close();
    process.exit(1);
  }

  const user = await usersService.findOneByEmail(email);
  if (!user) {
    console.error(`User with email "${email}" not found.`);
    await app.close();
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`User "${user.name}" (${email}) is already an admin.`);
    await app.close();
    return;
  }

  await usersService.update(user.id, { role: 'admin' });
  console.log(`User "${user.name}" (${email}) promoted to admin.`);
  await app.close();
}

bootstrap();
