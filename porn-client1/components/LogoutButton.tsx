'use client';

import { Button, message, Modal } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutButtonProps {
  showConfirm?: boolean;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  size?: 'small' | 'middle' | 'large';
  children?: React.ReactNode;
}

export default function LogoutButton({ 
  showConfirm = true, 
  type = 'default',
  size = 'middle',
  children 
}: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      message.success('로그아웃되었습니다');
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      message.error('로그아웃 중 오류가 발생했습니다');
    }
  };

  const confirmLogout = () => {
    if (showConfirm) {
      Modal.confirm({
        title: '로그아웃',
        content: '정말 로그아웃하시겠습니까?',
        okText: '로그아웃',
        cancelText: '취소',
        onOk: handleLogout,
      });
    } else {
      handleLogout();
    }
  };

  return (
    <Button
      type={type}
      size={size}
      icon={<LogoutOutlined />}
      onClick={confirmLogout}
    >
      {children || '로그아웃'}
    </Button>
  );
}
