import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function middleware(request: NextRequest) {
  // 检查是否是 /api 开头的请求
  if (request.nextUrl.pathname.startsWith('/api')) {
    try {
      // 获取目标路径（去掉 /api 前缀）
      const targetPath = request.nextUrl.pathname.replace('/api', '');
      
      // 构建目标 URL
      const targetUrl = `${BACKEND_URL}${targetPath}`;
      const searchParams = request.nextUrl.searchParams.toString();
      const fullTargetUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

      // 获取请求体
      let body: BodyInit | undefined;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.arrayBuffer();
      }

      // 准备请求头
      const headers = new Headers();
      request.headers.forEach((value, key) => {
        // 过滤掉一些不需要转发的头
        if (!['host', 'connection', 'upgrade', 'transfer-encoding', 'content-length'].includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      });

      // 发送代理请求
      const response = await fetch(fullTargetUrl, {
        method: request.method,
        headers,
        body,
      });

      // 创建新的响应头
      const responseHeaders = new Headers();

      // 复制响应头
      response.headers.forEach((value, key) => {
        // 过滤掉一些可能导致问题的头
        if (!['connection', 'transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });

      // 设置 CORS 头（只在没有的情况下设置）
      if (!responseHeaders.has('Access-Control-Allow-Origin')) {
        responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
      }
      if (!responseHeaders.has('Access-Control-Allow-Credentials')) {
        responseHeaders.set('Access-Control-Allow-Credentials', 'true');
      }
      if (!responseHeaders.has('Access-Control-Allow-Methods')) {
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      }
      if (!responseHeaders.has('Access-Control-Allow-Headers')) {
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
      }

      console.log(`🔄 Middleware代理: ${request.method} ${targetPath} -> ${response.status}`);

      // 获取响应体
      const responseBody = await response.arrayBuffer();

      // 返回代理响应
      return new NextResponse(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error: any) {
      console.error('❌ Middleware代理失败:', error.message);
      
      return NextResponse.json(
        { 
          error: 'Middleware代理请求失败', 
          message: error.message,
          target: `${BACKEND_URL}${request.nextUrl.pathname.replace('/api', '')}`
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
