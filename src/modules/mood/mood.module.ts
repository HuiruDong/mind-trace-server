import { Module } from '@nestjs/common';
import { MoodService } from './mood.service';
import { MoodController } from './mood.controller';
import { MoodGroupController } from './mood-group.controller';
import { MoodGroupService } from './mood-group.service';

@Module({
  controllers: [MoodController, MoodGroupController],
  providers: [MoodService, MoodGroupService],
})
export class MoodModule {}
