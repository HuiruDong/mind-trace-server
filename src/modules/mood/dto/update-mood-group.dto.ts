import { PartialType } from '@nestjs/mapped-types';
import { CreateMoodGroupDto } from './create-mood-group.dto';

/**
 * 更新心情分组的 DTO
 * PartialType 会把 CreateMoodGroupDto 的所有字段变成可选（加上 ?）
 * 等价于：{ name?: string }，校验装饰器也会自动继承
 * 这样更新时可以只传想改的字段，不用全部传
 */
export class UpdateMoodGroupDto extends PartialType(CreateMoodGroupDto) {}
