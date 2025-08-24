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
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdvertisementService } from './advertisement.service';
import type { CreateAdvertisementDto, UpdateAdvertisementDto } from './advertisement.service';
import { AdminGuard } from '../auth/guards/auth.guard';

@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  // 모든 광고 조회 (공개 API)
  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.advertisementService.findAll();
  }

  // 활성 광고만 조회 (공개 API)
  @Get('active')
  findActive() {
    return this.advertisementService.findActive();
  }

  // 특정 광고 조회 (공개 API)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const advertisement = await this.advertisementService.findOne(id);
    if (!advertisement) {
      throw new NotFoundException('광고를 찾을 수 없습니다.');
    }
    return advertisement;
  }

  // 광고 생성 (관리자 전용)
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createAdvertisementDto: CreateAdvertisementDto) {
    return this.advertisementService.create(createAdvertisementDto);
  }

  // 광고 수정 (관리자 전용)
  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
  ) {
    const [affectedCount, updatedAds] = await this.advertisementService.update(
      id,
      updateAdvertisementDto,
    );

    if (affectedCount === 0) {
      throw new NotFoundException('광고를 찾을 수 없습니다.');
    }

    return {
      message: '광고가 성공적으로 수정되었습니다.',
      data: updatedAds[0],
    };
  }

  // 광고 삭제 (관리자 전용)
  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.advertisementService.remove(id);

    if (!result) {
      throw new NotFoundException('광고를 찾을 수 없습니다.');
    }

    return {
      message: '광고가 성공적으로 삭제되었습니다.',
    };
  }

  // 클릭 수 증가 (공개 API)
  @Post(':id/click')
  async incrementClick(@Param('id', ParseIntPipe) id: number) {
    const advertisement = await this.advertisementService.findOne(id);
    if (!advertisement) {
      throw new NotFoundException('광고를 찾을 수 없습니다.');
    }

    await this.advertisementService.incrementClickCount(id);
    
    return {
      message: '클릭이 기록되었습니다.',
    };
  }

  // 노출 수 증가 (공개 API)
  @Post(':id/impression')
  async incrementImpression(@Param('id', ParseIntPipe) id: number) {
    const advertisement = await this.advertisementService.findOne(id);
    if (!advertisement) {
      throw new NotFoundException('광고를 찾을 수 없습니다.');
    }

    await this.advertisementService.incrementImpressionCount(id);
    
    return {
      message: '노출이 기록되었습니다.',
    };
  }

  // 광고 활성/비활성 토글 (관리자 전용)
  @Patch(':id/toggle-active')
  @UseGuards(AdminGuard)
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    const advertisement = await this.advertisementService.toggleActive(id);
    
    if (!advertisement) {
      throw new NotFoundException('광고를 찾을 수 없습니다.');
    }

    return {
      message: `광고가 ${advertisement.is_active ? '활성화' : '비활성화'}되었습니다.`,
      data: advertisement,
    };
  }

  // 광고 통계 조회 (관리자 전용)
  @Get('admin/stats')
  @UseGuards(AdminGuard)
  getStats() {
    return this.advertisementService.getStats();
  }

  // 광고 이미지 업로드 (관리자 전용)
  @Post('upload/advertisement-image')
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
      const uploadResult = await this.advertisementService.uploadAdvertisementImageToBunny(file);
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
  
  // 광고 이미지 삭제 (관리자 전용)
  @Delete('files/:filename')
  @UseGuards(AdminGuard)
  deleteFile(@Param('filename') filename: string) {
    return this.advertisementService.deleteFileFromBunny(filename);
  }
}
