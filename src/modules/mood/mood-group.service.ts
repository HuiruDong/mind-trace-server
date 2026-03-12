import { Injectable, NotFoundException } from '@nestjs/common';
import { MoodGroup } from '../../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMoodGroupDto } from './dto/create-mood-group.dto';
import { UpdateMoodGroupDto } from './dto/update-mood-group.dto';

@Injectable()
export class MoodGroupService {
  constructor(private prisma: PrismaService) {}

  // 获取全部 mood 分组（含下属 moods）
  // findMany() = SELECT * FROM MoodGroup，不传条件就是查全部
  // include: { moods: true } = 同时查出每个分组关联的心情列表（类似 LEFT JOIN）
  getAllMoodGroups(): Promise<MoodGroup[]> {
    return this.prisma.moodGroup.findMany({ include: { moods: true } });
  }

  // 创建分组
  // create({ data }) = INSERT INTO MoodGroup (name) VALUES ('xxx')
  createMoodGroup(dto: CreateMoodGroupDto): Promise<MoodGroup> {
    return this.prisma.moodGroup.create({ data: { name: dto.name } });
  }

  // 更新分组
  // 先查 id 是否存在，不存在直接返回 404（而不是让数据库报错）
  async updateMoodGroup(id: number, dto: UpdateMoodGroupDto): Promise<MoodGroup> {
    await this.ensureGroupExists(id);
    return this.prisma.moodGroup.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  // 删除分组
  // 注意：如果该分组下还有 mood，数据库外键约束会阻止删除
  async deleteMoodGroup(id: number): Promise<MoodGroup> {
    await this.ensureGroupExists(id);
    return this.prisma.moodGroup.delete({ where: { id } });
  }

  // 检查分组是否存在，不存在则抛出 404
  // findUnique = SELECT * FROM MoodGroup WHERE id = ? LIMIT 1
  // 改为 public，因为 MoodService 创建心情时也需要检查分组是否存在
  async ensureGroupExists(id: number): Promise<void> {
    const group = await this.prisma.moodGroup.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException(`分组 id=${id} 不存在`);
    }
  }
}
