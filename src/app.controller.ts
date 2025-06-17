import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-auth')
  @UseGuards(AuthGuard('clerk'))
  getTest(@Request() req) {
    return {
      userId: req.user.id,
    };
  }

  @Get('test-prisma')
  async testPrisma2() {
    const folder = await this.prisma.folder.findMany();
    return folder;
  }
}
