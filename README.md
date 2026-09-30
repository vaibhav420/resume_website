# Resume site
Static page (index.html) + one serverless function (api/contact.js).
1. Edit the ME object near the bottom of index.html.
2. Deploy to Vercel (see steps in chat).
3. Add env vars in Vercel: RESEND_API_KEY and CONTACT_TO (your email).
Local test: npx vercel dev
