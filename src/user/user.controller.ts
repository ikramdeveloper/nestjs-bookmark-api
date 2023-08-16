import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { User } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { UpdateUserDto, UserResponseDto } from './dtos';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@User() user: PrismaUser): Promise<UserResponseDto> {
    return new UserResponseDto(user);
  }

  @Patch('profile')
  async updateProfile(@User() user: PrismaUser, @Body() body: UpdateUserDto) {
    return await this.userService.updateUserById(user.id, body);
  }
}
