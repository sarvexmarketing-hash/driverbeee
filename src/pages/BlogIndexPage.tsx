import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, User, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getAllBlogPosts } from '../services/slugService';
import { BlogPost } from '../types/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const BlogIndexPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllBlogPosts();
        setPosts(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const breadcrumbs = [
    { label: 'Blog & Driver Guides', url: '/blog', current: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SeoHead
        title="DriverBee Blog — Car Chauffeur Guides, Highway Travel & Vehicle Care"
        description="Expert insights on hiring verified personal car drivers, highway safety tips for Telangana & AP, and automatic transmission care."
        canonicalUrl="https://driverbee.in/blog"
        breadcrumbs={breadcrumbs}
      />

      <Header selectedCity="Warangal, Telangana" onOpenCitySelector={() => {}} />

      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-6 sm:p-10 mb-10 shadow-xl border border-navy-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bee-500/20 text-bee-400 font-bold text-xs uppercase tracking-wider mb-4 border border-bee-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>DriverBee Editorial &amp; Safety Guides</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Car Care, Highway Travel &amp; Chauffeur Insights
          </h1>
          <p className="text-sm sm:text-base text-navy-200 max-w-2xl leading-relaxed">
            Essential guides from professional highway drivers and automotive experts to help you travel safer and smarter in your personal vehicle.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-navy-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-navy-200 overflow-hidden shadow-xs hover:shadow-card transition-all flex flex-col group"
              >
                <div className="h-48 bg-navy-900 overflow-hidden relative">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-navy-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.read_time}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{post.author}</span>
                      </span>
                    </div>

                    <h2 className="text-base font-extrabold text-navy-950 mb-2 group-hover:text-bee-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-xs text-navy-600 leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-bee-700 hover:text-bee-800 pt-3 border-t border-navy-100"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
