import { LoginDto } from './dto/login.dto';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register({ name, email, password }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException('Email already in use');
    }
    return this.usersService.create({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    });
    return Object.fromEntries(
      Object.entries(newUser).filter(([key]) => key !== 'password'),
    );
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email is wrong');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Password is wrong');
    }
    const payload = {
      sub: user.id,
      name: user.name,
      role: user.role,
    };
    return { access_token: await this.jwt.signAsync(payload), user: user.name };
  }
}
