import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Content } from '../../entities/content.entity';
import { Category } from '../../entities/category.entity';
import { PaginationDto, PaginatedResult } from '../user/dto/pagination.dto';
import * as crypto from 'crypto';
import * as path from 'path';

export interface CreateContentDto {
  title: string;
  image_url?: string;
  category: string;
  sub_category?: string;
  service_link?: string;
  video_guid?: string;
  description?: string;
  tags?: string;
  duration?: number;
  file_size?: number;
  resolution?: string;
  status?: 'active' | 'inactive' | 'pending' | 'deleted';
}

export interface UpdateContentDto {
  title?: string;
  image_url?: string;
  category?: string;
  sub_category?: string;
  service_link?: string;
  video_guid?: string;
  description?: string;
  tags?: string;
  duration?: number;
  file_size?: number;
  resolution?: string;
  status?: 'active' | 'inactive' | 'pending' | 'deleted';
  is_visible?: boolean;
  is_popular?: boolean;
}

export interface ContentFilterDto extends PaginationDto {
  category?: string;
  sub_category?: string;
  status?: string;
  is_visible?: boolean;
  is_popular?: boolean;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content)
    private contentModel: typeof Content,
  ) {}

  // 분페이징 콘텐츠 조회
  async findAllWithPagination(
    filterDto: ContentFilterDto,
  ): Promise<PaginatedResult<Content>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'id',
      sortOrder = 'DESC',
      category,
      sub_category,
      status,
      is_visible,
      is_popular,
    } = filterDto;

    const offset = (page - 1) * limit;
    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    // 검색 조건 구성
    const whereCondition: any = {};

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category) {
      whereCondition.category = category;
    }

    if (sub_category) {
      whereCondition.sub_category = sub_category;
    }

    if (status) {
      whereCondition.status = status;
    }

    if (typeof is_visible === 'boolean') {
      whereCondition.is_visible = is_visible;
    }

    if (typeof is_popular === 'boolean') {
      whereCondition.is_popular = is_popular;
    }

    // 정렬 조건 구성
    const allowedSortFields = [
      'id',
      'title',
      'category',
      'view_count',
      'like_count',
      'comment_count',
      'is_popular',
      'created_at',
      'updated_at',
    ];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // 데이터 조회
    const { count, rows } = await this.contentModel.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Category,
          as: 'categoryInfo',
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: Category,
          as: 'subCategoryInfo',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [[orderField, orderDirection]],
      limit: limitNum,
      offset: offsetNum,
    });

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  // ID로 콘텐츠 조회
  async findOne(id: number): Promise<Content | null> {
    return this.contentModel.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categoryInfo',
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: Category,
          as: 'subCategoryInfo',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
    });
  }

  // 콘텐츠 생성
  async create(createContentDto: CreateContentDto): Promise<Content> {
    return this.contentModel.create({
      ...createContentDto,
      is_visible: true,
      is_popular: false,
      status: createContentDto.status || 'active',
    } as any);
  }

  // 콘텐츠 업데이트
  async update(
    id: number,
    updateContentDto: UpdateContentDto,
  ): Promise<[number, Content[]]> {
    return this.contentModel.update(updateContentDto, {
      where: { id },
      returning: true,
    });
  }

  // 콘텐츠 삭제 (소프트 삭제)
  async remove(id: number): Promise<[number, Content[]]> {
    return this.contentModel.update(
      { status: 'deleted' },
      {
        where: { id },
        returning: true,
      },
    );
  }

  // 콘텐츠 물리적 삭제
  async hardDelete(id: number): Promise<number> {
    return this.contentModel.destroy({
      where: { id },
    });
  }

  // 인기 콘텐츠 설정/해제
  async togglePopular(id: number): Promise<Content | null> {
    const content = await this.findOne(id);
    if (!content) return null;

    await this.contentModel.update(
      { is_popular: !content.is_popular },
      { where: { id } },
    );

    return this.findOne(id);
  }

  // 콘텐츠 노출/숨김 설정
  async toggleVisibility(id: number): Promise<Content | null> {
    const content = await this.findOne(id);
    if (!content) return null;

    await this.contentModel.update(
      { is_visible: !content.is_visible },
      { where: { id } },
    );

    return this.findOne(id);
  }

  // 통계 조회
  async getStats(): Promise<{
    totalContents: number;
    activeContents: number;
    pendingContents: number;
    popularContents: number;
    totalViews: number;
    totalLikes: number;
  }> {
    const [totalContents, activeContents, pendingContents, popularContents] =
      await Promise.all([
        this.contentModel.count(),
        this.contentModel.count({ where: { status: 'active' } }),
        this.contentModel.count({ where: { status: 'pending' } }),
        this.contentModel.count({ where: { is_popular: true } }),
      ]);

    return {
      totalContents,
      activeContents,
      pendingContents,
      popularContents,
      totalViews: 0,
      totalLikes: 0,
    };
  }

  // Bunny Storage에 썸네일 업로드
  async uploadThumbnailToBunny(file: Express.Multer.File): Promise<{
    url: string;
    filename: string;
  }> {
    const bunnyStorageZone =
      process.env.BUNNY_VIDEO_IMAGE_STORAGE_ZONE || 'your-storage-zone';
    const bunnyAccessKey = process.env.BUNNY_VIDEO_IMAGE_ACCESS_KEY || 'your-access-key';
    const bunnyStorageUrl = `https://sg.storage.bunnycdn.com/${bunnyStorageZone}`;

    // 고유한 파일명 생성
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${fileExtension}`;

    try {
      const response = await fetch(`${bunnyStorageUrl}/${uniqueFilename}`, {
        method: 'PUT',
        headers: {
          AccessKey: bunnyAccessKey,
          'Content-Type': 'application/octet-stream',
          accept: 'application/json',
        },
        body: file.buffer as any,
      });

      if (!response.ok) {
        throw new Error(
          `Bunny Storage 업로드 실패: ${response.status} ${response.statusText}`,
        );
      }

      const cdnUrl = `https://${bunnyStorageZone}.b-cdn.net/${uniqueFilename}`;

      return {
        url: cdnUrl,
        filename: uniqueFilename,
      };
    } catch (error) {
      throw new Error(`Bunny Storage 업로드 중 오류 발생: ${error.message}`);
    }
  }

  // Bunny Storage에 비디오 업로드
  async uploadVideoToBunny(file: Express.Multer.File): Promise<{
    url: string;
    guid: string;
    duration?: number;
  }> {
    const bunnyStorageZone =
      process.env.BUNNY_VIDEO_LIBRARY_ID || 'your-library-id';
    const bunnyAccessKey = process.env.BUNNY_VIDEO_API_KEY || 'your-api-key';
    const bunnyStorageUrl = `https://video.bunnycdn.com/library/${bunnyStorageZone}`;

    // 고유한 파일명 생성
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${fileExtension}`;

    try {
      const response = await fetch(`${bunnyStorageUrl}/videos`, {
        method: 'POST',
        headers: {
          AccessKey: bunnyAccessKey,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: uniqueFilename,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Bunny Storage 업로드 실패: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      const uploadResponse = await fetch(
        `${bunnyStorageUrl}/videos/${data.guid}/`,
        {
          method: 'PUT',
          headers: {
            AccessKey: bunnyAccessKey,
            accept: 'application/json',
          },
          body: file.buffer as any,
        },
      );

      console.log(await uploadResponse.json());

      if (!uploadResponse.ok) {
        throw new Error(
          `Bunny Stream 업로드 실패: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }

      const cdnUrl = `https://iframe.mediadelivery.net/play/${bunnyStorageZone}/${data.guid}`;

      return {
        url: cdnUrl,
        guid: data.guid,
        // TODO: 비디오 메타데이터 추출 (duration 등)
        duration: undefined,
      };
    } catch (error) {
      throw new Error(`Bunny Storage 업로드 중 오류 발생: ${error.message}`);
    }
  }

  // Bunny Storage에서 파일 삭제 및 데이터베이스 업데이트
  async deleteFileFromBunny(filename: string): Promise<void> {
    const bunnyStorageZone =
      process.env.BUNNY_STORAGE_ZONE || 'your-storage-zone';
    const bunnyAccessKey = process.env.BUNNY_ACCESS_KEY || 'your-access-key';
    const bunnyStorageUrl = `https://sg.storage.bunnycdn.com/${bunnyStorageZone}`;
    const fileUrl = `https://${bunnyStorageZone}.b-cdn.net/${filename}`;

    try {
      // Bunny Storage에서 파일 삭제
      const response = await fetch(`${bunnyStorageUrl}/${filename}`, {
        method: 'DELETE',
        headers: {
          AccessKey: bunnyAccessKey,
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(
          `Bunny Storage 삭제 실패: ${response.status} ${response.statusText}`,
        );
      }

      // 데이터베이스에서 해당 이미지 URL을 사용하는 콘텐츠의 image_url 필드 삭제
      await this.contentModel.update(
        { image_url: null },
        {
          where: { image_url: fileUrl },
          returning: true,
        },
      );
    } catch (error) {
      console.error(`Bunny Storage 파일 삭제 중 오류: ${error.message}`);
      // 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  // Bunny Stream에서 비디오 삭제 및 데이터베이스 업데이트
  async deleteVideoFromBunny(guid: string): Promise<void> {
    const bunnyStorageZone =
      process.env.BUNNY_VIDEO_LIBRARY_ID || 'your-library-id';
    const bunnyAccessKey = process.env.BUNNY_VIDEO_API_KEY || 'your-api-key';
    const bunnyStorageUrl = `https://video.bunnycdn.com/library/${bunnyStorageZone}/videos/${guid}`;

    try {
      // Bunny Stream에서 비디오 삭제
      const response = await fetch(bunnyStorageUrl, {
        method: 'DELETE',
        headers: {
          AccessKey: bunnyAccessKey,
        },
      });
      console.log(await response.json());
      if (!response.ok) {
        throw new Error(
          `Bunny Stream 삭제 실패: ${response.status} ${response.statusText}`,
        );
      }

      // 데이터베이스에서 해당 GUID를 사용하는 콘텐츠의 video_guid와 service_link 필드 삭제
      await this.contentModel.update(
        {
          video_guid: null,
          service_link: null,
        },
        { where: { video_guid: guid } },
      );
    } catch (error) {
      console.error(`Bunny Stream 삭제 중 오류: ${error.message}`);
      // 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }
}
