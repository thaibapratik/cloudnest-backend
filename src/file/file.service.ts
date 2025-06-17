import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export interface Total {
  image: number;
  video: number;
  audio: number;
  document: number;
  other: number;
}

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    folderId?: number,
  ) {
    try {
      if (folderId) {
        const folder = await this.prisma.folder.findFirst({
          where: {
            id: folderId,
            isDeleted: false,
          },
          select: { name: true },
        });

        if (!folder) throw new BadRequestException('Folder not found');
      }

      // Upload file to ImageKit
      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
      });

      // Create file record in database
      const newFile = await this.prisma.files.create({
        data: {
          name: file.originalname,
          fileUrl: uploadResponse.url,
          type: file.mimetype,
          size: file.size,
          userId,
          path: folderId
            ? `${folderId}/${uploadResponse.name}`
            : `/${uploadResponse.name}`,
          thumbnailUrl: uploadResponse.thumbnailUrl || '',
          folderId: folderId ?? null,
          isLiked: false,
          isDeleted: false,
          imagekitFileId: uploadResponse.fileId,
        },
      });

      return { file: newFile };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Log the error for debugging
      console.error('File upload error:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getFiles(userId: string) {
    try {
      const files = await this.prisma.files.findMany({
        where: {
          userId,
          isDeleted: false,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return { files };
    } catch (error) {
      console.error('Error fetching files:', error);
      throw new InternalServerErrorException('Failed to fetch files');
    }
  }

  async getAllFilesByType(userId: string) {
    const types = ['image', 'video', 'audio', 'document', 'other'];
    let allFiles = {};

    let count: Total = {
      image: 0,
      video: 0,
      audio: 0,
      document: 0,
      other: 0,
    };

    let totalSize: Total = {
      image: 0,
      video: 0,
      audio: 0,
      document: 0,
      other: 0,
    };

    try {
      for (const type of types) {
        const files = await this.prisma.files.findMany({
          where: {
            userId,
            isDeleted: false,
            type: {
              contains: type,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        allFiles[type] = files;
        count[type] = files.length;
        totalSize[type] = files.reduce((acc, file) => acc + file.size, 0);
      }

      return { files: allFiles, count, totalSize };
    } catch (error) {
      console.error('Error fetching files:', error);
      throw new InternalServerErrorException('Failed to fetch files');
    }
  }

  async getFilesByFolderId(userId: string, folderId?: number | null) {
    const files = await this.prisma.files.findMany({
      where: {
        userId,
        folderId: folderId ?? null,
        isDeleted: false,
      },
    });

    return files;
  }

  async deleteFile(id: number, userId: string) {
    const file = await this.prisma.files.findFirst({
      where: { id, userId },
    });

    if (!file) throw new BadRequestException('File not found');

    const deleteMedia = await axios.delete(
      'https://api.imagekit.io/v1/files/' + file.imagekitFileId,
      {
        auth: {
          username: process.env.IMAGEKIT_PRIVATE_KEY!,
          password: '',
        },
      },
    );

    if (!deleteMedia) {
      throw new InternalServerErrorException(
        'Failed to delete media from imagekit.io',
      );
    }

    const deleteFile = await this.prisma.files.delete({
      where: {
        id,
      },
    });

    return deleteFile;
  }

  async softDeleteFile(id: number, userId: string) {
    const file = await this.prisma.files.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!file) throw new BadRequestException('File not found');

    const deleteFile = await this.prisma.files.update({
      where: {
        id,
        userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async updateFile(id: number, data: any, userId: string) {
    const file = await this.prisma.files.update({
      where: {
        id,
        userId,
      },
      data: {
        ...data,
      },
    });

    return file;
  }

  async getFile(userId: string, id: number) {
    const file = await this.prisma.files.findFirst({
      where: {
        userId,
        id,
      },
    });
    return file;
  }

  async getFavoriteFiles(userId: string) {
    try {
      const files = await this.prisma.files.findMany({
        where: {
          userId,
          isLiked: true,
        },
      });
      return { files };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to fetch favorite files');
    }
  }

  async getTrashedFiles(userId: string) {
    try {
      const files = await this.prisma.files.findMany({
        where: {
          userId,
          isDeleted: true,
        },
      });

      return files;
    } catch (error) {
      console.log(error);
    }
  }
}
