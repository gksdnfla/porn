import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  PrimaryKey, 
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  Index,
  ForeignKey,
  BelongsTo,
  Default
} from 'sequelize-typescript';
import { Category } from './category.entity';

@Table({
  tableName: 'contents',
  timestamps: true,
  underscored: true,
  comment: '콘텐츠 테이블'
})
export class Content extends Model<Content> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    comment: '콘텐츠 ID'
  })
  declare id: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.STRING(500),
    comment: '콘텐츠 제목'
  })
  declare title: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(1000),
    comment: '대표이미지 URL'
  })
  declare image_url: string | null;

  @AllowNull(false)
  @ForeignKey(() => Category)
  @Index
  @Column({
    type: DataType.STRING(100),
    comment: '카테고리'
  })
  declare category: string;

  @AllowNull(true)
  @ForeignKey(() => Category)
  @Index
  @Column({
    type: DataType.STRING(100),
    comment: '서브카테고리'
  })
  declare sub_category: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(1000),
    comment: '서비스 링크 URL'
  })
  declare service_link: string | null;

  @AllowNull(true)
  @Index
  @Column({
    type: DataType.STRING(100),
    comment: 'Bunny Stream 비디오 GUID'
  })
  declare video_guid: string | null;

  @AllowNull(false)
  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: '노출 여부 (true: 노출, false: 숨김)'
  })
  declare is_visible: boolean;


  @AllowNull(false)
  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: '인기 동영상 여부 (true: 인기, false: 일반)'
  })
  declare is_popular: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    comment: '콘텐츠 설명'
  })
  declare description: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(1000),
    comment: '태그 (쉼표로 구분)'
  })
  declare tags: string | null;

  @AllowNull(false)
  @Default('active')
  @Index
  @Column({
    type: DataType.ENUM('active', 'inactive', 'pending', 'deleted'),
    comment: '콘텐츠 상태 (active: 활성, inactive: 비활성, pending: 검토중, deleted: 삭제됨)'
  })
  declare status: 'active' | 'inactive' | 'pending' | 'deleted';

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    comment: '콘텐츠 길이 (초 단위)'
  })
  declare duration: number | null;

  @AllowNull(true)
  @Column({
    type: DataType.BIGINT,
    comment: '파일 크기 (바이트)'
  })
  declare file_size: number | null;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: '노출일시'
  })
  declare visible_at: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    comment: '생성일시'
  })
  declare created_at: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: '수정일시'
  })
  declare updated_at: Date;

  // 관계 정의: 카테고리
  @BelongsTo(() => Category, { foreignKey: 'category', targetKey: 'name', as: 'categoryInfo' })
  declare categoryInfo: Category;

  // 관계 정의: 서브카테고리
  @BelongsTo(() => Category, { foreignKey: 'sub_category', targetKey: 'name', as: 'subCategoryInfo' })
  declare subCategoryInfo: Category;
}
