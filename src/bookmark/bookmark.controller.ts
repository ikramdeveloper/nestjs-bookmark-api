import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { User } from '../auth/decorators';
import { AddBookmarkDto, UpdateBookmarkDto } from './dtos';
import { JwtGuard } from '../auth/guards';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  async getUserBookmarks(@User('id') user: { id: number }) {
    return await this.bookmarkService.getAllBookmarks(user.id);
  }

  @Get(':id')
  async getBookmarkById(@Param('id', ParseIntPipe) id: number) {
    return await this.bookmarkService.getBookmarkById(Number(id));
  }

  @Post()
  async addBookmark(
    @Body() body: AddBookmarkDto,
    @User('id') user: { id: number },
  ) {
    return await this.bookmarkService.addBookmark({ ...body, userId: user.id });
  }

  @Patch(':id')
  async updateBookmarkById(
    @Param('id') id: ParseIntPipe,
    @Body() body: UpdateBookmarkDto,
  ) {
    return await this.bookmarkService.updateBookmarkById(Number(id), body);
  }

  @Delete(':id')
  async deleteBookmarkById(@Param('id') id: ParseIntPipe) {
    return await this.bookmarkService.deleteBookmarkById(Number(id));
  }
}
