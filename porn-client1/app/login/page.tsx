"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input, Checkbox, Button, message } from "antd";

// Contexts
import { useAuth } from "@/contexts/AuthContext";

// Styles
import styles from "./LoginPage.module.css";

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LoginForm>({
    username: "",
    password: "",
    remember: false,
  });

  // 입력 변화 처리
  const handleInputChange = (
    field: keyof LoginForm,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 자동 로그인 체크박스 변화 처리
    if (field === "remember") {
      if (!value) {
        // 체크박스 해제 시 localStorage 삭제
        localStorage.removeItem("rememberLogin");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
      }
    }
  };

  // 로그인 처리
  const handleLogin = async () => {
    // 입력 검증
    if (!form.username.trim()) {
      messageApi.error("아이디를 입력해주세요");
      return;
    }

    if (!form.password.trim()) {
      messageApi.error("비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);

    try {
      // 로그인 호출
      const user = await login(form.username.trim(), form.password);

      // 로그인 성공
      messageApi.success("로그인 성공!");
      console.log("로그인 성공:", user);

      // 로그인 기억하기 선택한 경우 처리
      if (form.remember) {
        localStorage.setItem("rememberLogin", "true");
        localStorage.setItem("username", form.username);
        localStorage.setItem("password", form.password);
      } else {
        localStorage.removeItem("rememberLogin");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
      }

      // 사용자 역할에 따라 다른 페이지로 이동
      if (user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("로그인 오류:", error);

      // 오류 메시지 표시
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "로그인에 실패했습니다. 다시 시도해주세요.";
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 키보드 이벤트 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  // 페이지 로드 시 기억된 로그인 정보 확인
  useEffect(() => {
    const rememberLogin = localStorage.getItem("rememberLogin");
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");

    if (rememberLogin === "true" && savedUsername) {
      setForm((prev) => ({
        ...prev,
        username: savedUsername,
        password: savedPassword || "",
        remember: true,
      }));
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1C1D21]">
      {contextHolder}
      <div className="w-[360px] flex flex-col items-center">
        <Image
          className="mb-[15px]"
          src="/login-logo.png"
          alt="logo"
          width={149}
          height={63}
        />

        <Input
          className={styles.input}
          placeholder="아이디를 입력해주세요."
          value={form.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <Input.Password
          className={styles.passwordInput}
          placeholder="비밀번호를 입력해주세요."
          value={form.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <div className="w-full flex justify-between items-center mb-[30px]">
          <Checkbox
            checked={form.remember}
            onChange={(e) => handleInputChange("remember", e.target.checked)}
            disabled={loading}
          >
            <span className="text-[#888888]">자동 로그인</span>
          </Checkbox>
          <Link
            href="/signup"
            className="text-[14px] text-white hover:text-gray-300"
          >
            회원가입
          </Link>
        </div>

        <Button
          className={styles["login-button"]}
          type="primary"
          loading={loading}
          onClick={handleLogin}
          disabled={loading}
          block
        >
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </div>
    </div>
  );
}
