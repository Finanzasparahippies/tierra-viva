import { getPostBySlug, getPosts } from "@/lib/api";
export const dynamic = "force-dynamic";
import { BlogPost } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShareButtons } from "@/components/blog/ShareButtons";

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    let post: BlogPost;
    let relatedPosts: BlogPost[] = [];

    try {
        post = await getPostBySlug(slug);
        const allPosts = await getPosts();
        relatedPosts = allPosts
            .filter((p: BlogPost) => p.slug !== slug && p.is_public)
            .slice(0, 3);
    } catch (error) {
        console.error("Failed to fetch post or related posts:", error);
        notFound();
    }

    if (!post) {
        notFound();
    }

    return (
        <div className="bg-background min-h-screen pb-24">
            <article className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
                {/* Back Button */}
                <div className="mb-12">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium group text-sm"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Volver al Blog
                    </Link>
                </div>

                {/* Header section with image and title */}
                <header className="mb-12 text-center space-y-6">
                    <div className="text-sm font-bold text-primary uppercase tracking-[0.2em] bg-primary/10 w-fit mx-auto px-6 py-2 rounded-full">
                        Actualizaciones
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight text-balance leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm font-medium">
                        <time dateTime={post.created_at} className="bg-muted/50 px-3 py-1 rounded-lg">
                            {new Date(post.created_at).toLocaleDateString("es-MX", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                        <span className="bg-muted/50 px-3 py-1 rounded-lg">Por {post.author_name || "Equipo TierraViva"}</span>
                    </div>
                </header>

                {post.image_url && (
                    <div className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl shadow-primary/10 group">
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                )}

                {/* Rich Text Content */}
                <div
                    className="rich-text-content max-w-none text-xl leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <footer className="mt-20 pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/20 border border-border/40">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">TV</div>
                        <div>
                            <p className="font-black text-lg">TierraViva</p>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Conservation & Rescue</p>
                        </div>
                    </div>

                    <ShareButtons title={post.title} url={`https://tierraviva.com.mx/blog/${post.slug}`} />
                </footer>
            </article>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
                <section className="max-w-6xl mx-auto px-4 mt-24 pt-24 border-t border-border/50">
                    <div className="flex items-end justify-between mb-12">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black tracking-tight">Post Relacionados</h2>
                            <p className="text-muted-foreground font-medium">Sigue leyendo sobre nuestras aventuras y rescates.</p>
                        </div>
                        <Link href="/blog" className="hidden sm:block text-primary font-bold hover:underline underline-offset-4">
                            Ver todo el blog &rarr;
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {relatedPosts.map((related) => (
                            <Link
                                key={related.id}
                                href={`/blog/${related.slug}`}
                                className="group space-y-4 block"
                            >
                                <div className="aspect-[16/10] bg-muted rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500">
                                    {related.image_url ? (
                                        <img
                                            src={related.image_url}
                                            alt={related.title}
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20 bg-secondary">🌿</div>
                                    )}
                                </div>
                                <div className="space-y-2 px-2">
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest">
                                        {new Date(related.created_at).toLocaleDateString("es-MX", { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {related.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
