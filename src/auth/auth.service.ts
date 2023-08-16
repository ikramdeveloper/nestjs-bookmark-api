import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

interface IUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface ILogin {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async createToken(user: number, email: string) {
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwtService.signAsync(
      { sub: user, email },
      {
        secret,
      },
    );
    return token;
  }

  async addUser(body: IUser) {
    try {
      const hashedPassword = await argon.hash(body.password);
      await this.prismaService.user.create({
        data: { ...body, password: hashedPassword },
      });
      return { message: 'Registered successfully' };
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  async login(body: ILogin) {
    const { email, password } = body;
    const isUserFound = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!isUserFound || !(await argon.verify(isUserFound.password, password))) {
      throw new BadRequestException('Invalid credentials');
    }
    delete isUserFound.password;
    const token = await this.createToken(isUserFound.id, email);
    return { user: isUserFound, token };
  }
}
