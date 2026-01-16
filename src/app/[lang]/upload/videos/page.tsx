'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../../../components/VideoGallery.module.css';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Download, Copy, X, Play, Image as ImageIcon, Edit, CheckCircle, Check, LayoutGrid, List, Share2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  hashtags: string;
  coverImageUrl: string;
  videoUrl: string;
  isUsed?: boolean;
  usedAt?: any;
  createdAt: any;
}

export default function VideoGalleryPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [expandedMedia, setExpandedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [copiedState, setCopiedState] = useState<{[key: string]: boolean}>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Helper to fetch posts (extracted to reuse after updates)
  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedPosts: Post[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    try {
      // 1. Fetch file as Blob (using Proxy to bypass CORS)
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Download failed');
      }

      const blob = await response.blob();

      // 2. Try Native Share (Mobile - Save to Photos)
      const file = new File([blob], filename, { type: blob.type });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
           await navigator.share({
             files: [file],
             title: filename,
           });
           return; // Success, stop here
        } catch (shareError: any) {
           if (shareError.name !== 'AbortError') {
              console.warn("Share failed, falling back to download:", shareError);
           } else {
              return; // User cancelled share
           }
        }
      }

      // 3. Fallback: Direct Download (Desktop)
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error: any) {
      console.error("Download/Share error:", error);
      alert(`Action failed: ${error.message}`);
    }
  };

  const handleCopy = (text: string, field: string) => {
    // Try to copy, but don't crash if it fails (e.g. non-secure context)
    if (navigator.clipboard && navigator.clipboard.writeText) {
       navigator.clipboard.writeText(text).catch(err => console.error("Clipboard copy failed:", err));
    }
    
    // Always show visual feedback
    setCopiedState(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  const handleEdit = () => {
    if (selectedPost) {
      router.push(`/upload/edit/${selectedPost.id}`);
    }
  };

  const handleUsedToggle = async () => {
    if (!selectedPost) return;
    try {
      const newStatus = !selectedPost.isUsed;
      const postRef = doc(db, "posts", selectedPost.id);
      
      const updates: any = { isUsed: newStatus };
      if (newStatus) {
         updates.usedAt = serverTimestamp();
      } else {
         updates.usedAt = null;
      }

      await updateDoc(postRef, updates);

      const updatedPost = { 
          ...selectedPost, 
          isUsed: newStatus,
          usedAt: newStatus ? { seconds: Date.now() / 1000 } : null 
      };
      
      setSelectedPost(updatedPost);
      setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));

    } catch (error) {
      console.error("Error updating used status:", error);
      alert("Failed to update status.");
    }
  };

  // Move params hook usage to top if needed, or use window properties since strict composition isn't needed for 'lang' here if simpler, but let's use the URL for lang for robustness or params if available.
  // Actually page.tsx usually has params prop in Next.js, or we use useParams().
  // Let's use useParams() which comes from 'next/navigation'.

  const params = useParams(); // Need to import this.

  const handleShare = async (post: Post) => {
     if (!post.id) return;
     
     // Construct the DETAIL PAGE URL
     // Assuming structure is domain/[lang]/videos/[id]
     // We can get [lang] from params or URL.
     const lang = params?.lang || 'en'; // Default fallback
     const detailUrl = `${window.location.origin}/${lang}/videos/${post.id}`;
     
     // 1. Try to copy to clipboard automatically
     if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(detailUrl)
          .then(() => {
             // 2. Visual Feedback
             setCopiedState(prev => ({ ...prev, ['share_link']: true }));
             setTimeout(() => {
               setCopiedState(prev => ({ ...prev, ['share_link']: false }));
             }, 2000);
          })
          .catch(() => {
             // Fallback if clipboard fails
          });
     }

     // 3. ALWAYS Show the link
     window.prompt("Share this video link:", detailUrl);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.seconds) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      {/* Lightbox Overlay */}
      {expandedMedia && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
            background: 'rgba(0,0,0,0.9)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
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
             style={{
               position: 'absolute',
               top: '1rem',
               right: '1rem',
               background: 'white',
               border: 'none',
               borderRadius: '50%',
               width: '40px',
               height: '40px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               cursor: 'pointer'
             }}
          >
            <X size={24} color="black" />
          </button>
        </div>
      )}

      <header className={styles.header}>
        <h1 className={styles.title}>Uploaded Videos</h1>
        <p className={styles.subtitle}>Browse, download, and copy content for your posts.</p>
        <br/>
        <a href="/upload" className={styles.actionBtn} style={{display: 'inline-flex', padding: '0.75rem 1.5rem', background: '#000', color: '#fff', textDecoration: 'none'}}>
           + Upload New Video
        </a>
      </header>

      {/* View Toggle Controls */}
      {!loading && posts.length > 0 && (
        <div className={styles.viewControls}>
           <div className={styles.toggleGroup}>
              <button 
                className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={20} />
              </button>
           </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading...</div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className={styles.grid}>
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className={styles.card}
                  onClick={() => setSelectedPost(post)}
                  style={{ paddingBottom: 0, position: 'relative' }} 
                >
                  <div className={styles.cardImageContainer} style={{ paddingBottom: '56.25%' }}> 
                    {post.coverImageUrl ? (
                      <img src={post.coverImageUrl} alt={post.title} className={styles.cardImage} />
                    ) : (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        No Cover
                      </div>
                    )}
                    
                    {/* USED Overlay */}
                    {post.isUsed && (
                      <div style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        background: 'rgba(0,0,0,0.6)', 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 2,
                        backdropFilter: 'blur(2px)'
                      }}>
                        <div style={{ 
                          color: '#22c55e', 
                          fontSize: '1.5rem', 
                          fontWeight: 800, 
                          letterSpacing: '0.1em',
                          border: '3px solid #22c55e',
                          padding: '0.25rem 1rem',
                          marginBottom: '0.5rem',
                          transform: 'rotate(-5deg)'
                        }}>
                          USED
                        </div>
                        {post.usedAt && (
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px' }}>
                               {formatDate(post.usedAt)}
                            </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className={styles.listContainer}>
               {posts.map((post) => (
                 <div 
                    key={post.id} 
                    className={styles.listRow}
                    onClick={() => setSelectedPost(post)}
                 >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative' }}>
                        <img 
                          src={post.coverImageUrl || 'placeholder'} 
                          alt={post.title} 
                          className={styles.listThumbnail}
                          style={{ backgroundColor: '#f0f0f0' }} 
                        />
                         {post.isUsed && (
                            <div style={{ position: 'absolute', top: 4, right: 4, background: '#22c55e', width: 8, height: 8, borderRadius: '50%' }}></div>
                         )}
                    </div>

                    {/* Content */}
                    <div className={styles.listContent}>
                       <div className={styles.listTitle}>{post.title}</div>
                       <div className={styles.listMeta}>
                          <span>{formatDate(post.createdAt)}</span>
                          {/* Limit Hashtags to 2 words */}
                          {post.hashtags && <span className={styles.listHashtags}>{post.hashtags.split(' ').slice(0, 2).join(' ')}{post.hashtags.split(' ').length > 2 ? '...' : ''}</span>}
                          {post.isUsed && (
                             <span className={styles.listUsedBadge} style={{marginLeft: 'auto'}}>USED</span>
                          )}
                       </div>
                    </div>

                    {/* Actions (Hover/Visible) */}
                    <div className={styles.listActions}>
                        <button className={styles.actionBtn} style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
                           <Edit size={16} color="#64748b" />
                        </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </>
      )}

      {selectedPost && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedPost(null)}>
              <X size={20} />
            </button>
            
            <div className={styles.modalBody}>
               
               {/* 
                  Top Actions Header (Responsive) 
               */}
               <div className={styles.modalHeader}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#334155' }}>
                        Review Post
                    </h2>
                    {/* Create Date Display */}
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Created: {formatDate(selectedPost.createdAt)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                     {/* Edit Button */}
                     <button 
                       className={styles.actionBtn}
                       onClick={handleEdit}
                       style={{ height: '40px' }} // Match height
                     >
                       <Edit size={16} /> Edit
                     </button>

                     {/* Used Toggle Button */}
                     <button 
                       onClick={handleUsedToggle}
                       className={styles.actionBtn} // Use standard class base
                       style={{ 
                         height: '40px',
                         background: selectedPost.isUsed ? '#22c55e' : 'white',
                         color: selectedPost.isUsed ? 'white' : 'var(--text-heading)',
                         borderColor: selectedPost.isUsed ? '#22c55e' : 'var(--border-color)',
                         justifyContent: 'center'
                       }}
                     >
                       {selectedPost.isUsed ? (
                           <>
                             <CheckCircle size={16} />
                             <span>Used {formatDate(selectedPost.usedAt || { seconds: Date.now()/1000 })}</span>
                           </>
                       ) : (
                           <>
                             <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1' }}></div>
                             <span>Mark as Used</span>
                           </>
                       )}
                     </button>

                     {/* Share Button */}
                     <button 
                        className={styles.actionBtn}
                        onClick={() => handleShare(selectedPost)}
                        style={{ 
                           height: '40px',
                           minWidth: '100px',
                           justifyContent: 'center',
                           background: copiedState['share_link'] ? '#22c55e' : 'white',
                           color: copiedState['share_link'] ? 'white' : 'var(--text-heading)',
                           borderColor: copiedState['share_link'] ? '#22c55e' : 'var(--border-color)',
                        }}
                     >
                        {copiedState['share_link'] ? <Check size={16} /> : <Share2 size={16} />}
                        {copiedState['share_link'] ? "Copied Link" : "Share"}
                     </button>
                  </div>
               </div>


              {/* Two-Card Download Layout - Forced 2 Column on Mobile */}
              <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', // Always 2 columns
                  gap: '0.75rem', // Smaller gap for mobile
                  marginBottom: '2rem' 
              }}>
                
                {/* 1. Download Cover Card */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                   <div 
                      style={{ aspectRatio: '16/9', background: '#f1f5f9', position: 'relative', cursor: 'pointer' }}
                      onClick={() => setExpandedMedia({ type: 'image', url: selectedPost.coverImageUrl })}
                      title="Click to view full image"
                   >
                      {selectedPost.coverImageUrl && (
                        <img 
                          src={selectedPost.coverImageUrl} 
                          alt="Cover" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', color: 'white', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 500, textAlign: 'center' }}>
                        View
                      </div>
                   </div>
                   <div style={{ padding: '0.75rem', marginTop: 'auto' }}>
                      <button 
                         className={styles.actionBtn} 
                         style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                         onClick={() => handleDownload(selectedPost.coverImageUrl, `cover_${selectedPost.title}.jpg`)}
                      >
                         <ImageIcon size={14} /> Save
                      </button>
                   </div>
                </div>

                {/* 2. Download Video Card */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                   <div 
                     style={{ aspectRatio: '16/9', background: '#000', position: 'relative', cursor: 'pointer' }}
                     onClick={() => setExpandedMedia({ type: 'video', url: selectedPost.videoUrl })}
                     title="Click to watch full video"
                   >
                      {/* Video Preview: Use actual Video tag for previewing */}
                      {selectedPost.videoUrl ? (
                         <video 
                            src={selectedPost.videoUrl} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            // Removed controls here to make it act as a thumbnail button, lightbox has controls
                         />
                      ) : (
                         <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            No Video
                         </div>
                      )}
                      
                      {/* Play Icon Overlay */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)' }}>
                         <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '0.5rem' }}>
                            <Play size={24} fill="white" color="white" />
                         </div>
                      </div>
                   </div>
                   <div style={{ padding: '0.75rem', marginTop: 'auto' }}>
                      <button 
                         className={`${styles.actionBtn} ${styles.primaryBtn}`}
                         style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                         onClick={() => handleDownload(selectedPost.videoUrl, `video_${selectedPost.title}.mp4`)}
                      >
                         <Download size={14} /> Download
                      </button>
                   </div>
                </div>
              </div>

              {/* Title Copy */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem'}}>
                 <div className={styles.sectionTitle} style={{margin: 0}}>Post Title</div>
                 <button 
                    className={styles.actionBtn} 
                    onClick={() => handleCopy(selectedPost.title, 'title')} 
                    style={{
                        padding: '0.25rem 0.75rem', 
                        fontSize: '0.8rem', 
                        background: copiedState['title'] ? '#22c55e' : 'white',
                        color: copiedState['title'] ? 'white' : 'inherit',
                        borderColor: copiedState['title'] ? '#22c55e' : 'var(--border-color)',
                        transition: 'all 0.2s'
                    }}
                 >
                    {copiedState['title'] ? <Check size={14} /> : <Copy size={14} />} 
                    {copiedState['title'] ? "Copied" : "Copy"}
                 </button>
              </div>
              <div className={styles.copyRow}>
                <div className={styles.textContent}>{selectedPost.title}</div>
              </div>

              {/* Description Copy */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem'}}>
                 <div className={styles.sectionTitle} style={{margin: 0}}>Description</div>
                 <button 
                    className={styles.actionBtn} 
                    onClick={() => handleCopy(selectedPost.content, 'description')} 
                    style={{
                        padding: '0.25rem 0.75rem', 
                        fontSize: '0.8rem',
                        background: copiedState['description'] ? '#22c55e' : 'white',
                        color: copiedState['description'] ? 'white' : 'inherit',
                        borderColor: copiedState['description'] ? '#22c55e' : 'var(--border-color)',
                        transition: 'all 0.2s'
                    }}
                 >
                    {copiedState['description'] ? <Check size={14} /> : <Copy size={14} />} 
                    {copiedState['description'] ? "Copied" : "Copy"}
                 </button>
              </div>
              <div className={styles.copyRow}>
                <div className={styles.textContent}>{selectedPost.content}</div>
              </div>

              {/* Hashtags Copy */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem'}}>
                 <div className={styles.sectionTitle} style={{margin: 0}}>Hashtags</div>
                 <button 
                    className={styles.actionBtn} 
                    onClick={() => handleCopy(selectedPost.hashtags, 'hashtags')} 
                    style={{
                        padding: '0.25rem 0.75rem', 
                        fontSize: '0.8rem',
                        background: copiedState['hashtags'] ? '#22c55e' : 'white',
                        color: copiedState['hashtags'] ? 'white' : 'inherit',
                        borderColor: copiedState['hashtags'] ? '#22c55e' : 'var(--border-color)',
                        transition: 'all 0.2s'
                    }}
                 >
                    {copiedState['hashtags'] ? <Check size={14} /> : <Copy size={14} />} 
                    {copiedState['hashtags'] ? "Copied" : "Copy"}
                 </button>
              </div>
              <div className={styles.copyRow}>
                <div className={styles.textContent}>{selectedPost.hashtags}</div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
