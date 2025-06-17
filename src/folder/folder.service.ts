import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FolderService {
  constructor(private readonly prisma: PrismaService) {}

  private async exitingFolderWithSameName(name: string) {
    const exisitngFolderWithSameName = await this.prisma.folder.findFirst({
      where: {
        name,
      },
      select: { id: true },
    });

    return exisitngFolderWithSameName;
  }

  async createFolder(name: string, userId: string) {
    let tempName = name;
    let i = 1;
    while (await this.exitingFolderWithSameName(tempName)) {
      tempName = `${name} (${i})`;
      i++;
    }
    const newFolder = await this.prisma.folder.create({
      data: { name: tempName, userId },
    });
    return newFolder;
  }

  async getFolders(userId: string, limit?: number, folderId?: number) {
    const query: any = {
      where: {
        userId,
        folderId: folderId || undefined,
      },
      orderBy: { updatedAt: 'desc' },
    };

    if (limit) {
      query.take = limit;
    }

    const folders = await this.prisma.folder.findMany(query);
    return folders;
  }

  async deleteFolder(id: number, userId: string) {
    const folder = await this.prisma.folder.delete({
      where: {
        id,
        userId,
      },
    });
    return folder;
  }

  async updateFolder(id: number, name: string, userId: string) {
    const folder = await this.prisma.folder.update({
      where: {
        id,
        userId,
      },
      data: {
        name,
      },
    });
    return folder;
  }

  async getFolderById(id: number, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: {
        id,
        userId,
      },
    });
    return folder;
  }
}
