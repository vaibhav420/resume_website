// Vercel serverless function: POST /api/contact
// Sends the form to your inbox via Resend (free tier). No npm packages needed.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { name = '', email = '', message = '', website = '' } = req.body || {};

  // Honeypot: bots fill the hidden "website" field. Pretend success, send nothing.
  if (website) return res.status(200).json({ ok: true });

  const clean = (s, max) => String(s).trim().slice(0, max);
  const n = clean(name, 100), e = clean(email, 200), m = clean(message, 4000);
  if (!n || !m || !/^\S+@\S+\.\S+$/.test(e)) {
    return res.status(400).json({ ok: false, error: 'Please provide a name, valid email and message.' });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    return res.status(503).json({ ok: false, error: 'Email is not configured yet.' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Resume Site <onboarding@resend.dev>',
        to: [to],
        reply_to: e,
        subject: `New message from ${n} via your resume site`,
        text: `From: ${n} <${e}>\n\n${m}`
      })
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'Email service rejected the request.' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'Could not reach email service.' });
  }
}
