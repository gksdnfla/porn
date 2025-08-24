import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import type { CreateCategoryDto, UpdateCategoryDto } from './category.service';
import { AdminGuard } from '../auth/guards/auth.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // 모든 카테고리 조회 (계층 구조 포함) - 공개 API
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  // 최상위 카테고리만 조회 - 공개 API
  @Get('root')
  findRootCategories() {
    return this.categoryService.findRootCategories();
  }

  // 특정 카테고리의 하위 카테고리 조회 - 공개 API
  @Get(':id/children')
  findChildren(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findChildren(id);
  }

  // ID로 카테고리 조회 - 공개 API
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  // 카테고리 경로 조회 - 공개 API
  @Get(':id/path')
  getCategoryPath(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getCategoryPath(id);
  }

  // 카테고리 생성 (관리자 전용)
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // 카테고리 업데이트 (관리자 전용)
  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  // 카테고리 삭제 (관리자 전용)
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
