import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService, Total } from './file.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseGuards(AuthGuard('clerk'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Body() body: any,
  ) {
    const folderId = body.folderId ? parseInt(body.folderId, 10) : undefined;
    return this.fileService.uploadFile(file, req.user.id, folderId);
  }

  @Get('list')
  @UseGuards(AuthGuard('clerk'))
  async getFiles(@Request() req: any) {
    return this.fileService.getFiles(req.user.id);
  }

  @Get('favorites')
  @UseGuards(AuthGuard('clerk'))
  async getFavorites(@Request() req: any) {
    return this.fileService.getFavoriteFiles(req.user.id);
  }

  @Get('get-all-by-type')
  @UseGuards(AuthGuard('clerk'))
  async getAllByType(
    @Request() req: any,
  ): Promise<{ files: any; count: Total; totalSize: Total }> {
    return this.fileService.getAllFilesByType(req.user.id);
  }

  @Get('trash')
  @UseGuards(AuthGuard('clerk'))
  async getTrashFiles(@Request() req: any) {
    return this.fileService.getTrashedFiles(req.user.id);
  }

  @Get('/folder/:folderId')
  @UseGuards(AuthGuard('clerk'))
  async getFilesByFolderId(
    @Request() req: any,
    @Param('folderId') folderId?: string,
  ) {
    const folderIdNum = folderId ? parseInt(folderId) : null;
    return this.fileService.getFilesByFolderId(req.user.id, folderIdNum);
  }

  @Get(':id')
  @UseGuards(AuthGuard('clerk'))
  async getFile(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.fileService.getFile(req.user.id, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('clerk'))
  async updateFile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.fileService.updateFile(id, body, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('clerk'))
  async deleteFile(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.fileService.deleteFile(id, req.user.id);
  }
}
