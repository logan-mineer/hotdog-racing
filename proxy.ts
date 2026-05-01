import { NextRequest, NextResponse } from 'next/server'

const BYPASS_COOKIE = 'hr_preview'
const COMING_SOON_PATH = '/coming-soon'

export function proxy(req: NextRequest) {
  if (process.env.COMING_SOON !== 'true' || process.env.VERCEL_ENV !== 'production') return NextResponse.next()

  const { pathname } = req.nextUrl

  if (pathname === COMING_SOON_PATH) return NextResponse.next()

  const previewParam = req.nextUrl.searchParams.get('preview')
  if (previewParam && previewParam === process.env.PREVIEW_SECRET) {
    const res = NextResponse.redirect(new URL('/', req.url))
    res.cookies.set(BYPASS_COOKIE, '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  }

  if (req.cookies.get(BYPASS_COOKIE)?.value === '1') return NextResponse.next()

  return NextResponse.redirect(new URL(COMING_SOON_PATH, req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)'],
}
