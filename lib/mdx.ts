import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content')

export interface ProjectFrontmatter {
  title: string
  description: string
  tags: string[]
  date: string
  github?: string
  live?: string
  featured?: boolean
}

export interface BlogFrontmatter {
  title: string
  date: string
  summary: string
  tags: string[]
  draft?: boolean
}

export interface ContentItem<T> {
  slug: string
  frontmatter: T
  content: string
}

function readDir(dir: string): string[] {
  const full = path.join(contentDir, dir)
  if (!fs.existsSync(full)) return []
  return fs.readdirSync(full).filter((f) => f.endsWith('.mdx'))
}

function parseFile<T>(dir: string, filename: string): ContentItem<T> {
  const filePath = path.join(contentDir, dir, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug: filename.replace(/\.mdx$/, ''),
    frontmatter: data as T,
    content,
  }
}

export function getAllProjects(): ContentItem<ProjectFrontmatter>[] {
  return readDir('projects')
    .map((f) => parseFile<ProjectFrontmatter>('projects', f))
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

export function getProjectBySlug(slug: string): ContentItem<ProjectFrontmatter> | null {
  const filename = `${slug}.mdx`
  const filePath = path.join(contentDir, 'projects', filename)
  if (!fs.existsSync(filePath)) return null
  return parseFile<ProjectFrontmatter>('projects', filename)
}

export function getAllPosts(): ContentItem<BlogFrontmatter>[] {
  return readDir('blog')
    .map((f) => parseFile<BlogFrontmatter>('blog', f))
    .filter((p) => !p.frontmatter.draft)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

export function getPostBySlug(slug: string): ContentItem<BlogFrontmatter> | null {
  const filename = `${slug}.mdx`
  const filePath = path.join(contentDir, 'blog', filename)
  if (!fs.existsSync(filePath)) return null
  return parseFile<BlogFrontmatter>('blog', filename)
}

export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min read`
}
