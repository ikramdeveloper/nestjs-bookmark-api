import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserById(id: number) {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async updateUserById(id: number, body: Partial<User>) {
    try {
      await this.prismaService.user.update({
        where: {
          id,
        },
        data: body,
      });
      return { message: 'User updated' };
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new BadRequestException('User not found');
      }
      throw err;
    }
  }
}
