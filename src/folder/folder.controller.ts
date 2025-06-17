import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post('create')
  @UseGuards(AuthGuard('clerk'))
  async createFolder(@Body('name') name: string, @Request() req: any) {
    return this.folderService.createFolder(name, req.user.id);
  }

  @Get('get-all')
  @UseGuards(AuthGuard('clerk'))
  async getFolders(
    @Request() req: any,
    @Query('folder') folder?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    const folderId = folder ? parseInt(folder, 10) : undefined;
    return this.folderService.getFolders(req.user.id, limitNumber, folderId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('clerk'))
  async deleteFolder(@Param('id') id: number, @Request() req: any) {
    return this.folderService.deleteFolder(id, req.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('clerk'))
  async updateFolder(
    @Param('id') id: number,
    @Body('name') name: string,
    @Request() req: any,
  ) {
    return this.folderService.updateFolder(id, name, req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('clerk'))
  async getFolderById(@Param('id') id: number, @Request() req: any) {
    return this.folderService.getFolderById(id, req.user.id);
  }
}
