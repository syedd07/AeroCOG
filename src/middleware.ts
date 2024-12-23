import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If you only need special handling for PayU POST callbacks,
  // do that in your /api/payu/callback route, not here.
  // Regular GET requests to /success or /failure pages should just pass through:
  if (pathname.startsWith("/success") || pathname.startsWith("/failure")) {
    // Let normal requests proceed without modifying headers
    return NextResponse.next();
  }
  
  // Default response for other routes
  return NextResponse.next();
}

// If you don't need middleware for /success or /failure at all,
// you can remove them from the matcher array below.
export const config = {
  // Remove "/success", "/failure" if not needed here
  matcher: ["/success", "/failure"], 
};
