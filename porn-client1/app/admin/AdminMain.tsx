"use client";

// React
import { useState, useEffect, useCallback } from "react";

// Components
import AdminLayout from "@/components/AdminLayout";
import { Input, Table, Pagination, Tag, Switch, message, Button, Modal, Select, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

// API
import { adminAPI } from "@/lib/api";

// Styles
import styles from "./AdminMain.module.css";

// 타입 정의
interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: "admin" | "user";
  is_banned: boolean;
  ban_reason?: string;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AdminMain() {
  // 상태 관리
  const [messageApi, contextHolder] = message.useMessage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
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
      title: "닉네임",
      dataIndex: "nickname",
      key: "nickname",
      width: 120,
    },
    {
      title: "이메일",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "아이디",
      dataIndex: "username",
      key: "username",
      width: 120,
    },
    {
      title: "권한",
      dataIndex: "role",
      key: "role",
      width: 80,
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role === "admin" ? "관리자" : "사용자"}
        </Tag>
      ),
    },
    {
      title: "상태",
      dataIndex: "is_banned",
      key: "is_banned",
      width: 100,
      render: (is_banned: boolean, record: User) => (
        <Switch
          defaultChecked
          onChange={(checked) => {
            if (checked) {
              handleUnbanUser(record.id);
            } else {
              handleBanUser(record.id);
            }
          }}
        />
      ),
    },
    {
      title: "가입일",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("ko-KR"),
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
              setSelectedUser(record);
              setNickname(record.nickname);
              setEmail(record.email);
              setUsername(record.username);
              setRole(record.role);
              setPassword('');
              setPasswordConfirm('');
              setIsModalOpen(true);
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={async () => {
              try {
                await adminAPI.deleteUser(record.id);
                messageApi.success("콘텐츠가 삭제되었습니다.");
                fetchUsers(pagination.page, searchText);
              } catch (error) {
                messageApi.error("콘텐츠 삭제에 실패했습니다.");
              }
            }}
          />
        </Space>
      ),
    },
  ];

  // 사용자 데이터 가져오기
  const fetchUsers = useCallback(
    async (page: number = 1, search?: string) => {
      try {
        setLoading(true);
        console.log("🔄 사용자 데이터 요청 중...", {
          page,
          search,
          limit: pagination.limit,
        });

        const response = await adminAPI.getUsers({
          page,
          limit: pagination.limit,
          search: search?.trim() || undefined,
          sortBy: "id",
          sortOrder: "DESC",
        });

        const { data, pagination: paginationInfo } = response.data;

        console.log("✅ 사용자 데이터 조회 완료:", {
          userCount: data.length,
          totalUsers: paginationInfo.total,
          currentPage: paginationInfo.page,
        });

        setUsers(data);
        setPagination(paginationInfo);
      } catch (error) {
        console.error("❌ 사용자 데이터 조회 실패:", error);
        messageApi.error("사용자 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  // 페이지 변경 핸들러
  const handlePageChange = (page: number, pageSize?: number) => {
    if (pageSize && pageSize !== pagination.limit) {
      setPagination((prev) => ({ ...prev, limit: pageSize }));
    }
    fetchUsers(page, searchText);
  };

  // 검색 핸들러
  const handleSearch = (value: string) => {
    console.log("🔍 검색 실행:", value);
    setSearchText(value);
    fetchUsers(1, value); // 검색할 때는 첫 페이지로
  };

  // 사용자 정지 핸들러
  const handleBanUser = async (userId: number) => {
    try {
      console.log("🚫 사용자 정지 요청:", userId);
      await adminAPI.banUser(userId, {
        is_banned: true,
        ban_reason: "관리자에 의한 정지",
      });
      messageApi.success("사용자가 정지되었습니다.");
      fetchUsers(pagination.page, searchText); // 현재 페이지 새로고침
    } catch (error) {
      console.error("❌ 사용자 정지 실패:", error);
      messageApi.error("사용자 정지에 실패했습니다.");
    }
  };

  // 사용자 정지 해제 핸들러
  const handleUnbanUser = async (userId: number) => {
    try {
      console.log("✅ 사용자 정지 해제 요청:", userId);
      await adminAPI.unbanUser(userId);
      messageApi.success("사용자 정지가 해제되었습니다.");
      fetchUsers(pagination.page, searchText); // 현재 페이지 새로고침
    } catch (error) {
      console.error("❌ 사용자 정지 해제 실패:", error);
      messageApi.error("사용자 정지 해제에 실패했습니다.");
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setNickname("");
    setEmail("");
    setUsername("");
    setPassword("");
    setPasswordConfirm("");
    setRole("user");
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!nickname || !email || !username || !role) {
        messageApi.error("모든 필드를 입력해주세요.");
        return;
    }

    if (password !== passwordConfirm) {
        messageApi.error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
    }

    try {
        if (selectedUser) {
            const userData: any = {
                nickname,
                email,
                username,
                password,
                role,
            }

            if(!password) {
                delete userData.password;
            }

            await adminAPI.updateUser(selectedUser.id, userData);
          } else {
            await adminAPI.createUser({
              nickname,
              email,
              username,
              password,
              role,
            });
          }
          messageApi.success("사용자 정보가 저장되었습니다.");
          fetchUsers(pagination.page, searchText);
          setIsModalOpen(false);
    } catch (error) {
        messageApi.error("사용자 정보 저장에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    console.log("🚀 AdminMain 컴포넌트 초기화");
    fetchUsers(1);
  }, [fetchUsers]);

  return (
    <AdminLayout>
      {contextHolder}
      <div className="flex justify-end items-center gap-4 mb-[20px]">
        <Input.Search
          className={styles["search-input"]}
          placeholder="닉네임/아이디/이메일"
          allowClear
          size="middle"
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              handleSearch(""); // 입력이 비어있으면 전체 조회
            }
          }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAddUser()}
        >
          새 유저 추가
        </Button>
      </div>
      <div className="mb-[20px]">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={false}
          loading={loading}
          scroll={{ x: 1200 }}
        />
      </div>
      <div className="flex justify-end items-center">
        <Pagination
          current={pagination.page}
          total={pagination.total}
          pageSize={pagination.limit}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} / 총 ${total}개`
          }
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          pageSizeOptions={["10", "20", "50", "100"]}
        />
      </div>

      <Modal
        title="유저"
        open={isModalOpen}
        okText="저장"
        cancelText="취소"
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="flex flex-col gap-4">
          <Input value={nickname} placeholder="닉네임" onChange={(e) => setNickname(e.target.value)} />
          <Input value={email} placeholder="이메일" onChange={(e) => setEmail(e.target.value)} />
          <Input value={username} placeholder="아이디" onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" value={password} placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} />
          <Input type="password" value={passwordConfirm} placeholder="비밀번호 확인" onChange={(e) => setPasswordConfirm(e.target.value)} />
          <Select
            value={role}
            onChange={(value) => setRole(value)}
            options={[{ label: "관리자", value: "admin" }, { label: "사용자", value: "user" }]}
            placeholder="권한"
          />
        </div>
      </Modal>
    </AdminLayout>
  );
}
