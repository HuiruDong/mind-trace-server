import { Injectable, NotFoundException } from '@nestjs/common';
import { Mood } from '../../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';
import { MoodGroupService } from './mood-group.service';

@Injectable()
export class MoodService {
  constructor(
    private prisma: PrismaService,
    private moodGroupService: MoodGroupService, // 注入 MoodGroupService，用来检查分组是否存在
  ) {}

  // 获取所有心情（可选按 groupId 过滤）
  // 类比前端：列表页，可选一个筛选条件
  getAllMoods(groupId?: number): Promise<Mood[]> {
    return this.prisma.mood.findMany({
      where: groupId ? { groupId } : undefined, // 有 groupId 就过滤，没有就查全部
    });
  }

  // 创建心情
  // 关联 MoodGroup 的关键就是传 groupId，Prisma 会自动处理外键
  async createMood(dto: CreateMoodDto): Promise<Mood> {
    // 先检查分组是否存在，不存在则 404
    await this.moodGroupService.ensureGroupExists(dto.groupId);
    return this.prisma.mood.create({
      data: {
        title: dto.title,
        groupId: dto.groupId, // ← 就这一个字段，完成了和 MoodGroup 的关联
      },
    });
  }

  // 更新心情
  async updateMood(id: number, dto: UpdateMoodDto): Promise<Mood> {
    await this.ensureMoodExists(id);
    // 如果传了 groupId，也要检查新分组是否存在
    if (dto.groupId) {
      await this.moodGroupService.ensureGroupExists(dto.groupId);
    }
    return this.prisma.mood.update({
      where: { id },
      data: dto,
    });
  }

  // 删除心情
  async deleteMood(id: number): Promise<Mood> {
    await this.ensureMoodExists(id);
    return this.prisma.mood.delete({ where: { id } });
  }

  // 检查心情是否存在
  private async ensureMoodExists(id: number): Promise<void> {
    const mood = await this.prisma.mood.findUnique({ where: { id } });
    if (!mood) {
      throw new NotFoundException(`心情 id=${id} 不存在`);
    }
  }
}
