import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../../entities/category.entity';

export interface CreateCategoryDto {
  name: string;
  parent_id?: number | null;
}

export interface UpdateCategoryDto {
  name?: string;
  parent_id?: number | null;
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  // 모든 카테고리 조회 (계층 구조 포함)
  async findAll(): Promise<Category[]> {
    return this.categoryModel.findAll({
      include: [
        {
          model: Category,
          as: 'children',
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          required: false,
        },
      ],
      order: [['id', 'ASC']],
      where: {
        parent_id: null,
      },
    });
  }

  // 최상위 카테고리만 조회
  async findRootCategories(): Promise<Category[]> {
    return this.categoryModel.findAll({
      where: { parent_id: null },
      include: [
        {
          model: Category,
          as: 'children',
          required: false,
        },
      ],
      order: [['id', 'ASC']],
    });
  }

  // 특정 카테고리의 하위 카테고리 조회
  async findChildren(parentId: number): Promise<Category[]> {
    return this.categoryModel.findAll({
      where: { parent_id: parentId },
      order: [['id', 'ASC']],
    });
  }

  // ID로 카테고리 조회
  async findOne(id: number): Promise<Category | null> {
    return this.categoryModel.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children',
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          required: false,
        },
      ],
    });
  }

  // 카테고리 생성
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create({
      name: createCategoryDto.name,
      parent_id: createCategoryDto.parent_id,
    } as any);
  }

  // 카테고리 업데이트
  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<[number, Category[]]> {
    return this.categoryModel.update(updateCategoryDto, {
      where: { id },
      returning: true,
    });
  }

  // 카테고리 삭제
  async remove(id: number): Promise<number> {
    // 하위 카테고리가 있는지 확인
    const childrenCount = await this.categoryModel.count({
      where: { parent_id: id },
    });

    if (childrenCount > 0) {
      throw new Error('하위 카테고리가 있는 카테고리는 삭제할 수 없습니다');
    }

    return this.categoryModel.destroy({
      where: { id },
    });
  }

  // 카테고리 경로 조회 (부모 -> 자식 순서)
  async getCategoryPath(id: number): Promise<Category[]> {
    const path: Category[] = [];
    let currentCategory = await this.findOne(id);

    while (currentCategory) {
      path.unshift(currentCategory);
      if (currentCategory.parent_id) {
        currentCategory = await this.findOne(currentCategory.parent_id);
      } else {
        break;
      }
    }

    return path;
  }
}
