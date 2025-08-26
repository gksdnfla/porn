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
  DatePicker,
  Modal,
  Upload,
  message,
  Switch,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { advertisementAPI } from "@/lib/api";

const { RangePicker } = DatePicker;

export default function AdvertisementManagement() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultAdvertisementImageList, setDefaultAdvertisementImageList] =
    useState<any[]>([]);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<any>(null);
  const [advertisementList, setAdvertisementList] = useState<any[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [priority, setPriority] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);

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
      title: "광고 링크",
      dataIndex: "link_url",
      key: "link_url",
      width: 100,
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      ),
    },
    {
      title: "우선순위",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      sorter: (a: any, b: any) => a.priority - b.priority,
    },
    {
      title: "상태",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (status: boolean, record: any) => (
        <Switch
          checked={status}
          onChange={(checked: boolean) =>
            handleStatusChange(checked, record.id)
          }
        />
      ),
    },
    {
      title: "광고 시작일",
      dataIndex: "start_date",
      key: "start_date",
      width: 100,
      render: (date: number) => {
        return date ? new Date(date).toLocaleDateString("ko-KR") : "-";
      },
      sorter: (a: any, b: any) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    },
    {
      title: "광고 종료일",
      dataIndex: "end_date",
      key: "end_date",
      width: 100,
      render: (date: number) => {
        return date ? new Date(date).toLocaleDateString("ko-KR") : "-";
      },
      sorter: (a: any, b: any) =>
        new Date(a.end_date).getTime() - new Date(b.end_date).getTime(),
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
              setSelectedAdvertisement(record);
              setDefaultAdvertisementImageList(
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
              setSubject(record.title || "");
              setLink(record.link_url || "");
              setPriority(record.priority || 0);
              setIsActive(record.is_active || true);
              setStartDate(record.start_date ? dayjs(record.start_date) : null);
              setEndDate(record.end_date ? dayjs(record.end_date) : null);
              setIsModalOpen(true);
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={async () => {
              try {
                await advertisementAPI.deleteAdvertisement(record.id);
                messageApi.success("콘텐츠가 삭제되었습니다.");
                fetchAdvertisementList();
              } catch (error) {
                messageApi.error("콘텐츠 삭제에 실패했습니다.");
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const handleStatusChange = async (checked: boolean, id: number) => {
    try {
      await advertisementAPI.updateAdvertisement(id, { is_active: checked });
      messageApi.success("상태가 변경되었습니다.");
      fetchAdvertisementList();
    } catch (error) {
      messageApi.error("상태 변경에 실패했습니다.");
    }
  };

  const handleAddAdvertisement = () => {
    setDefaultAdvertisementImageList([]);
    setSubject("");
    setIsModalOpen(true);
    setSelectedAdvertisement(null);
    setLink("");
    setPriority(0);
    setIsActive(true);
    setStartDate(null);
    setEndDate(null);
  };

  const handleOk = async () => {
    if (!subject) {
      messageApi.error("제목을 입력해주세요.");
      return;
    }
    if (!link) {
      messageApi.error("광고 링크를 입력해주세요.");
      return;
    }
    if (typeof priority !== "number" || priority < 0) {
      messageApi.error("우선순위를 입력해주세요.");
      return;
    }
    if (defaultAdvertisementImageList.length === 0) {
      messageApi.error("광고 이미지를 추가해주세요.");
      return;
    }

    try {
      if (selectedAdvertisement) {
        await advertisementAPI.updateAdvertisement(selectedAdvertisement.id, {
          title: subject,
          image_url: defaultAdvertisementImageList[0]?.response?.data?.url,
          link_url: link,
          priority: priority,
          is_active: isActive,
          start_date: startDate?.toDate() || undefined,
          end_date: endDate?.toDate() || undefined,
        });
        messageApi.success("광고가 수정되었습니다.");
      } else {
        await advertisementAPI.createAdvertisement({
          title: subject,
          image_url: defaultAdvertisementImageList[0]?.response?.data?.url,
          link_url: link,
          priority: priority,
          is_active: isActive,
          start_date: startDate?.toDate() || undefined,
          end_date: endDate?.toDate() || undefined,
        });
        messageApi.success("광고가 추가되었습니다.");
      }
      setIsModalOpen(false);
      // 콘텐츠 목록 새로고침
      fetchAdvertisementList();
    } catch (error) {
      messageApi.error("콘텐츠 저장에 실패했습니다.");
      console.error("콘텐츠 저장 오류:", error);
    }
  };

  const handleCancel = () => {
    if (
      selectedAdvertisement &&
      (!defaultAdvertisementImageList ||
        defaultAdvertisementImageList.length === 0)
    ) {
      messageApi.error("썸네일을 추가해주세요.");
      return;
    }

    setIsModalOpen(false);
  };

  const handleThumbnailChange = ({ file, fileList }: any) => {
    setDefaultAdvertisementImageList(fileList);
    if (file.status === "removed") {
      advertisementAPI.deleteImageFromBunny(
        file.response?.data?.filename ||
          file.url.substring(file.url.lastIndexOf("/") + 1)
      );
    }
  };

  const fetchAdvertisementList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await advertisementAPI.getAllAdvertisements();

      if (response.status === 200) {
        setAdvertisementList(response.data);
      }
    } catch (error) {
      messageApi.error("콘텐츠 데이터를 불러오는데 실패했습니다.");
      console.error("콘텐츠 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvertisementList();
  }, []);

  return (
    <AdminLayout>
      {contextHolder}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">광고 관리</h1>

        {/* 액션 버튼 */}
        <div className="flex justify-end items-center mb-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddAdvertisement()}
          >
            새 광고 추가
          </Button>
        </div>

        {/* 콘텐츠 테이블 */}
        <Table
          columns={columns}
          dataSource={advertisementList}
          loading={loading}
          scroll={{ x: 1400 }}
          rowKey="id"
        />
        <Modal
          title="광고"
          open={isModalOpen}
          okText="저장"
          cancelText="취소"
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div>
            <div className="mb-[20px]">
              <Input
                placeholder="제목"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="mb-[20px]">
              <Input
                placeholder="광고 링크"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <div className="mb-[20px]">
              <Input
                placeholder="우선순위"
                value={priority}
                type="number"
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>
            <div className="mb-[20px]">
              <RangePicker
                className="w-full"
                placeholder={["광고 시작일", "광고 종료일"]}
                value={[startDate, endDate]}
                onChange={(dates) => {
                  setStartDate(
                    dates?.[0]
                      ? dates[0].hour(0).minute(0).second(0).millisecond(0)
                      : null
                  );
                  setEndDate(
                    dates?.[1]
                      ? dates[1].hour(23).minute(59).second(59).millisecond(999)
                      : null
                  );
                }}
              />
            </div>
            <div className="mb-[20px]">
              <label className="block">상태</label>
              <Switch
                checked={isActive}
                onChange={(checked: boolean) => setIsActive(checked)}
              />
            </div>
            <div className="mb-[20px]">
              <p className="text-sm text-gray-500 mb-2">싸이즈(365 * 90)</p>
              <Upload
                action="/api/advertisements/upload/advertisement-image"
                onChange={handleThumbnailChange}
                fileList={defaultAdvertisementImageList}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>광고 이미지</Button>
              </Upload>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
