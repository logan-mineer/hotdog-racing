import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog/posts'
import type { PostMeta } from '@/lib/blog/types'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides, posts, and how-tos on RC drift setup and tuning.',
  openGraph: {
    title: 'Blog | Hotdog Racing',
    description: 'Guides, posts, and how-tos on RC drift setup and tuning.',
    url: 'https://hotdog-racing.com/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 font-mono text-xs tracking-[0.25em] text-accent uppercase">Blog</p>
        <h1 className="mb-10 text-3xl font-bold sm:text-4xl" style={{ color: 'var(--foreground)' }}>
          Posts &amp; Guides
        </h1>

        {posts.length === 0 ? (
          <p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
            No posts yet.
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PostCard({ post }: { post: PostMeta }) {
  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border p-6 transition-colors hover:border-accent"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          className="font-mono text-xs px-2 py-0.5 rounded-full capitalize"
          style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
        >
          {post.type}
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          {date}
        </span>
      </div>
      <h2
        className="mb-2 font-semibold leading-snug transition-colors group-hover:text-accent"
        style={{ color: 'var(--foreground)' }}
      >
        {post.title}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        {post.description}
      </p>
    </Link>
  )
}
