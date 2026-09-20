import { submitDriverApplication, getMyDriverApplication } from '../../src/services/driverOnboarding.service.ts';

export default async function handler(req: any, res: any) {
  const method = req.method || 'GET';

  // Helper response writer
  const sendJson = (status: number, data: any) => {
    if (typeof res.status === 'function') res.status(status);
    else res.statusCode = status;
    if (typeof res.json === 'function') res.json(data);
    else {
      if (!res.getHeader || !res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify(data));
    }
  };

  // GET /api/driver-applications?userId=...
  if (method === 'GET') {
    const urlObj = new URL(req.url || '/', `http://${req.headers?.host || 'localhost'}`);
    const userId = urlObj.searchParams.get('userId') || req.query?.userId;

    if (!userId) {
      return sendJson(400, { error: 'Missing userId parameter' });
    }

    const app = await getMyDriverApplication(userId);
    return sendJson(200, { application: app });
  }

  // POST /api/driver-applications
  if (method === 'POST') {
    const payload = req.body || {};

    if (!payload.user_id) {
      return sendJson(400, { error: 'Authentication required: user_id is missing.' });
    }

    if (!payload.full_name || !payload.phone || !payload.email) {
      return sendJson(400, { error: 'Full Name, Phone Number, and Email are required.' });
    }

    const result = await submitDriverApplication(payload);

    if (!result.success) {
      return sendJson(400, { error: result.error });
    }

    return sendJson(201, { application: result.application });
  }

  return sendJson(405, { error: `Method ${method} not allowed.` });
}
