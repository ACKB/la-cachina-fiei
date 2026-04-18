import { getFileFromR2 } from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const key = resolvedParams.key.join("/");
    
    const result = await getFileFromR2(key);
    
    if (!result.Body) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // AWS SDK v3 permite convertir el stream a Web Stream usando transformToWebStream()
    const stream = result.Body.transformToWebStream();

    return new NextResponse(stream, {
      headers: {
        "Content-Type": result.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching image from R2:", error);
    return new NextResponse("Not Found", { status: 404 });
  }
}
