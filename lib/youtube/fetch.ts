export type Episode = {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string
  videoUrl: string
}

type PlaylistItemsResponse = {
  items: Array<{
    snippet: {
      title: string
      description: string
      publishedAt: string
      thumbnails: {
        default?: { url: string }
        medium?: { url: string }
        high?: { url: string }
        maxres?: { url: string }
      }
      resourceId: {
        videoId: string
      }
    }
  }>
}

export async function fetchEpisodes(): Promise<Episode[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error(
      'YOUTUBE_API_KEY is not set. Add it to .env.local locally and to Vercel project settings.'
    )
  }

  const playlistId = process.env.YOUTUBE_PLAYLIST_ID
  if (!playlistId) {
    throw new Error(
      'YOUTUBE_PLAYLIST_ID is not set. Add it to .env.local locally and to Vercel project settings.'
    )
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`,
    { cache: 'force-cache' }
  )
  if (!res.ok) {
    throw new Error(`YouTube playlistItems API failed: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as PlaylistItemsResponse

  return (data.items ?? []).map(item => {
    const s = item.snippet
    const thumbnail =
      s.thumbnails.maxres?.url ??
      s.thumbnails.high?.url ??
      s.thumbnails.medium?.url ??
      s.thumbnails.default?.url ??
      ''
    return {
      id: s.resourceId.videoId,
      title: s.title,
      description: s.description,
      thumbnailUrl: thumbnail,
      publishedAt: s.publishedAt,
      videoUrl: `https://www.youtube.com/watch?v=${s.resourceId.videoId}`,
    }
  })
}
