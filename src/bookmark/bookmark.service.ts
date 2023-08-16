import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface IBookmark {
  title: string;
  description?: string;
  link: string;
  userId: number;
}

@Injectable()
export class BookmarkService {
  constructor(private readonly prismaService: PrismaService) {}

  async addBookmark(body: IBookmark) {
    return await this.prismaService.bookmark.create({
      data: body,
    });
  }

  async getAllBookmarks(userId: number) {
    return await this.prismaService.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarkById(id: number) {
    const result = await this.prismaService.bookmark.findUnique({
      where: {
        id,
      },
    });
    if (!result) {
      throw new BadRequestException('Bookmark not found');
    }
    return result;
  }

  async updateBookmarkById(id: number, body: Partial<IBookmark>) {
    try {
      await this.prismaService.bookmark.update({
        where: {
          id,
        },
        data: body,
      });
      return { message: 'Bookmark updated' };
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new BadRequestException('Bookmark not found');
      }
      throw err;
    }
  }

  async deleteBookmarkById(id: number) {
    try {
      await this.prismaService.bookmark.delete({
        where: {
          id,
        },
      });
      return { message: 'Bookmark deleted' };
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new BadRequestException('Bookmark not found');
      }
      throw err;
    }
  }
}
