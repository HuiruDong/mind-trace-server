import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MoodModule } from './modules/mood/mood.module';

@Module({
  imports: [PrismaModule, MoodModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
