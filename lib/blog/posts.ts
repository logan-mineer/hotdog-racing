import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post, PostMeta } from './types'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

function parsePost(filename: string): PostMeta {
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8')
  const { data } = matter(raw)
  const slug = filename.replace(/\.md$/, '')
  return {
    title: data.title as string,
    date: data.date as string,
    slug,
    description: data.description as string,
    type: data.type as PostMeta['type'],
  }
}

export function getAllPosts(): PostMeta[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(parsePost)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post {
  const filename = `${slug}.md`
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8')
  const { data, content } = matter(raw)
  return {
    title: data.title as string,
    date: data.date as string,
    slug,
    description: data.description as string,
    type: data.type as PostMeta['type'],
    content,
  }
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
}
