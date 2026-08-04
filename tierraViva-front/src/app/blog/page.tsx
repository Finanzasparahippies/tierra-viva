
import Link from "next/link";
export const dynamic = "force-dynamic";
import { getPosts } from "@/lib/api";
import { BlogPost } from "@/lib/types";

export default async function BlogPage() {
    let posts: BlogPost[] = [];
    try {
        posts = await getPosts();
    } catch (error) {
        console.error("Failed to fetch posts:", error);
    }
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-center mb-8">Blog TierraViva</h1>

            <div className="grid md:grid-cols-2 gap-10">
                {posts.map((post) => (
                    <article key={post.id} className="group border border-border/40 rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                        <div className="aspect-video bg-muted relative overflow-hidden">
                            {post.image_url ? (
                                <img src={post.image_url} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-4xl opacity-20">📝</div>
                            )}
                        </div>
                        <div className="p-8">
                            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 px-3 py-1 bg-primary/10 w-fit rounded-full">
                                {new Date(post.created_at).toLocaleDateString("es-MX", { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                            </h2>
                            <p className="text-muted-foreground line-clamp-2 text-balance mb-6">
                                {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                            </p>
                            <Link href={`/blog/${post.slug}`} className="group/btn inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                Leer artículo completo <span className="text-xl">→</span>
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
