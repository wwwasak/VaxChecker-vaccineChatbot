import { signIn } from 'next-auth/react';

const handleGithubLogin = async () => {
  try {
    await signIn('github', { callbackUrl: '/' });
  } catch (error) {
    console.error('GitHub login error:', error);
  }
};

// 在组件的 JSX 中添加 GitHub 登录按钮
<button
  type="button"
  onClick={handleGithubLogin}
  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
>
  Sign in with GitHub
</button> 