import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 번호는 정수여야 합니다' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 크기는 정수여야 합니다' })
  @Min(1, { message: '페이지 크기는 1 이상이어야 합니다' })
  @Max(100, { message: '페이지 크기는 100 이하여야 합니다' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: '검색어는 문자열이어야 합니다' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString({ message: '정렬 필드는 문자열이어야 합니다' })
  sortBy?: string = 'id';

  @IsOptional()
  @IsString({ message: '정렬 순서는 문자열이어야 합니다' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
