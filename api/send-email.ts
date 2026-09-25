export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, text, from, apiKey } = req.body || {};

    if (!to || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required parameters (to, html/text)' });
    }

    const resendApiKey =
      apiKey ||
      process.env.RESEND_API_KEY ||
      process.env.VITE_RESEND_API_KEY ||
      '';

    if (!resendApiKey) {
      return res.status(400).json({ error: 'Resend API Key is not configured' });
    }

    let senderEmail = from || process.env.RESEND_FROM_EMAIL || process.env.VITE_RESEND_FROM_EMAIL || 'APSIWA Secretariat <onboarding@resend.dev>';
    if (senderEmail.includes('@gmail.com') || senderEmail.includes('@yahoo.com') || senderEmail.includes('@outlook.com')) {
      senderEmail = 'APSIWA Secretariat <onboarding@resend.dev>';
    }

    const payload = {
      from: senderEmail,
      to: Array.isArray(to) ? to : [to],
      subject: subject || 'APSIWA Membership Certificate & Identity Card',
      html: html,
      text: text,
    };

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const resData = await resendRes.json();

    if (!resendRes.ok) {
      // Auto-fallback to onboarding@resend.dev if custom from address failed
      if (senderEmail !== 'APSIWA Secretariat <onboarding@resend.dev>') {
        const retryRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            ...payload,
            from: 'APSIWA Secretariat <onboarding@resend.dev>',
          }),
        });
        const retryData = await retryRes.json();
        return res.status(retryRes.status).json(retryData);
      }
      return res.status(resendRes.status).json(resData);
    }

    return res.status(200).json(resData);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
