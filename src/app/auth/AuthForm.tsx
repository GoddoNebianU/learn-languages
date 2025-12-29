"use client";

import { useState, useActionState, startTransition } from "react";
import { useTranslations } from "next-intl";
import { signInAction, signUpAction, SignUpState } from "@/lib/actions/auth";
import Container from "@/components/ui/Container";
import Input from "@/components/ui/Input";
import { LightButton } from "@/components/ui/buttons";
import { authClient } from "@/lib/auth-client";

interface AuthFormProps {
  redirectTo?: string;
}

export default function AuthForm({ redirectTo }: AuthFormProps) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [clearSignIn, setClearSignIn] = useState(false);
  const [clearSignUp, setClearSignUp] = useState(false);

  const [signInState, signInActionForm, isSignInPending] = useActionState(
    async (prevState: SignUpState | undefined, formData: FormData) => {
      if (clearSignIn) {
        setClearSignIn(false);
        return undefined;
      }
      return signInAction(prevState || {}, formData);
    },
    undefined
  );
  const [signUpState, signUpActionForm, isSignUpPending] = useActionState(
    async (prevState: SignUpState | undefined, formData: FormData) => {
      if (clearSignUp) {
        setClearSignUp(false);
        return undefined;
      }
      return signUpAction(prevState || {}, formData);
    },
    undefined
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("invalidEmail");
    }

    if (!password) {
      newErrors.password = t("passwordRequired");
    } else if (password.length < 8) {
      newErrors.password = t("passwordTooShort");
    }

    if (mode === 'signup') {
      if (!name) {
        newErrors.name = t("nameRequired");
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = t("confirmPasswordRequired");
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = t("passwordsNotMatch");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // 基本客户端验证
    if (!validateForm(formData)) {
      return;
    }

    // 添加 redirectTo 到 formData
    if (redirectTo) {
      formData.append("redirectTo", redirectTo);
    }

    // 使用 startTransition 包装 action 调用
    startTransition(() => {
      // 根据模式调用相应的 action
      if (mode === 'signin') {
        signInActionForm(formData);
      } else {
        signUpActionForm(formData);
      }
    });
  };

  const handleGitHubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: redirectTo || "/"
    });
  };

  const currentError = mode === 'signin' ? signInState : signUpState;

  return (
    <div className="h-[calc(100vh-64px)] bg-[#35786f] flex items-center justify-center px-4">
      <Container className="p-8 max-w-md w-full">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t(mode === 'signin' ? 'signIn' : 'signUp')}</h1>
        </div>

        {/* 服务器端错误提示 */}
        {currentError?.message && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {currentError.message}
          </div>
        )}

        {/* 登录/注册表单 */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* 用户名输入（仅注册模式显示） */}
          {mode === 'signup' && (
            <div>
              <Input
                type="text"
                name="name"
                placeholder={t("name")}
                className="w-full px-3 py-2"
              />
              {/* 客户端验证错误 */}
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
              {/* 服务器端验证错误 */}
              {currentError?.errors?.username && (
                <p className="text-red-500 text-sm mt-1">{currentError.errors.username[0]}</p>
              )}
            </div>
          )}

          {/* 邮箱输入 */}
          <div>
            <Input
              type="email"
              name="email"
              placeholder={t("email")}
              className="w-full px-3 py-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            {currentError?.errors?.email && (
              <p className="text-red-500 text-sm mt-1">{currentError.errors.email[0]}</p>
            )}
          </div>

          {/* 密码输入 */}
          <div>
            <Input
              type="password"
              name="password"
              placeholder={t("password")}
              className="w-full px-3 py-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            {currentError?.errors?.password && (
              <p className="text-red-500 text-sm mt-1">{currentError.errors.password[0]}</p>
            )}
          </div>

          {/* 确认密码输入（仅注册模式显示） */}
          {mode === 'signup' && (
            <div>
              <Input
                type="password"
                name="confirmPassword"
                placeholder={t("confirmPassword")}
                className="w-full px-3 py-2"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* 提交按钮 */}
          <LightButton
            type="submit"
            className={`w-full py-2 ${isSignInPending || isSignUpPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSignInPending || isSignUpPending
              ? t("loading")
              : t(mode === 'signin' ? 'signInButton' : 'signUpButton')
            }
          </LightButton>
        </form>

        {/* 第三方登录区域 */}
        <div className="mt-6">
          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>

          {/* GitHub 登录按钮 */}
          <LightButton
            onClick={handleGitHubSignIn}
            className="w-full mt-4 py-2 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {t(mode === 'signin' ? 'signInWithGitHub' : 'signUpWithGitHub')}
          </LightButton>
        </div>

        {/* 模式切换链接 */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setErrors({});
              // 清除服务器端错误状态
              if (mode === 'signin') {
                setClearSignIn(true);
              } else {
                setClearSignUp(true);
              }
            }}
            className="text-[#35786f] hover:underline"
          >
            {mode === 'signin'
              ? `${t("noAccount")} ${t("signUp")}`
              : `${t("hasAccount")} ${t("signIn")}`
            }
          </button>
        </div>
      </Container>
    </div>
  );
}