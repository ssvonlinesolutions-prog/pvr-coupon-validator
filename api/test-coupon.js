export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { coupon, bookingId, transId, ccode, city } = req.body || {};
    if (!coupon || !bookingId || !transId || !ccode || !city) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: ['coupon', 'bookingId', 'transId', 'ccode', 'city']
      });
    }
    // Validate coupon format
    const couponRegex = /^DA[A-Z0-9]{4,6}$/;
    if (!couponRegex.test(coupon)) {
      return res.status(400).json({ error: 'Invalid coupon format. Must start with DA and be 6-8 characters long.' });
    }
    // API call to PVR
    const payload = {
      ccode, bookingId, transId,
      bookType: "BOOKING", coupon, couponType: "PROMOCODE", couponId: 0, qr: "NO", qrs: false,
      card: "", mobile: "", otp: ""
    };
    const headers = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9', appversion: '1.0', chain: 'PVR',
      city: city, 'content-type': 'application/json', country: 'INDIA',
      origin: 'https://www.pvrcinemas.com', platform: 'WEBSITE',
      'user-agent': 'Mozilla/5.0'
    };
    const response = await fetch('https://api3.pvrcinemas.com/api/v1/payment/coupon/apply', {
      method: 'POST', headers, body: JSON.stringify(payload), timeout: 10000
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.code === 10001 && data.result === 'success') {
      return res.status(200).json({ isValid: true, message: data.msg || 'Coupon is valid', discount: data.output?.di || 'Unknown', totalAmount: data.output?.it || null, discountText: data.output?.txt || null, rawResponse: data });
    } else {
      return res.status(200).json({ isValid: false, message: data.msg || 'Coupon is invalid', code: data.code, rawResponse: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', isValid: false, message: error.message });
  }
}
