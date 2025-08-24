"use client";

// React
import { useState, useEffect, useCallback } from "react";

// Components
import AdminLayout from "@/components/AdminLayout";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Upload,
  message,
  Switch,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { categoryAPI, contentAPI } from "@/lib/api";

export default function ContentManagement() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultThumbnailList, setDefaultThumbnailList] = useState<any[]>([]);
  const [defaultVideoList, setDefaultVideoList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
  const [selectedModalCategory, setSelectedModalCategory] = useState<any>(null);
  const [selectedModalSubCategory, setSelectedModalSubCategory] =
    useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [contentList, setContentList] = useState<any[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const columns = [
    {
      title: "번호",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      width: 300,
    },
    {
      title: "대표이미지",
      dataIndex: "image_url",
      key: "image_url",
      width: 120,
      render: (url: string) => (
        <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
          {url ? (
            <img
              src={url}
              alt="썸네일"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              이미지 없음
            </div>
          )}
        </div>
      ),
    },
    {
      title: "카테고리",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category || "미분류"}</Tag>
      ),
    },
    {
      title: "서브카테고리",
      dataIndex: "sub_category",
      key: "sub_category",
      width: 100,
      render: (subCategory: string) => (
        <Tag color="cyan">{subCategory || "-"}</Tag>
      ),
    },
    // {
    //   title: "상태",
    //   dataIndex: "status",
    //   key: "status",
    //   width: 100,
    //   render: (status: string) => {
    //     const color =
    //       status === "active"
    //         ? "green"
    //         : status === "pending"
    //         ? "orange"
    //         : "red";
    //     const text =
    //       status === "active"
    //         ? "활성"
    //         : status === "pending"
    //         ? "대기"
    //         : "비활성";
    //     return <Tag color={color}>{text}</Tag>;
    //   },
    // },
    {
      title: "좋아요",
      dataIndex: "like_count",
      key: "like_count",
      width: 80,
      render: (count: number) => count || 0,
    },
    {
      title: "노출여부",
      dataIndex: "is_visible",
      key: "is_visible",
      width: 100,
      render: (visible: boolean, record: any) => (
        <Switch
          checked={visible}
          onChange={(checked) => handleVisibleChange(checked, record.id)} 
        />
      ),
    },
    {
      title: "조회수/댓글수",
      key: "views_comments",
      width: 120,
      render: (_: any, record: any) => (
        <div className="text-sm">
          <div>
            조회: {record.view_count || 0} / 댓글: {record.comment_count || 0}
          </div>
        </div>
      ),
    },
    {
      title: "인기동영상",
      dataIndex: "is_popular",
      key: "is_popular",
      width: 100,
      render: (popular: boolean) => (
        <Tag color={popular ? "red" : "default"}>
          {popular ? "인기" : "일반"}
        </Tag>
      ),
    },
    {
      title: "등록일자",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("ko-KR");
      },
    },
    {
      title: "작업",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedContent(record);
              setDefaultThumbnailList(
                record.image_url
                  ? [
                      {
                        name: record.image_url,
                        status: "done",
                        url: record.image_url,
                      },
                    ]
                  : []
              );
              setDefaultVideoList(
                record.video_guid
                  ? [
                      {
                        guid: record.video_guid,
                        name: record.video_guid,
                        status: "done",
                        url: record.service_link,
                      },
                    ]
                  : []
              );
              setSelectedModalCategory(() => {
                const category = categories.find(
                  (cat: any) => cat.value === record.category
                );

                setSelectedModalSubCategory(
                  category?.children?.find(
                    (child: any) => child.value === record.sub_category
                  )
                );

                return category;
              });
              setSubject(record.title || "");
              setTag(record.tags || "");
              setIsVisible(record.is_visible);
              setIsModalOpen(true);
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={async () => {
              try {
                await contentAPI.deleteContent(record.id);
                messageApi.success("콘텐츠가 삭제되었습니다.");
                fetchContentList(pagination.page, searchText);
              } catch (error) {
                messageApi.error("콘텐츠 삭제에 실패했습니다.");
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const handleVisibleChange = async (checked: boolean, id: number) => {
    try {
      await contentAPI.updateContent(id, { is_visible: checked });
      messageApi.success("노출여부가 변경되었습니다.");
      fetchContentList(pagination.page, searchText);
    } catch (error) {
      messageApi.error("노출여부 변경에 실패했습니다.");
    }
  };

  const handleAddContent = () => {
    setDefaultThumbnailList([]);
    setDefaultVideoList([]);
    setSelectedModalCategory(null);
    setSelectedModalSubCategory(null);
    setSubject("");
    setTag("");
    setIsVisible(true);
    setSelectedContent(null);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!selectedModalCategory) {
      messageApi.error("카테고리를 선택해주세요.");
      return;
    }
    if (!subject) {
      messageApi.error("제목을 입력해주세요.");
      return;
    }
    if (!tag) {
      messageApi.error("태크를 입력해주세요.");
      return;
    }
    if (defaultThumbnailList.length === 0) {
      messageApi.error("썸네일을 추가해주세요.");
      return;
    }
    if (defaultVideoList.length === 0) {
      messageApi.error("동영상을 추가해주세요.");
      return;
    }

    try {
      if (selectedContent) {
        await contentAPI.updateContent(selectedContent.id, {
          title: subject,
          tags: tag,
          service_link: defaultVideoList[0]?.response?.data?.url,
          category: selectedModalCategory?.value,
          sub_category: selectedModalSubCategory,
          image_url: defaultThumbnailList[0]?.response?.data?.url,
          video_guid: defaultVideoList[0]?.response?.data?.guid,
        });
        messageApi.success("콘텐츠가 수정되었습니다.");
      } else {
        await contentAPI.createContent({
          title: subject,
          tags: tag,
          service_link: defaultVideoList[0]?.response?.data?.url,
          category: selectedModalCategory?.value,
          sub_category: selectedModalSubCategory,
          image_url: defaultThumbnailList[0]?.response?.data?.url,
          video_guid: defaultVideoList[0]?.response?.data?.guid,
        });
        messageApi.success("콘텐츠가 추가되었습니다.");
      }
      setIsModalOpen(false);
      // 콘텐츠 목록 새로고침
      fetchContentList(pagination.page, searchText);
    } catch (error) {
      messageApi.error("콘텐츠 저장에 실패했습니다.");
      console.error("콘텐츠 저장 오류:", error);
    }
  };

  const handleCancel = () => {
    if (
      selectedContent &&
      (!defaultThumbnailList || defaultThumbnailList.length === 0)
    ) {
      messageApi.error("썸네일을 추가해주세요.");
      return;
    }

    if (
      selectedContent &&
      (!defaultVideoList || defaultVideoList.length === 0)
    ) {
      messageApi.error("동영상을 추가해주세요.");
      return;
    }

    setIsModalOpen(false);
  };

  const handleThumbnailChange = ({ file, fileList }: any) => {
    setDefaultThumbnailList(fileList);
    if (file.status === "removed") {
      contentAPI.deleteFile(
        file.response?.data?.filename ||
          file.url.substring(file.url.lastIndexOf("/") + 1)
      );
    }
  };

  const handleVideoChange = ({ file, fileList }: any) => {
    setDefaultVideoList(fileList);
    if (file.status === "removed") {
      contentAPI.deleteVideo(file.response?.data?.guid || file.guid);
    }
  };

  const fetchContentList = useCallback(
    async (
      page: number = 1,
      search?: string,
      category?: string,
      subCategory?: string | null
    ) => {
      try {
        setLoading(true);
        const response = await contentAPI.getContents({
          page,
          limit: pagination.limit,
          search: search?.trim() || undefined,
          category: category,
          sub_category: subCategory,
          sortBy: "id",
          sortOrder: "DESC",
        });

        if (response.status === 200) {
          const { data, pagination: paginationInfo } = response.data;
          setContentList(data || []);
          setPagination(paginationInfo);
        }
      } catch (error) {
        messageApi.error("콘텐츠 데이터를 불러오는데 실패했습니다.");
        console.error("콘텐츠 조회 오류:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, selectedCategory, selectedSubCategory, messageApi]
  );

  // 페이지 변경 핸들러
  const handlePageChange = (page: number, pageSize?: number) => {
    if (pageSize && pageSize !== pagination.limit) {
      setPagination((prev) => ({ ...prev, limit: pageSize }));
    }
    fetchContentList(
      page,
      searchText,
      selectedCategory?.value,
      selectedSubCategory
    );
  };

  // 검색 핸들러
  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchContentList(1, value, selectedCategory?.value, selectedSubCategory);
  };

  // 카테고리 필터 변경 핸들러
  const handleCategoryChange = (value: string) => {
    const category = categories.find((cat) => cat.value === value);
    setSelectedCategory(category);
    setSelectedSubCategory(null);

    fetchContentList(1, searchText, category?.value, null);
  };

  // 서브카테고리 필터 변경 핸들러
  const handleSubCategoryChange = (value: string) => {
    const subCategory = selectedCategory?.children?.find(
      (child: any) => child.value === value
    );
    setSelectedSubCategory(subCategory?.value);

    fetchContentList(
      1,
      searchText,
      selectedCategory?.value,
      subCategory?.value
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await categoryAPI.getAllCategories();
      if (response.status === 200) {
        const formattedCategories = response.data.map((cat: any) => ({
          label: cat.name,
          value: cat.name,
          id: cat.id,
          children:
            cat.children?.map((child: any) => ({
              label: child.name,
              value: child.name,
              id: child.id,
            })) || [],
        }));
        setCategories(formattedCategories);
      }
    };
    fetchCategories();
    fetchContentList(1);
  }, []);

  return (
    <AdminLayout>
      {contextHolder}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">콘텐츠 관리</h1>

        {/* 액션 버튼 */}
        <div className="flex justify-end items-center mb-4">
          <div className="w-[200px] mr-4">
            <Select
              className="w-full"
              options={categories}
              placeholder="카테고리"
              value={selectedCategory?.value}
              allowClear
              onChange={handleCategoryChange}
            />
          </div>
          <div className="w-[200px] mr-4">
            <Select
              className="w-full"
              options={selectedCategory?.children || []}
              placeholder="서브카테고리"
              value={selectedSubCategory}
              allowClear
              onChange={handleSubCategoryChange}
            />
          </div>
          <div className="w-[300px] mr-4">
            <Input.Search
              placeholder="제목/태그 검색"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) {
                  setSearchText("");
                  fetchContentList(1, "");
                }
              }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddContent()}
          >
            새 콘텐츠 추가
          </Button>
        </div>

        {/* 콘텐츠 테이블 */}
        <Table
          columns={columns}
          dataSource={contentList}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / 총 ${total}개`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1400 }}
          rowKey="id"
        />
        <Modal
          title="콘텐츠"
          open={isModalOpen}
          okText="저장"
          cancelText="취소"
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div>
            <div className="flex gap-[20px] mb-[20px]">
              <div className="flex-1">
                <Select
                  className="w-full"
                  value={selectedModalCategory?.value}
                  options={categories}
                  placeholder="카테고리"
                  onChange={(value) => {
                    const category = categories.find(
                      (cat) => cat.value === value
                    );
                    setSelectedModalCategory(category);
                    setSelectedModalSubCategory(null);
                  }}
                />
              </div>
              <div className="flex-1">
                <Select
                  className="w-full"
                  options={selectedModalCategory?.children || []}
                  placeholder="서브카테고리"
                  value={selectedModalSubCategory}
                  onChange={setSelectedModalSubCategory}
                />
              </div>
            </div>
            <div className="mb-[20px]">
              <Input
                placeholder="제목"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="mb-[20px]">
              <Input
                placeholder="태크"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
            <div className="mb-[20px]">
              <Upload
                action="/api/admin/contents/upload/thumbnail"
                onChange={handleThumbnailChange}
                fileList={defaultThumbnailList}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>썸네일</Button>
              </Upload>
            </div>
            <div className="mb-[20px]">
              <Upload
                action="/api/admin/contents/upload/video"
                onChange={handleVideoChange}
                fileList={defaultVideoList}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>동영상</Button>
              </Upload>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
