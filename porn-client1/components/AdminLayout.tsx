"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import type { MenuProps } from "antd";
import { Button, Layout, Menu, theme } from "antd";
import { authAPI } from "@/lib/api";

const { Header, Content, Sider } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items: MenuProps["items"] = [
    "회원관리",
    "콘텐츠 관리",
    "광고 관리",
  ].map((key) => ({
    key,
    label: key,
    active: true,
    onClick: () => {
      switch (key) {
        case "회원관리":
          router.push("/admin");
          break;
        case "콘텐츠 관리":
          router.push("/admin/content-management");
          break;
        case "광고 관리":
          router.push("/admin/advertisement-management");
          break;
      }
    },
  }));

  const getInitialSelectedKeys = () => {
    const pathname = usePathname();

    switch (pathname) {
      case "/admin":
        return ["회원관리"];
      case "/admin/content-management":
        return ["콘텐츠 관리"];
      case "/admin/advertisement-management":
        return ["광고 관리"];
      default:
        return ["회원관리"];
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    router.push("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div className="h-[60px] flex justify-center items-center">
          <Image className="h-[60px]" src="/login-logo.png" alt="logo" width={149} height={63} />
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={getInitialSelectedKeys()}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          className="flex justify-end items-center"
          style={{ padding: 0, background: colorBgContainer }}
        >
          <div className="mr-[20px]">
            <Button color="primary" variant="text" onClick={() => handleLogout()}>
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ margin: "16px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
