import { Controller, Get, Post, Body, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { MoodService } from './mood.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';

@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  // 获取所有心情
  // ?groupId=1 → 只查该分组下的心情；不传 → 查全部
  // Query 装饰器 = 获取 URL 中 ? 后面的参数（跟前端 useSearchParams 一样）
  @Get()
  getAllMoods(@Query('groupId') groupId?: string) {
    return this.moodService.getAllMoods(groupId ? +groupId : undefined);
  }

  // 创建心情（需要传 title + groupId）
  @Post()
  createMood(@Body() dto: CreateMoodDto) {
    return this.moodService.createMood(dto);
  }

  // 更新心情
  @Put(':id')
  updateMood(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMoodDto) {
    return this.moodService.updateMood(id, dto);
  }

  // 删除心情
  @Delete(':id')
  deleteMood(@Param('id', ParseIntPipe) id: number) {
    return this.moodService.deleteMood(id);
  }
}
