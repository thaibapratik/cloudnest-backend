import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { FileModule } from './file/file.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FolderModule } from './folder/folder.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './file/scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    FileModule,
    UserModule,
    FolderModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, SchedulerService],
})
export class AppModule {}
