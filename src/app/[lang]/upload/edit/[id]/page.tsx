'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '@/components/Upload.module.css';
import VideoUploadForm from '@/components/VideoUploadForm';
import { use } from 'react';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPostData({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Post not found!");
          router.push('/upload/videos');
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
  }, [id, router]);

  if (loading) {
    return <div className={styles.container}><p style={{color: '#fff'}}>Loading...</p></div>;
  }

  if (!postData) return null;

  return (
    <div className={styles.container}>
      <VideoUploadForm initialData={postData} isEditMode={true} />
    </div>
  );
}
