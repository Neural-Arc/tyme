
export const sendEmail = async (
  apiKey: string,
  to: string,
  name: string,
  message: string
) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@tymeai.com',
        to,
        subject: 'Meeting Invite',
        html: `
          <p>Hello ${name},</p>
          <p>${message}</p>
          <p>Sent via Tyme!</p>
        `
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};
