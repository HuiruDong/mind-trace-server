import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { MoodGroupService } from './mood-group.service';
import { CreateMoodGroupDto } from './dto/create-mood-group.dto';
import { UpdateMoodGroupDto } from './dto/update-mood-group.dto';

@Controller('mood-group')
export class MoodGroupController {
  constructor(private readonly moodGroupService: MoodGroupService) {}

  // 获取所有分组（含下属 moods）
  // 【关于 await】NestJS 会自动处理返回的 Promise，所以：
  //   - 单个查询直接返回 → 不需要 await，直接 return Promise
  //   - 多个查询要组装 → 需要 await，拿到各个结果后再拼装
  //   - 单个查询但要加工 → 需要 await，拿到结果后再处理
  @Get()
  getAllMoodGroups() {
    return this.moodGroupService.getAllMoodGroups();
  }

  // 创建分组
  @Post()
  createMoodGroup(@Body() dto: CreateMoodGroupDto) {
    return this.moodGroupService.createMoodGroup(dto);
  }

  // 更新分组
  // ParseIntPipe：把 URL 中的字符串 '1' 转成数字 1（URL 参数默认都是字符串）
  @Put(':id')
  updateMoodGroup(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMoodGroupDto) {
    return this.moodGroupService.updateMoodGroup(id, dto);
  }

  // 删除分组
  @Delete(':id')
  deleteMoodGroup(@Param('id', ParseIntPipe) id: number) {
    return this.moodGroupService.deleteMoodGroup(id);
  }
}
