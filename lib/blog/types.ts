export type PostType = 'post' | 'guide'

export type PostMeta = {
  title: string
  date: string
  slug: string
  description: string
  type: PostType
}

export type Post = PostMeta & {
  content: string
}
