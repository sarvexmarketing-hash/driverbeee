import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function whatsappDevApiPlugin(): Plugin {
  return {
    name: 'whatsapp-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/webhooks/whatsapp') || url.startsWith('/api/webhooks/whatsapp')) {
          try {
            const { default: handler } = await server.ssrLoadModule('/api/webhooks/whatsapp.ts');
            let rawBody = '';
            req.on('data', (chunk: any) => { rawBody += chunk; });
            req.on('end', async () => {
              try {
                (req as any).body = rawBody ? JSON.parse(rawBody) : {};
              } catch {
                (req as any).body = rawBody;
              }
              (req as any).rawBody = rawBody;
              await handler(req, res);
            });
            return;
          } catch (err) {
            console.error('[Vite Dev API] WhatsApp webhook handler error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
            return;
          }
        }

        if (url.startsWith('/api/notify-booking')) {
          try {
            const { default: handler } = await server.ssrLoadModule('/api/notify-booking.ts');
            let rawBody = '';
            req.on('data', (chunk: any) => { rawBody += chunk; });
            req.on('end', async () => {
              try {
                (req as any).body = rawBody ? JSON.parse(rawBody) : {};
              } catch {
                (req as any).body = rawBody;
              }
              await handler(req, res);
            });
            return;
          } catch (err) {
            console.error('[Vite Dev API] Notify booking handler error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), whatsappDevApiPlugin()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: false,
    host: true
  }
});
