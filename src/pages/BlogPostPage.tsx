import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, User, Calendar, ArrowLeft, Share2, ShieldCheck, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getBlogPostBySlug, resolveSlugRedirect } from '../services/slugService';
import { BlogPost } from '../types/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotFoundPage } from './NotFoundPage';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check lowercase normalization
      if (slug !== slug.toLowerCase()) {
        navigate(`/blog/${slug.toLowerCase()}`, { replace: true });
        return;
      }

      // Check historical 301 redirect
      const redirect = await resolveSlugRedirect('blog', slug);
      if (redirect) {
        navigate(redirect.targetUrl, { replace: true });
        return;
      }

      const fetchedPost = await getBlogPostBySlug(slug);
      if (!fetchedPost) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(fetchedPost);
      setLoading(false);
    }

    resolve();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 text-white">
        <div className="w-10 h-10 border-4 border-bee-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Blog', url: '/blog' },
    { label: post.title, url: `/blog/${post.slug}`, current: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SeoHead
        title={`${post.title} | DriverBee`}
        description={post.excerpt}
        canonicalUrl={`https://driverbee.in/blog/${post.slug}`}
        ogImage={post.cover_image}
        ogType="article"
        breadcrumbs={breadcrumbs}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image,
          datePublished: post.published_at,
          author: {
            '@type': 'Person',
            name: post.author,
          },
          publisher: {
            '@type': 'Organization',
            name: 'DriverBee',
            logo: {
              '@type': 'ImageObject',
              url: 'https://driverbee.in/driverbee-official-logo.png',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://driverbee.in/blog/${post.slug}`,
          },
        }}
      />

      <Header selectedCity="Warangal, Telangana" onOpenCitySelector={() => {}} />

      <main className="flex-1 max-w-[860px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        <article className="bg-white rounded-3xl border border-navy-200 p-6 sm:p-10 shadow-xs mb-10">
          <div className="inline-block px-3 py-1 rounded-lg bg-bee-50 text-bee-700 font-bold text-xs uppercase tracking-wider mb-3">
            {post.category}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-navy-500 pb-6 border-b border-navy-100 mb-6">
            <span className="flex items-center gap-1.5 text-navy-800">
              <User className="w-4 h-4 text-bee-600" />
              <span>{post.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-navy-400" />
              <span>{post.read_time}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-navy-400" />
              <span>{new Date(post.published_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </span>
          </div>

          {post.cover_image && (
            <div className="h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 bg-navy-900">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-navy max-w-none text-navy-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
            {post.content}
          </div>

          {/* Book Driver CTA in Article */}
          <div className="mt-10 p-6 sm:p-8 bg-navy-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold">Ready to Experience Hassle-Free Travel?</h3>
              <p className="text-xs text-navy-300 mt-1">Book a background-verified driver for your car in 30 seconds.</p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-bee-600 hover:bg-bee-500 text-navy-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
            >
              Book a Driver Now
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};
