'use client';

import styles from '../../../components/Upload.module.css';
import VideoUploadForm from '@/components/VideoUploadForm';

export default function UploadPage() {
  return (
    <div className={styles.container}>
       <VideoUploadForm />
    </div>
  );
}
