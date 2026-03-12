import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 创建心情分组的 DTO
 * 只需要传 name，id 是自增的，moods 是之后单独创建再关联的
 */
export class CreateMoodGroupDto {
  @IsString({ message: 'name 必须是字符串' })
  @IsNotEmpty({ message: 'name 不能为空' })
  @MaxLength(50, { message: 'name 最长50个字符' }) // 跟 schema.prisma 中 @db.VarChar(50) 保持一致
  name: string;
}
