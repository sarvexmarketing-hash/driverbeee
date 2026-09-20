import {
  getAdminDriverApplications,
  approveDriverApplication,
  rejectDriverApplication,
  requestResubmission,
  updateDocumentVerification,
  getSecureDocumentViewUrl,
  ApplicationStatus,
} from '../../src/services/driverOnboarding.service.ts';

export default async function handler(req: any, res: any) {
  const method = req.method || 'GET';

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

  const urlObj = new URL(req.url || '/', `http://${req.headers?.host || 'localhost'}`);
  const clientIp = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers?.['user-agent'] || 'unknown';

  // ───────────────────────────────────────────────────────────────────────────
  // GET Handlers
  // ───────────────────────────────────────────────────────────────────────────
  if (method === 'GET') {
    const action = urlObj.searchParams.get('action') || req.query?.action;

    // A. View Document securely with signed temporary URL & access audit logging
    if (action === 'viewDocument') {
      const documentId = urlObj.searchParams.get('documentId') || req.query?.documentId;
      const adminId = urlObj.searchParams.get('adminId') || req.query?.adminId || 'admin';

      if (!documentId) {
        return sendJson(400, { error: 'Missing documentId parameter' });
      }

      const result = await getSecureDocumentViewUrl(documentId, adminId, clientIp, userAgent);
      if (result.error) {
        return sendJson(404, { error: result.error });
      }

      return sendJson(200, { signedUrl: result.signedUrl });
    }

    // B. List all applications
    const statusParam = (urlObj.searchParams.get('status') || req.query?.status || 'ALL') as ApplicationStatus | 'ALL';
    const applications = await getAdminDriverApplications(statusParam);
    return sendJson(200, { applications });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // POST Handlers (Admin State Actions)
  // ───────────────────────────────────────────────────────────────────────────
  if (method === 'POST') {
    const { action, applicationId, documentId, status, reason, note, adminId } = req.body || {};
    const effectiveAdminId = adminId || 'admin';

    // 1. Approve Application
    if (action === 'APPROVE_APPLICATION') {
      if (!applicationId) return sendJson(400, { error: 'Missing applicationId' });
      const result = await approveDriverApplication(applicationId, effectiveAdminId);
      if (!result.success) {
        return sendJson(400, { error: result.error });
      }
      return sendJson(200, { success: true, message: 'Application approved and driver activated' });
    }

    // 2. Reject Application
    if (action === 'REJECT_APPLICATION') {
      if (!applicationId || !reason) {
        return sendJson(400, { error: 'Missing applicationId or rejection reason' });
      }
      const result = await rejectDriverApplication(applicationId, reason, effectiveAdminId);
      if (!result.success) {
        return sendJson(400, { error: result.error });
      }
      return sendJson(200, { success: true, message: 'Application rejected' });
    }

    // 3. Request Resubmission
    if (action === 'REQUEST_RESUBMISSION') {
      if (!applicationId || !note) {
        return sendJson(400, { error: 'Missing applicationId or resubmission note' });
      }
      const result = await requestResubmission(applicationId, note, effectiveAdminId);
      if (!result.success) {
        return sendJson(400, { error: result.error });
      }
      return sendJson(200, { success: true, message: 'Resubmission requested' });
    }

    // 4. Update Individual Document Status
    if (action === 'UPDATE_DOCUMENT_STATUS') {
      if (!documentId || !status) {
        return sendJson(400, { error: 'Missing documentId or status' });
      }
      const result = await updateDocumentVerification(documentId, status, note, effectiveAdminId);
      if (!result.success) {
        return sendJson(400, { error: result.error });
      }
      return sendJson(200, { success: true, message: 'Document status updated' });
    }

    return sendJson(400, { error: `Unrecognized action: ${action}` });
  }

  return sendJson(405, { error: `Method ${method} not allowed.` });
}
