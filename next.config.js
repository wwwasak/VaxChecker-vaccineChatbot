/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 忽略类型错误
  },
  // 添加输出配置
  output: 'standalone',
  // 忽略 ESLint 错误
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 忽略构建错误
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
  // 添加动态路由配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // 更新重写规则
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      }
    ];
  },
  // 添加路由排除
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // 排除不需要的路由
  excludeDefaultMomentLocales: true,
  // 添加构建时排除
  webpack: (config, { isServer }) => {
    // 排除不需要的路由
    if (isServer) {
      config.externals = ['@auth/github-provider', ...config.externals];
    }
    return config;
  },
}

module.exports = nextConfig; 