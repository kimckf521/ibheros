'use client';

import { useState, useRef } from 'react';
import { CheckCircle, AlertCircle, FileText, Image as ImageIcon, X } from 'lucide-react';
import { submitTutorApplication } from '@/app/actions';
import styles from './TutorApplicationForm.module.css';

export default function TutorApplicationForm({ dict }: { dict: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]); // Changed to array
  const [selectedDocs, setSelectedDocs] = useState<File[]>([]);
  
  // Toggle Visibility State
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Override the form data
    formData.delete('photo');
    selectedPhotos.forEach(file => {
      formData.append('photo', file);
    });

    formData.delete('transcripts');
    selectedDocs.forEach(file => {
      formData.append('transcripts', file);
    });

    try {
      const result = await submitTutorApplication(formData);

      if (result.success) {
        setSubmitStatus('success');
        formRef.current?.reset();
        setSelectedPhotos([]);
        setSelectedDocs([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitStatus('error');
      }
    } catch (e) {
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  const handleRemoveDoc = (indexToRemove: number) => {
    setSelectedDocs(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setSelectedPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setSelectedPhotos(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > 5) {
        alert('You can upload a maximum of 5 photos.');
        return combined.slice(0, 5);
      }
      return combined;
    });
  };

  const handleDocSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setSelectedDocs(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > 10) {
        alert('You can upload a maximum of 10 documents.');
        return combined.slice(0, 10);
      }
      return combined;
    });
  };
  
  // Helper to render file lists with toggle
  const renderFileList = (files: File[], title: string, removeHandler: (index: number) => void, showAll: boolean, setShowAll: (v: boolean) => void) => {
    if (files.length === 0) return null;

    const visibleFiles = showAll ? files : files.slice(0, 2);
    const hasMore = files.length > 2;

    return (
      <div className={styles.fileList}>
        {visibleFiles.map((file, index) => (
          <div key={`${file.name}-${index}`} className={styles.fileItem}>
            <div className={styles.fileInfo}>
              <FileText size={16} className="text-[var(--accent-color)]" />
              <span className={styles.fileName}>{file.name}</span>
            </div>
            <button 
              type="button" 
              onClick={() => removeHandler(index)}
              className={styles.removeFileBtn}
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {hasMore && (
          <button 
            type="button"
            className={styles.toggleListBtn}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show less' : `Show ${files.length - 2} more...`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.topAccent}></div>

      <div className={styles.header}>
        <h3 className={styles.title}>{dict.form.title}</h3>
        <p className={styles.subtitle}>Please fill out the form below to apply. Fields marked with * are required.</p>
      </div>
      
      {submitStatus === 'success' && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <CheckCircle className="shrink-0 mt-0.5" size={24} />
          <div className={styles.alertContent}>
            <h4>{dict.form.success}</h4>
            <p>We will review your application and get back to you shortly.</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle className="shrink-0 mt-0.5" size={24} />
          <div className={styles.alertContent}>
            <h4>{dict.form.error}</h4>
            <p>Please ensure all required fields are filled and try again.</p>
          </div>
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className={styles.form}>
        
        {/* Personal Info */}
        <Section title={dict.form.personal.title}>
          <div className={styles.grid2}>
            <InputField name="firstName" label={dict.form.personal.firstName} required />
            <InputField name="lastName" label={dict.form.personal.lastName} required />
          </div>
          <InputField name="preferredName" label={dict.form.personal.preferredName} />
          <div className={styles.grid2}>
            <InputField name="email" type="email" label={dict.form.personal.email} required />
            <InputField name="phone" type="tel" label={dict.form.personal.phone} />
          </div>
          <InputField name="countryCity" label={dict.form.personal.countryCity} required />
          <TextAreaField name="intro" label={dict.form.personal.intro} required />
        </Section>

        {/* Academic Info */}
        <Section title={dict.form.academic.title}>
          <InputField name="subjects" label={dict.form.academic.subjects} required placeholder="e.g. VCE Maths Methods, English" />
          <InputField name="university" label={dict.form.academic.university} required />
          <div className={styles.grid3}>
            <InputField name="ibScores" label={dict.form.academic.ibScores} />
            <InputField name="aLevelScores" label={dict.form.academic.aLevelScores} />
            <InputField name="atar" label={dict.form.academic.atar} />
          </div>
        </Section>

        {/* Experience */}
        <Section title={dict.form.experience.title}>
          <TextAreaField name="teachingExp" label={dict.form.experience.teachingExp} required />
          <TextAreaField name="strengths" label={dict.form.experience.strengths} required />
          <TextAreaField name="achievements" label={dict.form.experience.achievements} required />
        </Section>

        {/* Uploads */}
        <Section title={dict.form.uploads.title} isLast>
          <div className={styles.grid2}>
            <div className={styles.uploadGroup}>
              <label className={styles.label}>
                {dict.form.uploads.photo} (Max 5)
              </label>
              <div className={`${styles.uploadBox} ${selectedPhotos.length > 0 ? styles.uploadBoxActive : ''}`}>
                <>
                  <div className={`${styles.uploadIconCircle} ${selectedPhotos.length > 0 ? styles.uploadIconCircleSuccess : ''}`}>
                    {selectedPhotos.length > 0 ? (
                      <CheckCircle className={styles.uploadIconSuccess} size={24} />
                    ) : (
                      <ImageIcon className={styles.uploadIcon} size={24} />
                    )}
                  </div>
                  <p className={styles.uploadText}>
                    {selectedPhotos.length > 0 
                      ? `${selectedPhotos.length} photo(s) selected` 
                      : 'Click to upload photos'}
                  </p>
                  <p className={styles.uploadSubtext}>JPG, PNG up to 5MB</p>
                </>
                
                <input 
                  type="file" 
                  name="photo-input" 
                  accept="image/*" 
                  multiple // Allow multiple selection
                  className={styles.fileInput} 
                  required={selectedPhotos.length === 0} 
                  onChange={(e) => {
                    handlePhotoSelect(e.target.files);
                    e.target.value = ''; // Reset input
                  }}
                />
              </div>
              {/* Render Photo List */}
              {renderFileList(selectedPhotos, "Photos", handleRemovePhoto, showAllPhotos, setShowAllPhotos)}
            </div>

            <div className={styles.uploadGroup}>
              <label className={styles.label}>
                {dict.form.uploads.transcripts} (Max 10)
              </label>
              <div className={`${styles.uploadBox} ${selectedDocs.length > 0 ? styles.uploadBoxActive : ''}`}>
                  <>
                    <div className={`${styles.uploadIconCircle} ${selectedDocs.length > 0 ? styles.uploadIconCircleSuccess : ''}`}>
                       {selectedDocs.length > 0 ? (
                         <CheckCircle className={styles.uploadIconSuccess} size={24} />
                       ) : (
                         <FileText className={styles.uploadIcon} size={24} />
                       )}
                    </div>
                    <p className={styles.uploadText}>
                      {selectedDocs.length > 0 
                        ? `${selectedDocs.length} file(s) selected` 
                        : 'Click to add documents'}
                    </p>
                    <p className={styles.uploadSubtext}>PDF, DOCX up to 10MB</p>
                  </>

                <input 
                  type="file" 
                  name="transcripts-input" 
                  multiple 
                  accept=".pdf,.doc,.docx,image/*" 
                  className={styles.fileInput} 
                  required={selectedDocs.length === 0} 
                  onChange={(e) => {
                    handleDocSelect(e.target.files);
                    e.target.value = ''; // Reset input
                  }}
                />
              </div>

              {/* Render Doc List */}
              {renderFileList(selectedDocs, "Documents", handleRemoveDoc, showAllDocs, setShowAllDocs)}
            </div>
          </div>
        </Section>

        <div className={styles.buttonWrapper}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                {dict.form.submitting}
              </>
            ) : (
              dict.form.submit
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

function Section({ title, children, isLast }: { title: string, children: React.ReactNode, isLast?: boolean }) {
  return (
    <div className={`${styles.section} ${isLast ? styles.sectionLast : ''}`}>
      <h4 className={styles.sectionTitle}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function InputField({ label, name, type = 'text', required = false, placeholder = '' }: any) {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}

function TextAreaField({ label, name, required = false, rows = 5 }: any) {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        className={styles.textarea}
      />
    </div>
  );
}
