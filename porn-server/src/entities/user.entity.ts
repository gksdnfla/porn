import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  PrimaryKey, 
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  Unique,
  AllowNull,
  Index
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  comment: '사용자 테이블'
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    comment: '사용자 ID'
  })
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.STRING(50),
    comment: '사용자명 (로그인용)'
  })
  declare username: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    comment: '비밀번호 (해시값)'
  })
  declare password: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
    comment: '닉네임 (표시용)'
  })
  declare nickname: string;

  @Unique
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.STRING(255),
    comment: '이메일 주소'
  })
  declare email: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('admin', 'user'),
    defaultValue: 'user',
    comment: '用户权限 (admin: 管理员, user: 普通用户)'
  })
  declare role: 'admin' | 'user';

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: '封号状态 (true: 已封号, false: 正常)'
  })
  declare is_banned: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '封号原因'
  })
  declare ban_reason: string | null;

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
