import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Advertisement } from '../../entities/advertisement.entity';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import * as crypto from 'crypto';
import * as path from 'path';

export interface CreateAdvertisementDto {
  title: string;
  image_url: string;
  link_url: string;
  priority?: number;
  is_active?: boolean;
  description?: string;
  start_date?: Date;
  end_date?: Date;
}

export interface UpdateAdvertisementDto {
  title?: string;
  image_url?: string;
  link_url?: string;
  priority?: number;
  is_active?: boolean;
  description?: string;
  start_date?: Date;
  end_date?: Date;
}

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectModel(Advertisement)
    private advertisementModel: typeof Advertisement,
    private sequelize: Sequelize,
  ) {}

  // 모든 광고 조회 (우선순위 순으로 정렬)
  async findAll(): Promise<Advertisement[]> {
    return this.advertisementModel.findAll({
      order: [
        ['priority', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });
  }

  // 활성 광고만 조회
  async findActive(): Promise<Advertisement[]> {
    const now = new Date();

    return this.advertisementModel.findAll({
      where: {
        is_active: true,
        [Op.and]: [
          {
            [Op.or]: [
              { start_date: null },
              { start_date: { [Op.lte]: now } }
            ]
          },
          {
            [Op.or]: [
              { end_date: null },
              { end_date: { [Op.gte]: now } }
            ]
          }
        ]
      },
      order: [
        ['priority', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });
  }

  // ID로 광고 조회
  async findOne(id: number): Promise<Advertisement | null> {
    return this.advertisementModel.findByPk(id);
  }

  // 광고 생성
  async create(
    createAdvertisementDto: CreateAdvertisementDto,
  ): Promise<Advertisement> {
    return this.advertisementModel.create({
      ...createAdvertisementDto,
      click_count: 0,
      impression_count: 0,
      is_active: createAdvertisementDto.is_active ?? true,
      priority: createAdvertisementDto.priority ?? 0,
    } as any);
  }

  // 광고 업데이트
  async update(
    id: number,
    updateAdvertisementDto: UpdateAdvertisementDto,
  ): Promise<[number, Advertisement[]]> {
    return this.advertisementModel.update(updateAdvertisementDto, {
      where: { id },
      returning: true,
    });
  }

  // 광고 삭제 (트랜잭션 사용)
  async remove(id: number): Promise<Advertisement | null> {
    const transaction = await this.sequelize.transaction();
    
    try {
      // 먼저 광고 정보 조회
      const result = await this.advertisementModel.findByPk(id, { transaction });
      
      if (!result) {
        await transaction.rollback();
        return null;
      }

      // 데이터베이스에서 광고 삭제
      await this.advertisementModel.destroy({
        where: { id },
        transaction,
      });

      // 트랜잭션 커밋
      await transaction.commit();

      // 트랜잭션 성공 후 파일 삭제 (비동기로 처리)
      if (result.image_url) {
        const filename = result.image_url.substring(result.image_url.lastIndexOf('/') + 1);
        // 파일 삭제는 백그라운드에서 처리 (실패해도 데이터베이스 삭제는 유지)
        this.deleteFileFromBunny(filename);
      }

      return result;
    } catch (error) {
      // 오류 발생 시 롤백
      await transaction.rollback();
      throw error;
    }
  }

  // 클릭 수 증가
  async incrementClickCount(id: number): Promise<void> {
    await this.advertisementModel.increment('click_count', {
      where: { id },
    });
  }

  // 노출 수 증가
  async incrementImpressionCount(id: number): Promise<void> {
    await this.advertisementModel.increment('impression_count', {
      where: { id },
    });
  }

  // 광고 활성/비활성 토글
  async toggleActive(id: number): Promise<Advertisement | null> {
    const advertisement = await this.findOne(id);
    if (!advertisement) return null;

    await this.advertisementModel.update(
      { is_active: !advertisement.is_active },
      { where: { id } },
    );

    return this.findOne(id);
  }

  // 통계 조회
  async getStats(): Promise<{
    totalAds: number;
    activeAds: number;
    inactiveAds: number;
    totalClicks: number;
    totalImpressions: number;
  }> {
    const [totalAds, activeAds, inactiveAds, clickStats, impressionStats] =
      await Promise.all([
        this.advertisementModel.count(),
        this.advertisementModel.count({ where: { is_active: true } }),
        this.advertisementModel.count({ where: { is_active: false } }),
        this.advertisementModel.sum('click_count'),
        this.advertisementModel.sum('impression_count'),
      ]);

    return {
      totalAds,
      activeAds,
      inactiveAds,
      totalClicks: clickStats || 0,
      totalImpressions: impressionStats || 0,
    };
  }

  // Bunny Storage에 광고 이미지 업로드
  async uploadAdvertisementImageToBunny(file: Express.Multer.File): Promise<{
    url: string;
    filename: string;
  }> {
    const bunnyStorageZone =
      process.env.BUNNY_ADVERTISEMENT_IMAGE_STORAGE_ZONE || 'your-storage-zone';
    const bunnyAccessKey =
      process.env.BUNNY_ADVERTISEMENT_IMAGE_ACCESS_KEY || 'your-access-key';
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

  // Bunny Storage에서 파일 삭제 및 데이터베이스 업데이트
  async deleteFileFromBunny(filename: string): Promise<void> {
    const bunnyStorageZone =
      process.env.BUNNY_ADVERTISEMENT_IMAGE_STORAGE_ZONE || 'your-storage-zone';
    const bunnyAccessKey = process.env.BUNNY_ADVERTISEMENT_IMAGE_ACCESS_KEY || 'your-access-key';
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

      // 데이터베이스에서 해당 이미지 URL을 사용하는 광고의 image_url 필드 삭제
      await this.advertisementModel.update(
        { image_url: '' },
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
}
