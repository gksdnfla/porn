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
  HasMany
} from 'sequelize-typescript';

@Table({
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  comment: '카테고리 테이블'
})
export class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    comment: '카테고리 ID'
  })
  declare id: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.STRING(100),
    comment: '카테고리 이름'
  })
  declare name: string;

  @AllowNull(true)
  @ForeignKey(() => Category)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: '부모 카테고리 ID (NULL이면 최상위 카테고리)'
  })
  declare parent_id: number | null;

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

  // 관계 정의: 부모 카테고리
  @BelongsTo(() => Category, 'parent_id')
  declare parent: Category;

  // 관계 정의: 하위 카테고리들
  @HasMany(() => Category, 'parent_id')
  declare children: Category[];
}
