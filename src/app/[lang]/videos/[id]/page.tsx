'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../../../components/VideoGallery.module.css'; // Reusing styles
import { Share2, ArrowLeft, Download, Copy, Play, Image as ImageIcon, Check, Loader2, X, Link as LinkIcon } from 'lucide-react';

export default function VideoDetailPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params); // Unwrap params
  const { id, lang } = resolvedParams;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedState, setCopiedState] = useState<{[key: string]: boolean}>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedMedia, setExpandedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Post not found");
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

  const handleDownload = async (url: string, filename: string, id?: string) => {
    if (id) setDownloadingId(id);
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Download failed');
      }

      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
           await navigator.share({
             files: [file],
             title: filename,
           });
           setDownloadingId(null);
           return;
        } catch (shareError: any) {
           if (shareError.name !== 'AbortError') {
              console.warn("Share failed, falling back to download:", shareError);
           } else {
              setDownloadingId(null);
              return;
           }
        }
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error: any) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}`);
    } finally {
      if (id) setDownloadingId(null);
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
       navigator.clipboard.writeText(text).catch(err => console.error("Clipboard copy failed:", err));
    }
    
    setCopiedState(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  const handleSharePage = () => {
     const url = window.location.href;
     handleCopy(url, 'share_page');
  };

  if (loading) return <div className={styles.container}><div style={{color: 'white', textAlign: 'center'}}>Loading...</div></div>;
  if (!post) return <div className={styles.container}><div style={{color: 'white', textAlign: 'center'}}>Video not found.</div></div>;

  return (
    <div className={styles.container}>
       {/* Lightbox Overlay */}
       {expandedMedia && (
        <div 
          className={styles.modalOverlay}
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.9)', cursor: 'zoom-out' }}
          onClick={() => setExpandedMedia(null)}
        >
          {expandedMedia.type === 'image' ? (
            <img 
              src={expandedMedia.url} 
              alt="Expanded View" 
              style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: '8px' }} 
              onClick={(e) => e.stopPropagation()} 
            />
          ) : (
            <video 
              src={expandedMedia.url} 
              controls 
              autoPlay
              style={{ maxWidth: '95vw', maxHeight: '95vh', borderRadius: '8px' }} 
              onClick={(e) => e.stopPropagation()} 
            />
          )}

          <button 
             onClick={() => setExpandedMedia(null)}
             className={styles.closeBtn}
             style={{ background: 'white' }}
          >
            <X size={24} color="black" />
          </button>
        </div>
      )}

       <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <button 
                onClick={() => router.back()} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  background: 'transparent', border: 'none', color: '#64748b', 
                  cursor: 'pointer', fontSize: '1rem', fontWeight: 500
                }}
            >
                <ArrowLeft size={20} /> Back
            </button>

            <button 
                onClick={handleSharePage}
                className={styles.actionBtn}
                style={{
                  background: copiedState['share_page'] ? '#22c55e' : 'white',
                  color: copiedState['share_page'] ? 'white' : 'var(--text-heading)',
                  borderColor: copiedState['share_page'] ? '#22c55e' : 'var(--border-color)',
                  height: '40px'
                }}
            >
                {copiedState['share_page'] ? <Check size={18} /> : <Share2 size={18} />}
                {copiedState['share_page'] ? 'Link Copied' : 'Share Page'}
            </button>
          </div>

          {/* Media Grid */}
          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem', 
              marginBottom: '2.5rem' 
          }}>
            {/* 1. Cover Image */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div 
                  style={{ aspectRatio: '16/9', background: '#f1f5f9', position: 'relative', cursor: 'pointer' }}
                  onClick={() => setExpandedMedia({ type: 'image', url: post.coverImageUrl })}
                >
                  <img src={post.coverImageUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, inset: 'auto 0 0 0', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', color: 'white', padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}>
                    View Cover
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <button 
                    className={styles.actionBtn} 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleDownload(post.coverImageUrl, `cover_${post.title}.jpg`, 'cover')}
                    disabled={downloadingId === 'cover'}
                  >
                    {downloadingId === 'cover' ? <Loader2 size={16} className={styles.spin} /> : <ImageIcon size={16} />}
                    {downloadingId === 'cover' ? 'Saving...' : 'Save Image'}
                  </button>
                </div>
            </div>

            {/* 2. English Video */}
            {post.videoUrlEn && (
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div 
                    style={{ aspectRatio: '16/9', background: '#000', position: 'relative', cursor: 'pointer' }}
                    onClick={() => setExpandedMedia({ type: 'video', url: post.videoUrlEn })}
                  >
                    <video src={post.videoUrlEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '0.75rem' }}>
                        <Play size={24} fill="white" color="white" />
                      </div>
                    </div>
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      English
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <button 
                      className={`${styles.actionBtn} ${styles.primaryBtn}`}
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleDownload(post.videoUrlEn, `video_en_${post.title}.mp4`, 'video_en')}
                      disabled={downloadingId === 'video_en'}
                    >
                      {downloadingId === 'video_en' ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
                      {downloadingId === 'video_en' ? 'Preparing...' : 'Download EN'}
                    </button>
                  </div>
              </div>
            )}

            {/* 3. Chinese Video */}
            {post.videoUrlZh && (
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div 
                    style={{ aspectRatio: '16/9', background: '#000', position: 'relative', cursor: 'pointer' }}
                    onClick={() => setExpandedMedia({ type: 'video', url: post.videoUrlZh })}
                  >
                    <video src={post.videoUrlZh} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '0.75rem' }}>
                        <Play size={24} fill="white" color="white" />
                      </div>
                    </div>
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      Chinese
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <button 
                      className={`${styles.actionBtn} ${styles.primaryBtn}`}
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleDownload(post.videoUrlZh, `video_zh_${post.title}.mp4`, 'video_zh')}
                      disabled={downloadingId === 'video_zh'}
                    >
                      {downloadingId === 'video_zh' ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
                      {downloadingId === 'video_zh' ? 'Preparing...' : 'Download CN'}
                    </button>
                  </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0, lineHeight: 1.2 }}>{post.title}</h1>
                <button 
                    className={styles.actionBtn}
                    onClick={() => handleCopy(post.title, 'title')}
                    style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem',
                        background: copiedState['title'] ? '#22c55e' : 'white',
                        color: copiedState['title'] ? 'white' : 'inherit',
                        borderColor: copiedState['title'] ? '#22c55e' : 'var(--border-color)'
                    }}
                >
                    {copiedState['title'] ? <Check size={14} /> : <Copy size={14} />}
                </button>
             </div>

             <div style={{ height: '1px', background: '#f1f5f9', margin: '2rem 0' }}></div>

             {/* Descriptions */}
             <div className={styles.sectionTitle}>XHS Description</div>
             <div className={styles.copyRow} style={{ marginTop: '0.5rem' }}>
                <div className={styles.textContent}>{post.content}</div>
                <button 
                    className={styles.actionBtn}
                    onClick={() => handleCopy(post.content, 'content')}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                    {copiedState['content'] ? <Check size={14} /> : <Copy size={14} />}
                </button>
             </div>

             <div className={styles.sectionTitle}>XHS Hashtags</div>
             <div className={styles.copyRow} style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
                <div className={styles.textContent}>{post.hashtags}</div>
                <button 
                    className={styles.actionBtn}
                    onClick={() => handleCopy(post.hashtags, 'hashtags')}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                    {copiedState['hashtags'] ? <Check size={14} /> : <Copy size={14} />}
                </button>
             </div>

             {/* TikTok Fields */}
             {(post.tiktokDescription || post.tiktokHashtags) && (
               <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed #f1f5f9' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>TikTok Version</h3>
                  
                  {post.tiktokDescription && (
                    <>
                      <div className={styles.sectionTitle}>TikTok Description</div>
                      <div className={styles.copyRow} style={{ marginTop: '0.5rem' }}>
                         <div className={styles.textContent}>{post.tiktokDescription}</div>
                         <button 
                            className={styles.actionBtn}
                            onClick={() => handleCopy(post.tiktokDescription, 'tiktok_desc')}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                         >
                            {copiedState['tiktok_desc'] ? <Check size={14} /> : <Copy size={14} />}
                         </button>
                      </div>
                    </>
                  )}

                  {post.tiktokHashtags && (
                    <>
                      <div className={styles.sectionTitle}>TikTok Hashtags</div>
                      <div className={styles.copyRow} style={{ marginTop: '0.5rem' }}>
                         <div className={styles.textContent}>{post.tiktokHashtags}</div>
                         <button 
                            className={styles.actionBtn}
                            onClick={() => handleCopy(post.tiktokHashtags, 'tiktok_tags')}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                         >
                            {copiedState['tiktok_tags'] ? <Check size={14} /> : <Copy size={14} />}
                         </button>
                      </div>
                    </>
                  )}
               </div>
             )}
          </div>
       </div>
    </div>
  );
}
