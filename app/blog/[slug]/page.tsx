import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { getAllSlugs, getPostBySlug } from '@/lib/blog/posts'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const slugs = getAllSlugs()
  if (!slugs.includes(slug)) return {}

  const post = getPostBySlug(slug)
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | Hotdog Racing`,
      description: post.description,
      url: `https://hotdog-racing.com/blog/${slug}`,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const slugs = getAllSlugs()
  if (!slugs.includes(slug)) notFound()

  const post = getPostBySlug(slug)
  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <article className="py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-1.5 font-mono text-xs transition-colors hover:text-accent"
          style={{ color: 'var(--muted)' }}
        >
          ← All Posts
        </Link>

        <div className="mb-8 flex items-center gap-3">
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

        <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl" style={{ color: 'var(--foreground)' }}>
          {post.title}
        </h1>
        <p className="mb-12 text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
          {post.description}
        </p>

        <div className="prose-content">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mt-10 mb-4 text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 mb-3 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-5 leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-5 space-y-1 pl-5 list-disc" style={{ color: 'var(--muted)' }}>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-5 space-y-1 pl-5 list-decimal" style={{ color: 'var(--muted)' }}>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              code: ({ children }) => (
                <code
                  className="rounded px-1.5 py-0.5 font-mono text-sm"
                  style={{ background: 'var(--surface-2)', color: 'var(--foreground)' }}
                >
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre
                  className="mb-5 overflow-x-auto rounded-lg p-4 font-mono text-sm"
                  style={{ background: 'var(--surface-2)', color: 'var(--foreground)' }}
                >
                  {children}
                </pre>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-accent underline underline-offset-2 hover:text-accent-700"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold" style={{ color: 'var(--foreground)' }}>
                  {children}
                </strong>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  )
}
