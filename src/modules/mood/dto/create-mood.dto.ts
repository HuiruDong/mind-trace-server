import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 创建心情的 DTO
 * 前端需要传：title（心情名称）+ groupId（所属分组 id）
 * 类比前端表单：一个输入框 + 一个下拉选择框
 */
export class CreateMoodDto {
  @IsString({ message: 'title 必须是字符串' })
  @IsNotEmpty({ message: 'title 不能为空' })
  @MaxLength(50, { message: 'title 最长50个字符' })
  title: string;

  @IsInt({ message: 'groupId 必须是整数' })
  @IsNotEmpty({ message: 'groupId 不能为空' })
  groupId: number;
}
