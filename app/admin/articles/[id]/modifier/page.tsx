"use client"

import { useParams } from "next/navigation"
import { ArticleEditorScreen } from "@/components/admin/articles/article-editor-screen"

export default function EditArticlePage() {
  const params = useParams<{ id: string }>()
  return <ArticleEditorScreen articleId={params.id} />
}

