'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Upload.module.css';
import { UploadCloud, Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

interface VideoUploadFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    hashtags: string;
    manimCode?: string;
    referenceLink?: string; // New field
    coverImageUrl: string;
    videoUrl: string;
  };
  isEditMode?: boolean;
}

export default function VideoUploadForm({ initialData, isEditMode = false }: VideoUploadFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [hashtags, setHashtags] = useState(initialData?.hashtags || '');
  const [manimCode, setManimCode] = useState(initialData?.manimCode || '');
  const [referenceLink, setReferenceLink] = useState(initialData?.referenceLink || '');
  
  // File State
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImageUrl || null);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(initialData?.videoUrl || null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    if (type === 'image') setIsDraggingImage(true);
    else setIsDraggingVideo(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    if (type === 'image') setIsDraggingImage(false);
    else setIsDraggingVideo(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    if (type === 'image') setIsDraggingImage(false);
    else setIsDraggingVideo(false);

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
        if (file.type.startsWith('video/')) {
          setVideoFile(file);
          const url = URL.createObjectURL(file);
          setVideoPreview(url);
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
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
      } else {
        alert("Please select a video file.");
      }
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      // Only revoke if it's a blob URL (created from file)
      if (videoPreview.startsWith('blob:')) URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
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
      let videoUrl = videoPreview || '';     // Default to existing preview (URL)

      // 2. Upload Cover Image (Only if new file selected)
      if (coverImage) {
        const imageRef = ref(storage, `posts/images/${Date.now()}_${coverImage.name}`);
        const snapshot = await uploadBytes(imageRef, coverImage);
        coverImageUrl = await getDownloadURL(snapshot.ref);
      } else if (!coverImageUrl) {
          // If no file and no preview (removed), handle accordingly (optional: ensure required)
      }

      // 3. Upload Video (Only if new file selected)
      if (videoFile) {
        const videoRef = ref(storage, `posts/videos/${Date.now()}_${videoFile.name}`);
        const snapshot = await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(snapshot.ref);
      }

      // 4. Save to Firestore
      if (isEditMode && initialData?.id) {
          // UPDATE
          const postRef = doc(db, "posts", initialData.id);
          await updateDoc(postRef, {
            title,
            content,
            hashtags,
            manimCode,
            referenceLink,
            coverImageUrl,
            videoUrl,
            updatedAt: serverTimestamp(),
          });
          alert("Video updated successfully!");
      } else {
          // CREATE
          await addDoc(collection(db, "posts"), {
            title,
            content,
            hashtags, 
            manimCode,
            referenceLink,
            coverImageUrl,
            videoUrl,
            createdAt: serverTimestamp(),
          });
          alert("Video published successfully!");
      }

      
      // Navigate to Videos Page
      router.push('/upload/videos');

    } catch (error: any) {
      console.error("Error saving post:", error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>
          {isEditMode ? 'Edit Video' : 'Create New Video'}
      </h1>
      
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

        {/* Manim Code Section */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Manim Code</label>
          <textarea
            className={styles.textarea}
            style={{ fontFamily: 'monospace', fontSize: '0.9rem', minHeight: '150px', background: '#f8fafc' }}
            placeholder="Paste your Manim (Python) code here..."
            value={manimCode}
            onChange={(e) => setManimCode(e.target.value)}
          />
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

        {/* Video Upload */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Video Content</label>
          {!videoPreview ? (
            <div 
              className={`${styles.uploadZone} ${isDraggingVideo ? styles.uploadZoneActive : ''}`}
              onClick={() => videoInputRef.current?.click()}
              onDragOver={(e) => handleDragOver(e, 'video')}
              onDragLeave={(e) => handleDragLeave(e, 'video')}
              onDrop={(e) => handleDrop(e, 'video')}
            >
              <VideoIcon className={styles.uploadIcon} />
              <span className={styles.uploadText}>
                {isDraggingVideo ? "Drop video here" : "Click or Drag to upload video"}
              </span>
              <span className={styles.uploadSubtext}>MP4, WebM or Ogg</span>
              <input 
                type="file" 
                hidden 
                ref={videoInputRef} 
                accept="video/*"
                onChange={handleVideoChange}
              />
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <video src={videoPreview} controls className={styles.videoPreview} />
              <button type="button" className={styles.removeBtn} onClick={removeVideo}>
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Video Title</label>
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
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="What's on your mind?..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* Hashtags */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Hashtags</label>
          <input
            type="text"
            className={styles.input}
            placeholder="#tag1 #tag2 (Optional)"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          <UploadCloud size={20} />
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Video' : 'Publish Video')}
        </button>

      </form>
    </div>
  );
}
