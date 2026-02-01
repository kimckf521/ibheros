'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Upload.module.css';
import { UploadCloud, Image as ImageIcon, Video as VideoIcon, X, Trash2, ChevronLeft } from 'lucide-react';
import { storage, db, auth } from '@/lib/firebase'; // Added auth
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

import { generateSocialContent } from '@/app/actions/generate-content';

interface VideoUploadFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    hashtags: string;
    manimCode?: string;
    manimCodeUpdated?: string; // New field
    referenceLink?: string;
    tiktokDescription?: string; // New field
    tiktokHashtags?: string; // New field
    coverImageUrl: string;
    videoUrl?: string; // Legacy
    videoUrlEn?: string; // New English
    videoUrlZh?: string; // New Chinese
  };
  isEditMode?: boolean;
}

export default function VideoUploadForm({ initialData, isEditMode = false }: VideoUploadFormProps) {
  const router = useRouter();
  
  // Ensure user is authenticated anonymously for Firebase permissions
  // Authentication relies on public Security Rules or parent context now
  // Disabled explicit anonymous sign-in to avoid auth/admin-restricted-operation errors on custom domains

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [hashtags, setHashtags] = useState(initialData?.hashtags || '');
  const [manimCode, setManimCode] = useState(initialData?.manimCode || '');
  const [manimCodeUpdated, setManimCodeUpdated] = useState(initialData?.manimCodeUpdated || '');
  const [manimViewMode, setManimViewMode] = useState<'original' | 'updated'>('original');
  const [referenceLink, setReferenceLink] = useState(initialData?.referenceLink || '');
  const [tiktokDescription, setTiktokDescription] = useState(initialData?.tiktokDescription || ''); // New State
  const [tiktokHashtags, setTiktokHashtags] = useState(initialData?.tiktokHashtags || '');
  
  // Specific state for AI Loading Modal
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // File State
  const [coverImage, setCoverImage] = useState<File | null>(null);
  
  // ... (rest of state)


  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImageUrl || null);
  
  // Video State (Refactored for Dual Upload)
  const [videoFileEn, setVideoFileEn] = useState<File | null>(null);
  const [videoPreviewEn, setVideoPreviewEn] = useState<string | null>(initialData?.videoUrlEn || null); 
  
  const [videoFileZh, setVideoFileZh] = useState<File | null>(null);
  const [videoPreviewZh, setVideoPreviewZh] = useState<string | null>(initialData?.videoUrlZh || initialData?.videoUrl || null); // Fallback to legacy (Chinese)
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideoEn, setIsDraggingVideoEn] = useState(false);
  const [isDraggingVideoZh, setIsDraggingVideoZh] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputEnRef = useRef<HTMLInputElement>(null);
  const videoInputZhRef = useRef<HTMLInputElement>(null);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent, type: 'image' | 'videoEn' | 'videoZh') => {
    e.preventDefault();
    if (type === 'image') setIsDraggingImage(true);
    else if (type === 'videoEn') setIsDraggingVideoEn(true);
    else if (type === 'videoZh') setIsDraggingVideoZh(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: 'image' | 'videoEn' | 'videoZh') => {
    e.preventDefault();
    if (type === 'image') setIsDraggingImage(false);
    else if (type === 'videoEn') setIsDraggingVideoEn(false);
    else if (type === 'videoZh') setIsDraggingVideoZh(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'image' | 'videoEn' | 'videoZh') => {
    e.preventDefault();
    if (type === 'image') setIsDraggingImage(false);
    else if (type === 'videoEn') setIsDraggingVideoEn(false);
    else if (type === 'videoZh') setIsDraggingVideoZh(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (type === 'image') {
        if (file.type.startsWith('image/')) {
          setCoverImage(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          alert("Please drop an image file.");
        }
      } else {
        // Video Handling
        if (file.type.startsWith('video/')) {
          const url = URL.createObjectURL(file);
          if (type === 'videoEn') {
            setVideoFileEn(file);
            setVideoPreviewEn(url);
          } else {
            setVideoFileZh(file);
            setVideoPreviewZh(url);
          }
        } else {
          alert("Please drop a video file.");
        }
      }
    }
  };

  // Handle Cover Image (Click)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setCoverImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file.");
      }
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Handle Video (Click)
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>, lang: 'en' | 'zh') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        if (lang === 'en') {
            setVideoFileEn(file);
            setVideoPreviewEn(url);
        } else {
            setVideoFileZh(file);
            setVideoPreviewZh(url);
        }
      } else {
        alert("Please select a video file.");
      }
    }
  };

  const removeVideo = (lang: 'en' | 'zh') => {
    if (lang === 'en') {
        setVideoFileEn(null);
        if (videoPreviewEn && videoPreviewEn.startsWith('blob:')) URL.revokeObjectURL(videoPreviewEn);
        setVideoPreviewEn(null);
        if (videoInputEnRef.current) videoInputEnRef.current.value = '';
    } else {
        setVideoFileZh(null);
        if (videoPreviewZh && videoPreviewZh.startsWith('blob:')) URL.revokeObjectURL(videoPreviewZh);
        setVideoPreviewZh(null);
        if (videoInputZhRef.current) videoInputZhRef.current.value = '';
    }
  };

  const handleDelete = () => {
    if (!initialData?.id) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!initialData?.id) return;

    try {
      setIsSubmitting(true);
      await deleteDoc(doc(db, "posts", initialData.id));
      // alert("Video deleted successfully."); // Removed as requested
      router.push('/upload/videos');
    } catch (error: any) {
      console.error("Error deleting video:", error);
      alert(`Failed to delete: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Check for Config 
      if (!storage.app.options.apiKey && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
         console.warn("Firebase API Key unavailable in standard locations.");
      }

      let coverImageUrl = imagePreview || ''; // Default to existing preview (URL)
      
      let videoUrlEn = videoPreviewEn || '';
      let videoUrlZh = videoPreviewZh || '';

      // 2. Upload Cover Image (Only if new file selected)
      if (coverImage) {
        const imageRef = ref(storage, `posts/images/${Date.now()}_${coverImage.name}`);
        const snapshot = await uploadBytes(imageRef, coverImage);
        coverImageUrl = await getDownloadURL(snapshot.ref);
      } else if (!coverImageUrl) {
          // If no file and no preview (removed), handle accordingly (optional: ensure required)
      }

      // 3. Upload Videos
        // English
      if (videoFileEn) {
        const videoRef = ref(storage, `posts/videos/en/${Date.now()}_${videoFileEn.name}`);
        const snapshot = await uploadBytes(videoRef, videoFileEn);
        videoUrlEn = await getDownloadURL(snapshot.ref);
      }
        // Chinese
      if (videoFileZh) {
        const videoRef = ref(storage, `posts/videos/zh/${Date.now()}_${videoFileZh.name}`);
        const snapshot = await uploadBytes(videoRef, videoFileZh);
        videoUrlZh = await getDownloadURL(snapshot.ref);
      }

      // Legacy support: Populate 'videoUrl' with English version if available, else Chinese
      const videoUrl = videoUrlEn || videoUrlZh || '';

      // 4. Save to Firestore
      const postData = {
        title,
        content,
        hashtags, 
        manimCode,
        manimCodeUpdated, // New Field
        referenceLink,
        tiktokDescription, // New Field
        tiktokHashtags,
        coverImageUrl,
        videoUrl, // Legacy
        videoUrlEn, // New
        videoUrlZh, // New
      };

      if (isEditMode && initialData?.id) {
          // UPDATE
          const postRef = doc(db, "posts", initialData.id);
          await updateDoc(postRef, {
            ...postData,
            updatedAt: serverTimestamp(),
          });
          // alert("Video updated successfully!"); // Removed as requested
          router.push('/upload/videos'); // Direct redirect
      } else {
          // CREATE
          await addDoc(collection(db, "posts"), {
            ...postData,
            createdAt: serverTimestamp(),
          });
          // alert("Video published successfully!"); // Removed as requested
      }

      // Navigate to Videos Page - redirect immediately after save
      setIsSubmitting(false);
      router.push('/upload/videos');
      return; // Ensure no further execution

    } catch (error: any) {
      console.error("Error saving post:", error);
      alert(`Failed to save: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // AI Generation Handler
  const handleGenerateAI = async () => {
    let inputData: { type: 'base64' | 'url', data: string, mimeType?: string } | null = null;
    
    // Case 1: New File Upload (Local File)
    if (videoFileZh) {
         // Check file size (Client side check)
         if (videoFileZh.size > 50 * 1024 * 1024) { // 50MB Warning
             if (!confirm("This video is large (>50MB). AI processing might take a while or fail. Continue?")) return;
         }

         const toBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        try {
            const base64 = await toBase64(videoFileZh);
            inputData = { type: 'base64', data: base64, mimeType: videoFileZh.type };
        } catch (e) {
            alert("Failed to process local file.");
            return;
        }
    } 
    // Case 2: Existing Video (URL)
    else if (videoPreviewZh && !videoPreviewZh.startsWith('blob:')) {
         // Optimization: Pass the URL directly to the server action!
         // This avoids downloading to client and re-uploading base64.
         inputData = { type: 'url', data: videoPreviewZh, mimeType: 'video/mp4' };
    }
    else {
         alert("Please select or upload a Chinese video first.");
         return;
    }

    if (!inputData) return;

    try {
        setIsGeneratingAI(true);
        
        const result = await generateSocialContent(inputData);
        
        if (result) {
            if (result.xhs) {
                setTitle(result.xhs.title || '');
                setContent(result.xhs.content || '');
                setHashtags(result.xhs.hashtags || '');
            }
            if (result.tiktok) {
                setTiktokDescription(result.tiktok.description || '');
                setTiktokHashtags(result.tiktok.hashtags || '');
            }
        }
    } catch (e: any) {
        console.error("AI Error", e);
        alert("AI Generation Failed: " + e.message);
    } finally {
        setIsGeneratingAI(false);
    }
  };

  return (
    <>
    {/* AI Generation Progress Modal */}
    {isGeneratingAI && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%'
            }}>
                <div style={{
                    fontSize: '2rem',
                    marginBottom: '1rem',
                    animation: 'bounce 1s infinite'
                }}>✨</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.25rem' }}>Generating AI Content</h3>
                <p style={{ margin: '0', color: '#6b7280' }}>Watching your video and writing captions...</p>
                <div style={{ 
                    marginTop: '1.5rem', 
                    height: '4px', 
                    background: '#e5e7eb', 
                    borderRadius: '2px', 
                    overflow: 'hidden' 
                }}>
                    <div style={{ 
                        height: '100%', 
                        background: '#10b981', 
                        width: '50%', 
                        animation: 'progress 1.5s infinite linear',
                        borderRadius: '2px'
                    }} />
                </div>
                <style jsx>{`
                    @keyframes progress {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(200%); }
                    }
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }
                `}</style>
            </div>
        </div>
    )}

    <div className={styles.card}>
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <button 
          onClick={() => router.push('/upload/videos')}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
            width: '40px',
            height: '40px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Back to Videos"
        >
          <ChevronLeft size={24} color="#334155" />
        </button>
        <h1 className={styles.title} style={{ marginBottom: 0, textAlign: 'center' }}>
            {isEditMode ? 'Edit Video' : 'Create New Video'}
        </h1>
        {/* AI Button (Right Aligned) */}
        <div>
           <button 
              type="button" 
              onClick={handleGenerateAI}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.6rem', // Slightly rounder
                padding: '0.6rem 1.2rem', // Larger padding
                fontSize: '0.9rem', // Larger font
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                whiteSpace: 'nowrap',
                transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              title="Generate bilingual content with AI"
            >
               ✨ AI Content
            </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Reference Link Section */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Reference Link</label>
          <input
            type="url"
            className={styles.input}
            placeholder="https://example.com/reference"
            value={referenceLink}
            onChange={(e) => setReferenceLink(e.target.value)}
          />
        </div>

        {/* Manim Code Section with Toggle */}
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <label className={styles.label} style={{marginBottom: 0}}>Manim Code</label>
              
              {/* Toggle Switch (Segmented Control) */}
              <div style={{ 
                  display: 'flex', 
                  background: '#f1f5f9', 
                  borderRadius: '0.5rem', 
                  padding: '4px',
                  width: 'fit-content'
              }}>
                  <button
                    type="button"
                    onClick={() => setManimViewMode('original')}
                    style={{
                      padding: '0.35rem 1.25rem',
                      borderRadius: '0.35rem',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: manimViewMode === 'original' ? 'white' : 'transparent',
                      color: manimViewMode === 'original' ? '#0f172a' : '#64748b',
                      boxShadow: manimViewMode === 'original' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => setManimViewMode('updated')}
                    style={{
                      padding: '0.35rem 1.25rem',
                      borderRadius: '0.35rem',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: manimViewMode === 'updated' ? 'white' : 'transparent',
                      color: manimViewMode === 'updated' ? '#0284c7' : '#64748b',
                      boxShadow: manimViewMode === 'updated' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    Updated
                  </button>
              </div>
          </div>

          {manimViewMode === 'original' ? (
              <textarea
                className={styles.textarea}
                style={{ fontFamily: 'monospace', fontSize: '0.9rem', minHeight: '250px', background: '#f8fafc', whiteSpace: 'pre' }}
                placeholder="Original Manim (Python) code..."
                value={manimCode}
                onChange={(e) => setManimCode(e.target.value)}
              />
          ) : (
              <textarea
                className={styles.textarea}
                style={{ fontFamily: 'monospace', fontSize: '0.9rem', minHeight: '250px', background: '#f0f9ff', borderColor: '#bae6fd', whiteSpace: 'pre' }}
                placeholder="Paste Updated Manim (Python) code here..."
                value={manimCodeUpdated}
                onChange={(e) => setManimCodeUpdated(e.target.value)}
              />
          )}
        </div>

        {/* Cover Image Upload */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Cover Image</label>
          {!imagePreview ? (
            <div 
              className={`${styles.uploadZone} ${isDraggingImage ? styles.uploadZoneActive : ''}`}
              onClick={() => imageInputRef.current?.click()}
              onDragOver={(e) => handleDragOver(e, 'image')}
              onDragLeave={(e) => handleDragLeave(e, 'image')}
              onDrop={(e) => handleDrop(e, 'image')}
            >
              <ImageIcon className={styles.uploadIcon} />
              <span className={styles.uploadText}>
                {isDraggingImage ? "Drop image here" : "Click or Drag to upload cover image"}
              </span>
              <span className={styles.uploadSubtext}>SVG, PNG, JPG or GIF (max. 800x400px recommended)</span>
              <input 
                type="file" 
                hidden 
                ref={imageInputRef} 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <img src={imagePreview} alt="Cover Preview" className={styles.imagePreview} />
              <button type="button" className={styles.removeBtn} onClick={removeImage}>
                <X size={18} />
              </button>
            </div>
          )}
        </div>



        {/* Video Upload - Chinese */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Video Content (Chinese)</label>
          {!videoPreviewZh ? (
            <div 
              className={`${styles.uploadZone} ${isDraggingVideoZh ? styles.uploadZoneActive : ''}`}
              onClick={() => videoInputZhRef.current?.click()}
              onDragOver={(e) => handleDragOver(e, 'videoZh')}
              onDragLeave={(e) => handleDragLeave(e, 'videoZh')}
              onDrop={(e) => handleDrop(e, 'videoZh')}
            >
              <VideoIcon className={styles.uploadIcon} />
              <span className={styles.uploadText}>
                {isDraggingVideoZh ? "Drop Chinese video here" : "Click or Drag to upload Chinese video"}
              </span>
              <span className={styles.uploadSubtext}>MP4, WebM or Ogg</span>
              <input 
                type="file" 
                hidden 
                ref={videoInputZhRef} 
                accept="video/*"
                onChange={(e) => handleVideoChange(e, 'zh')}
              />
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <video src={videoPreviewZh} controls className={styles.videoPreview} />
              <button type="button" className={styles.removeBtn} onClick={() => removeVideo('zh')}>
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Video Upload - English */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Video Content (English)</label>
          {!videoPreviewEn ? (
            <div 
              className={`${styles.uploadZone} ${isDraggingVideoEn ? styles.uploadZoneActive : ''}`}
              onClick={() => videoInputEnRef.current?.click()}
              onDragOver={(e) => handleDragOver(e, 'videoEn')}
              onDragLeave={(e) => handleDragLeave(e, 'videoEn')}
              onDrop={(e) => handleDrop(e, 'videoEn')}
            >
              <VideoIcon className={styles.uploadIcon} />
              <span className={styles.uploadText}>
                {isDraggingVideoEn ? "Drop English video here" : "Click or Drag to upload English video"}
              </span>
              <span className={styles.uploadSubtext}>MP4, WebM or Ogg</span>
              <input 
                type="file" 
                hidden 
                ref={videoInputEnRef} 
                accept="video/*"
                onChange={(e) => handleVideoChange(e, 'en')}
              />
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <video src={videoPreviewEn} controls className={styles.videoPreview} />
              <button type="button" className={styles.removeBtn} onClick={() => removeVideo('en')}>
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className={styles.formGroup}>
          <label className={styles.label}>XHS Video Title</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter a catchy title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Content */}
        <div className={styles.formGroup}>
          <label className={styles.label}>XHS Description</label>
          <textarea
            className={styles.textarea}
            placeholder="What's on your mind?..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* XHS Hashtags */}
        <div className={styles.formGroup}>
          <label className={styles.label}>XHS Hashtags</label>
          <input
            type="text"
            className={styles.input}
            placeholder="#tag1 #tag2 (Optional)"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
          />
        </div>

        {/* TikTok Description */}
        <div className={styles.formGroup}>
          <label className={styles.label}>TikTok Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Description for TikTok..."
            value={tiktokDescription}
            onChange={(e) => setTiktokDescription(e.target.value)}
          />
        </div>

        {/* TikTok Hashtags */}
        <div className={styles.formGroup}>
          <label className={styles.label}>TikTok Hashtags</label>
          <input
            type="text"
            className={styles.input}
            placeholder="#tiktok #fyp (Optional)"
            value={tiktokHashtags}
            onChange={(e) => setTiktokHashtags(e.target.value)}
          />
        </div>



        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting} style={{flex: 1}}>
            <UploadCloud size={20} />
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Video' : 'Publish Video')}
          </button>

          {isEditMode && (
            <button 
              type="button" 
              onClick={handleDelete}
              disabled={isSubmitting}
              className={styles.submitBtn}
              style={{ background: '#ef4444', flex: 1 }}
              title="Delete Video"
            >
              <Trash2 size={20} />
              <span>Delete Video</span>
            </button>
          )}
        </div>

      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#1e293b', 
              marginBottom: '1rem' 
            }}>
              Delete Video
            </h3>
            <p style={{ 
              color: '#64748b', 
              marginBottom: '2rem' 
            }}>
              Are you sure you want to delete this video?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
