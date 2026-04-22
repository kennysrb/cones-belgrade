'use server';

import { resend } from '@/lib/resend';

export async function sendContactEmail(
  formData: FormData,
): Promise<{ success: boolean }> {
  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const phone = String(formData.get('phone') ?? '') || undefined;
  const message = String(formData.get('message') ?? '');

  const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
  const to = process.env.EMAIL_TO ?? 'conesbelgrade@gmail.com';

  // TODO: remove mock once RESEND_API_KEY is set
  return { success: true };

  try {
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Contact form: ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : '',
        '',
        `Message:\n${message}`,
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <hr/>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${message}</p>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('[send-email]', err);
    return { success: false };
  }
}
