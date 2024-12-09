import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow PayU's origin for success and failure pages
  if (pathname.startsWith("/success") || pathname.startsWith("/failure")) {
    const response = NextResponse.next();
    response.headers.set("x-forwarded-host", "test.payu.in",);
    return response;
  }
  console.log("Middleware executed for:", request.nextUrl.href);
  // Default response for other routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/success", "/failure"], // Middleware applies only to these routes
};
