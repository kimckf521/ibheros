'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../../../components/VideoGallery.module.css'; // Reusing styles
import { Share2, ArrowLeft } from 'lucide-react';

export default function VideoDetailPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params); // Unwrap params
  const { id, lang } = resolvedParams;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Handle Not Found
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleShare = () => {
     const url = window.location.href;
     
     // 1. Copy to clipboard
     if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
           setCopied(true);
           setTimeout(() => setCopied(false), 2000);
        });
     }

     // 2. Show Prompt
     window.prompt("Share this page:", url);
  };

  if (loading) return <div className={styles.container}><div style={{color: 'white', textAlign: 'center'}}>Loading...</div></div>;
  if (!post) return <div className={styles.container}><div style={{color: 'white', textAlign: 'center'}}>Video not found.</div></div>;

  return (
    <div className={styles.container}>
       <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Back Button */}
          <button 
             onClick={() => router.back()} 
             style={{ 
               display: 'flex', alignItems: 'center', gap: '0.5rem', 
               background: 'transparent', border: 'none', color: '#64748b', 
               cursor: 'pointer', marginBottom: '1rem', fontSize: '1rem' 
             }}
          >
             <ArrowLeft size={20} /> Back to Gallery
          </button>

          {/* Video Player */}
          <div style={{ background: 'black', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
             <video 
                src={post.videoUrl} 
                controls 
                autoPlay 
                style={{ width: '100%', aspectRatio: '16/9', display: 'block' }} 
             />
          </div>

          {/* Content */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1.3, flex: 1 }}>{post.title}</h1>
                
                <button 
                   onClick={handleShare}
                   style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 1rem', borderRadius: '0.5rem',
                      background: copied ? '#22c55e' : 'white',
                      color: copied ? 'white' : '#1e293b',
                      border: `1px solid ${copied ? '#22c55e' : '#e2e8f0'}`,
                      cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
                   }}
                >
                   <Share2 size={18} />
                   {copied ? 'Copied Link' : 'Share Page'}
                </button>
             </div>

             <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Posted on {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : ''}
             </div>

             {post.hashtags && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                   {post.hashtags.split(' ').map((tag: string, i: number) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                   ))}
                </div>
             )}

             <div style={{ marginTop: '2rem', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-wrap' }}>
                {post.content}
             </div>
          </div>
       </div>
    </div>
  );
}
