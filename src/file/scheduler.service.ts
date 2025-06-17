import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly prisma: PrismaService) {
    console.log('Scheduler');
  }

  @Cron('0 0 * * *')
  async permanentDeletion() {
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const files = await this.prisma.files.findMany({
        where: { deletedAt: { lt: cutoff } },
      });

      for (const file of files) {
        const deleteMedia = await axios.delete(
          'https://api.imagekit.io/v1/files/' + file.imagekitFileId,
          {
            auth: {
              username: process.env.IMAGEKIT_PRIVATE_KEY!,
              password: '',
            },
          },
        );
      }

      const result = await this.prisma.files.deleteMany({
        where: { deletedAt: { lt: cutoff } },
      });
    } catch (error) {
      console.error('Error in permanent deletion job:', error);
    }
  }
}
