import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { articles } from "@/lib/fake-data"
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react"

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = articles.find((a) => a.id === params.id)

  if (!article) {
    notFound()
  }

  // Get related articles (same category, excluding current)
  const relatedArticles = articles.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="bg-muted py-4 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/actualites">
            <Button variant="ghost" className="hover:bg-background">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux actualités
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-[#0055A4]/10 text-[#0055A4] text-sm font-semibold rounded-full">
              {article.category}
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-6 text-balance">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{article.date}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-xl overflow-hidden">
            <img src={article.image || "/placeholder.svg"} alt={article.title} className="w-full h-96 object-cover" />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">{article.excerpt}</p>

            <div className="space-y-6 text-foreground leading-relaxed">
              <p>{article.content}</p>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </p>

              <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Un parcours inspirant</h2>

              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                laborum.
              </p>

              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
                rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
                explicabo.
              </p>

              <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Conseils pour les futurs alumni</h2>

              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
                dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia
                dolor sit amet, consectetur, adipisci velit.
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Restez connecté avec le réseau France Alumni</li>
                <li>N'hésitez pas à demander conseil aux anciens</li>
                <li>Participez activement aux événements du réseau</li>
                <li>Partagez vos expériences avec les nouveaux membres</li>
              </ul>
            </div>
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold">Partager cet article</h3>
              <div className="flex gap-3">
                <Button size="icon" variant="outline" className="hover:bg-[#0055A4] hover:text-white bg-transparent">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" className="hover:bg-[#0055A4] hover:text-white bg-transparent">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" className="hover:bg-[#0055A4] hover:text-white bg-transparent">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" className="hover:bg-[#0055A4] hover:text-white bg-transparent">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold mb-8">Articles similaires</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <Card key={relatedArticle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={relatedArticle.image || "/placeholder.svg"}
                    alt={relatedArticle.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="pt-6">
                    <div className="inline-block px-3 py-1 bg-[#0055A4]/10 text-[#0055A4] text-xs font-semibold rounded-full mb-3">
                      {relatedArticle.category}
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-2 line-clamp-2">
                      <Link href={`/actualites/${relatedArticle.id}`} className="hover:text-[#0055A4]">
                        {relatedArticle.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{relatedArticle.excerpt}</p>
                    <Link
                      href={`/actualites/${relatedArticle.id}`}
                      className="text-[#0055A4] font-semibold hover:underline text-sm"
                    >
                      Lire plus →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
