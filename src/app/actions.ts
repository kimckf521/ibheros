'use server';

import nodemailer from 'nodemailer';

export async function submitTutorApplication(formData: FormData) {
  try {
    const rawData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      preferredName: formData.get('preferredName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      countryCity: formData.get('countryCity'),
      intro: formData.get('intro'),
      subjects: formData.get('subjects'),
      ibScores: formData.get('ibScores'),
      aLevelScores: formData.get('aLevelScores'),
      atar: formData.get('atar'),
      university: formData.get('university'),
      teachingExp: formData.get('teachingExp'),
      strengths: formData.get('strengths'),
      achievements: formData.get('achievements'),
    };

    // Extract file uploads
    const photos = formData.getAll('photo') as File[];
    const transcripts = formData.getAll('transcripts') as File[];

    // Basic validation
    if (
      !rawData.firstName ||
      !rawData.lastName ||
      !rawData.email ||
      !rawData.countryCity ||
      !rawData.intro ||
      !rawData.subjects ||
      !rawData.university ||
      !rawData.teachingExp ||
      !rawData.strengths ||
      !rawData.achievements ||
      photos.length === 0 || // Validate at least one photo
      transcripts.length === 0
    ) {
      return { success: false, message: 'Missing required fields' };
    }

    const attachments = [];



    // Convert Photos to Buffers
    const photoAttachments = await Promise.all(
      photos.map(async (file) => {
        const bytes = await file.arrayBuffer();
        return {
          filename: `photo-${file.name}`,
          content: Buffer.from(bytes),
        };
      })
    );

    // Convert Transcripts to Buffers
    const transcriptAttachments = await Promise.all(
      transcripts.map(async (file) => {
        const bytes = await file.arrayBuffer();
        return {
          filename: `transcript-${file.name}`,
          content: Buffer.from(bytes),
        };
      })
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"IB Heros Application" <${process.env.SMTP_USER}>`,
      to: 'ibheros7@gmail.com',
      subject: `New Tutor Application: ${rawData.firstName} ${rawData.lastName}`,
      html: `
        <h1>New Tutor Application</h1>
        <h2>Personal Information</h2>
        <ul>
          <li><strong>Name:</strong> ${rawData.firstName} ${rawData.lastName} (Preferred: ${rawData.preferredName || 'N/A'})</li>
          <li><strong>Email:</strong> ${rawData.email}</li>
          <li><strong>Phone:</strong> ${rawData.phone || 'N/A'}</li>
          <li><strong>Location:</strong> ${rawData.countryCity}</li>
        </ul>
        <p><strong>Introduction:</strong><br>${rawData.intro}</p>
        
        <h2>Academic Information</h2>
        <ul>
          <li><strong>Subjects:</strong> ${rawData.subjects}</li>
          <li><strong>University:</strong> ${rawData.university}</li>
          <li><strong>IB Scores:</strong> ${rawData.ibScores || 'N/A'}</li>
          <li><strong>A-Level Scores:</strong> ${rawData.aLevelScores || 'N/A'}</li>
          <li><strong>ATAR:</strong> ${rawData.atar || 'N/A'}</li>
        </ul>

        <h2>Experience & Skills</h2>
        <p><strong>Teaching Experience:</strong><br>${rawData.teachingExp}</p>
        <p><strong>Strengths:</strong><br>${rawData.strengths}</p>
        <p><strong>Achievements:</strong><br>${rawData.achievements}</p>
      `,
      attachments: [...photoAttachments, ...transcriptAttachments],
    });
    return { success: true, message: 'Application submitted successfully!' };

  } catch (error) {
    console.error('Error submitting application:', error);
    return { success: false, message: 'Failed to submit application. Please try again later.' };
  }
}
