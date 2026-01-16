
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download';

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const headers = new Headers();
    
    // RFC 5987 standard for encoding filenames with special characters (emojis, non-ASCII)
    const encodedFilename = encodeURIComponent(filename).replace(/['()]/g, escape).replace(/\*/g, '%2A');
    
    // Use a completely safe fallback name to prevent ANY encoding crashes in the basic header
    const ext = filename.split('.').pop() || 'dat';
    const fallbackFilename = `file_download.${ext}`;

    headers.set('Content-Disposition', `attachment; filename="${fallbackFilename}"; filename*=UTF-8''${encodedFilename}`);
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', buffer.length.toString());

    return new NextResponse(buffer, {
      status: 200,
      headers: headers,
    });

  } catch (error: any) {
    console.error('Download proxy error for URL:', url, error);
    return NextResponse.json({ 
        error: 'Failed to download file', 
        details: error.message || String(error) 
    }, { status: 500 });
  }
}
