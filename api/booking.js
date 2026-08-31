const DAD = 'mississuga.furnished.apartments@gmail.com';
const YOU = 'a.abuhattab21@gmail.com';
const BOOKING = '/booking';
const SUCCESS = '/booking?reservation=sent';

function field(body, key) {
  const value = body[key];
  if (Array.isArray(value)) return String(value[0] || '').trim();
  return String(value || '').trim();
}

async function sendEmail(apiKey, payload) {
  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return send.ok;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.statusCode = 303;
    res.setHeader('Location', BOOKING);
    res.end();
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: pretend success without emailing
  if (field(body, '_honey')) {
    res.statusCode = 303;
    res.setHeader('Location', SUCCESS);
    res.end();
    return;
  }

  const name = field(body, 'name');
  const email = field(body, 'email');
  const phone = field(body, 'phone');
  if (!name || !email || !phone || !/[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Missing required fields');
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Mail is not configured');
    return;
  }

  const rows = [
    ['Name', name],
    ['Last name', field(body, 'lastname')],
    ['Phone', phone],
    ['Email', email],
    ['Suite', field(body, 'suite')],
    ['Check-in', field(body, 'checkin')],
    ['Check-out', field(body, 'checkout')],
    ['Message', field(body, 'message')],
  ];
  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const subject = 'New reservation request from Mississauga Furnished Apartments';

  // Ahmad's copy — keep this path exactly as it works today.
  const toYou = await sendEmail(apiKey, {
    from: 'Mississauga Furnished Apartments <onboarding@resend.dev>',
    to: [YOU],
    reply_to: email,
    subject,
    text,
  });

  // Dad's copy from the verified domain. Do not CC Ahmad here (he already got his).
  await sendEmail(apiKey, {
    from: 'Mississauga Furnished Apartments <bookings@mississauga-furnished-apartments.ca>',
    to: [DAD],
    reply_to: email,
    subject,
    text,
  });

  if (!toYou) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Could not send reservation email');
    return;
  }

  res.statusCode = 303;
  res.setHeader('Location', SUCCESS);
  res.end();
}
