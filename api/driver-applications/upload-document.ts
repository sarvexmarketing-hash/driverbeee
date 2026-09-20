import {
  optimizeDocumentImage,
  generateSecureStoragePath,
  maskDocumentNumber,
} from '../../src/services/imageOptimizer.service.ts';
import { getServerSupabase } from '../../src/services/serverSupabase.ts';

export default async function handler(req: any, res: any) {
  const method = req.method || 'POST';

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

  if (method !== 'POST') {
    return sendJson(405, { error: 'Method not allowed. Use POST.' });
  }

  const {
    applicationId,
    documentType,
    fileBase64,
    originalFilename,
    documentNumber,
  } = req.body || {};

  if (!applicationId || !documentType || !fileBase64) {
    return sendJson(400, {
      error: 'Missing required parameters: applicationId, documentType, and fileBase64 are required.',
    });
  }

  if (!['AADHAAR', 'PAN', 'DRIVING_LICENSE'].includes(documentType)) {
    return sendJson(400, { error: 'Invalid documentType. Must be AADHAAR, PAN, or DRIVING_LICENSE.' });
  }

  try {
    // 1. Decode incoming base64 buffer
    const base64Clean = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const rawBuffer = Buffer.from(base64Clean, 'base64');

    // 2. Execute Image Optimization Pipeline (Validation -> Decode -> Resize -> Compress -> Strip Metadata)
    const optimized = await optimizeDocumentImage(rawBuffer);

    // 3. Generate Opaque Server-Side Storage Paths (never use user's original filename)
    const storagePath = generateSecureStoragePath(applicationId, documentType, false);
    const thumbnailPath = generateSecureStoragePath(applicationId, documentType, true);

    const supabase = getServerSupabase();

    // 4. Upload optimized files to Private Bucket 'driver-documents'
    const uploadVerify = await supabase.storage
      .from('driver-documents')
      .upload(storagePath, optimized.verificationBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadVerify.error) {
      console.warn('[DriverBee Storage] Verification upload fallback notice:', uploadVerify.error.message);
    }

    const uploadThumb = await supabase.storage
      .from('driver-documents')
      .upload(thumbnailPath, optimized.thumbnailBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadThumb.error) {
      console.warn('[DriverBee Storage] Thumbnail upload notice:', uploadThumb.error.message);
    }

    // 5. Delete previous document record for this type if resubmission
    try {
      await supabase
        .from('driver_documents')
        .delete()
        .eq('driver_application_id', applicationId)
        .eq('document_type', documentType);
    } catch {}

    // 6. Record metadata in database
    const maskedNumber = maskDocumentNumber(documentType, documentNumber);
    let docRecord: any = null;
    try {
      const { data: dbDoc, error: dbErr } = await supabase
        .from('driver_documents')
        .insert({
          driver_application_id: applicationId,
          document_type: documentType,
          storage_path: storagePath,
          thumbnail_path: thumbnailPath,
          original_filename: (originalFilename || `${documentType.toLowerCase()}.jpg`).slice(0, 100),
          mime_type: 'image/jpeg',
          file_size: optimized.verificationSize,
          width: optimized.width,
          height: optimized.height,
          document_number_masked: maskedNumber,
          verification_status: 'PENDING',
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!dbErr && dbDoc) {
        docRecord = dbDoc;
      }
    } catch {}

    // Fallback store when Supabase driver_documents table is not yet migrated
    if (!docRecord) {
      console.warn('[DriverBee Document Upload] Using fallback store for document');
      const { readFallbackStore, writeFallbackStore } = await import('../../src/services/driverOnboarding.service.ts');
      const store = readFallbackStore();
      docRecord = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        driver_application_id: applicationId,
        document_type: documentType,
        storage_path: storagePath,
        thumbnail_path: thumbnailPath,
        original_filename: (originalFilename || `${documentType.toLowerCase()}.jpg`).slice(0, 100),
        mime_type: 'image/jpeg',
        file_size: optimized.verificationSize,
        width: optimized.width,
        height: optimized.height,
        document_number_masked: maskedNumber,
        verification_status: 'PENDING',
        uploaded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        thumbnail_url: `data:image/jpeg;base64,${optimized.thumbnailBuffer.toString('base64')}`,
        signed_url: `data:image/jpeg;base64,${optimized.verificationBuffer.toString('base64')}`,
      };

      store.documents = store.documents.filter(
        (d) => !(d.driver_application_id === applicationId && d.document_type === documentType)
      );
      store.documents.push(docRecord);

      const targetApp = store.applications.find((a) => a.id === applicationId);
      if (targetApp) {
        targetApp.documents = store.documents.filter((d) => d.driver_application_id === applicationId);
        if (targetApp.status === 'RESUBMISSION_REQUIRED') {
          targetApp.status = 'PENDING';
        }
      }
      writeFallbackStore(store);
    }


    // 7. If application was RESUBMISSION_REQUIRED, reset status to PENDING
    await supabase
      .from('driver_applications')
      .update({ status: 'PENDING', updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .eq('status', 'RESUBMISSION_REQUIRED');

    return sendJson(201, {
      success: true,
      document: docRecord,
      metrics: {
        originalKB: (rawBuffer.length / 1024).toFixed(1),
        optimizedKB: (optimized.verificationSize / 1024).toFixed(1),
        savingsPercent: `${optimized.savingsPercent}%`,
        dimensions: `${optimized.width}x${optimized.height}`,
      },
    });
  } catch (err: any) {
    console.error('[DriverBee Document Upload] Processing error:', err.message || err);
    return sendJson(400, { error: err.message || 'Image optimization or upload error' });
  }
}
