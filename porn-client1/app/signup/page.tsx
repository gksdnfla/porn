"use client";

// Components
import Link from "next/link";
import Image from "next/image";
import { Input, Checkbox, Button } from "antd";

// Styles
import styles from "./SignupPage.module.css";

export default function SignupPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1C1D21]">
      <div className="w-[360px] flex flex-col items-center">
        <Image
          className="mb-[15px]"
          src="/login-logo.png"
          alt="logo"
          width={149}
          height={63}
        />
        <Input className={styles.input} placeholder="아이디를 입력해주세요." />
        <Input
          className={styles.input}
          type="password"
          placeholder="비밀번호를 입력해주세요."
        />
        <Input
          className={styles.input}
          type="password"
          placeholder="비밀번호를 재 입력해주세요."
        />
        <Input className={styles.input} placeholder="닉네임을 입력해주세요." />
        <Input
          className={styles.input}
          placeholder="이메일 주소를 입력해주세요."
        />
        <Button className={styles["signup-button"]} type="primary">
          회원가입
        </Button>
      </div>
    </div>
  );
}
