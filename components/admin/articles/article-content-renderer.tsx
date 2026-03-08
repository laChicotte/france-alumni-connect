"use client"

interface ArticleContentRendererProps {
  html: string
}

export function ArticleContentRenderer({ html }: ArticleContentRendererProps) {
  return (
    <div
      className="
        text-gray-900
        [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight
        [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight
        [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold
        [&_p]:my-4 [&_p]:text-base [&_p]:leading-7
        [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6
        [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6
        [&_li]:my-1
        [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic
        [&_a]:text-[#3558A2] [&_a]:underline
        [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg
      "
      dangerouslySetInnerHTML={{ __html: html || "<p></p>" }}
    />
  )
}

