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
  Default
} from 'sequelize-typescript';

@Table({
  tableName: 'advertisements',
  timestamps: true,
  underscored: true,
  comment: '광고 테이블'
})
export class Advertisement extends Model<Advertisement> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    comment: '광고 ID'
  })
  declare id: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.STRING(500),
    comment: '광고 제목'
  })
  declare title: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(1000),
    comment: '광고 이미지 URL'
  })
  declare image_url: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(1000),
    comment: '광고 링크 URL'
  })
  declare link_url: string;

  @AllowNull(false)
  @Default(0)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: '우선순위 (숫자가 높을수록 우선순위 높음)'
  })
  declare priority: number;

  @AllowNull(false)
  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: '활성 상태 (true: 활성, false: 비활성)'
  })
  declare is_active: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    comment: '광고 설명'
  })
  declare description: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    comment: '광고 시작일'
  })
  declare start_date: Date | null;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    comment: '광고 종료일'
  })
  declare end_date: Date | null;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: '클릭 수'
  })
  declare click_count: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: '노출 수'
  })
  declare impression_count: number;

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
}
