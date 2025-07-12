export interface Blog {
  id: string;
  title: string;
  image?: string;
  excerpt: string;
  category: string;
  content: string;
  readTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogResponse {
  message: string;
  blogs: BlogPost[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  content: string;
  readTime: string;
  createdAt: string;
  date: string;
  category: string;
}

export interface ClientBlogPageProps {
  blog: BlogPost;
}

export interface BlogFormProps {
  blogId?: string;
  onSuccess: () => void;
  blogString?: string;
}

