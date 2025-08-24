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
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ContentService } from './content.service';
import type { CreateContentDto, UpdateContentDto, ContentFilterDto } from './content.service';
import { AdminGuard } from '../auth/guards/auth.guard';
import { PaginationDto } from '../user/dto/pagination.dto';

@Controller('admin/contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // 분페이징 콘텐츠 조회 (관리자 전용)
  @Get()
  findAllWithPagination(@Query() filterDto: ContentFilterDto) {
    return this.contentService.findAllWithPagination(filterDto);
  }

  // ID로 콘텐츠 조회 (관리자 전용)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.findOne(id);
  }

  // 콘텐츠 생성 (관리자 전용)
  @Post()
  @UseGuards(AdminGuard) // 전체 컨트롤러에 관리자 권한 필요
  create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.create(createContentDto);
  }

  // 콘텐츠 업데이트 (관리자 전용)
  @Patch(':id')
  @UseGuards(AdminGuard) // 전체 컨트롤러에 관리자 권한 필요
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    return this.contentService.update(id, updateContentDto);
  }

  // 콘텐츠 삭제 (관리자 전용)
  @Delete(':id')
  @UseGuards(AdminGuard) // 전체 컨트롤러에 관리자 권한 필요
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.remove(id);
  }

  // 썸네일 업로드 (관리자 전용)
  @Post('upload/thumbnail')
  @UseGuards(AdminGuard) // 전체 컨트롤러에 관리자 권한 필요
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB 제한
    },
    fileFilter: (req, file, callback) => {
      // 이미지 파일만 허용
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('이미지 파일만 업로드 가능합니다'), false);
      }
      callback(null, true);
    },
  }))
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다');
    }

    try {
      const uploadResult = await this.contentService.uploadThumbnailToBunny(file);
      return {
        message: '썸네일 업로드 성공',
        data: {
          url: uploadResult.url,
          filename: uploadResult.filename,
          size: file.size,
          mimetype: file.mimetype,
        },
      };
    } catch (error) {
      throw new BadRequestException(`썸네일 업로드 실패: ${error.message}`);
    }
  }

  // 비디오 업로드 (관리자 전용)
  @Post('upload/video')
  @UseGuards(AdminGuard) // 전체 컨트롤러에 관리자 권한 필요
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      // 비디오 파일만 허용
      if (!file.mimetype.match(/\/(mp4|avi|mov|wmv|flv|webm|mkv)$/)) {
        return callback(new BadRequestException('비디오 파일만 업로드 가능합니다'), false);
      }
      callback(null, true);
    },
  }))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다');
    }

    try {
      const uploadResult = await this.contentService.uploadVideoToBunny(file);
      return {
        message: '비디오 업로드 성공',
        data: {
          url: uploadResult.url,
          guid: uploadResult.guid,
          size: file.size,
          mimetype: file.mimetype,
          duration: uploadResult.duration || null,
        },
      };
    } catch (error) {
      throw new BadRequestException(`비디오 업로드 실패: ${error.message}`);
    }
  }

  // 콘텐츠 통계 조회 (관리자 전용)
  @Get('stats')
  @UseGuards(AdminGuard) // 전체 컨트롤러에 관리자 권한 필요
  getStats() {
    return this.contentService.getStats();
  }

  // 인기 콘텐츠 토글 (관리자 전용)
  @Patch(':id/toggle-popular')
  @UseGuards(AdminGuard) // 전체 컨트롤러에 관리자 권한 필요
  togglePopular(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.togglePopular(id);
  }

  // 콘텐츠 노출 토글 (관리자 전용)
  @Patch(':id/toggle-visibility')
  @UseGuards(AdminGuard) // 전체 컨트롤러에 관리자 권한 필요
  toggleVisibility(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.toggleVisibility(id);
  }

  // Bunny Storage에서 파일 삭제 (관리자 전용)
  @Delete('files/:filename')
  @UseGuards(AdminGuard)
  async deleteFile(@Param('filename') filename: string) {
    try {
      // URL 디코딩 처리 (파일명에 / 가 포함된 경우)
      const decodedFilename = decodeURIComponent(filename);
      
      await this.contentService.deleteFileFromBunny(decodedFilename);
      
      return {
        message: '파일 삭제 성공',
        filename: decodedFilename,
      };
    } catch (error) {
      throw new BadRequestException(`파일 삭제 실패: ${error.message}`);
    }
  }
  
  // Bunny Stream에서 파일 삭제 (관리자 전용)
  @Delete('video/:guid')
  @UseGuards(AdminGuard)
  async deleteVideo(@Param('guid') guid: string) {
    try {
      // URL 디코딩 처리 (파일명에 / 가 포함된 경우)
      const decodedFilename = decodeURIComponent(guid);
      
      await this.contentService.deleteVideoFromBunny(decodedFilename);
      
      return {
        message: '파일 삭제 성공',
        filename: decodedFilename,
      };
    } catch (error) {
      throw new BadRequestException(`파일 삭제 실패: ${error.message}`);
    }
  }

}
