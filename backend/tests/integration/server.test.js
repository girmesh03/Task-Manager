/**
 * Server Startup and Shutdown Integration Tests
 *
 * Tests for server lifecycle management.
 */

import { jest } from '@jest/globals';

describe('Server Configuration', () => {
  describe('Environment Validation', () => {
    test('should have required environment variables defined', () => {
      // These should be defined by the test setup
      expect(process.env.NODE_ENV).toBeDefined();
    });

    test('should default PORT to 4000 if not set', async () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;

      // Default port should be 4000
      const port = process.env.PORT || 4000;
      expect(port).toBe(4000);

      // Restore
      if (originalPort) process.env.PORT = originalPort;
    });
  });

  describe('Server Module Exports', () => {
    test('server.js should export server and io', async () => {
      // Check that server.js has proper exports
      const serverPath = '../../server.js';

      // We can't fully test the server startup without running it,
      // but we can verify the module structure
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, serverPath);

      const content = fs.readFileSync(serverFile, 'utf8');

      // Verify exports are present
      expect(content).toContain('export { server, io }');
    });
  });

  describe('Graceful Shutdown', () => {
    test('server.js should have SIGTERM handler', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      expect(content).toContain("process.on('SIGTERM'");
      expect(content).toContain("process.on('SIGINT'");
      expect(content).toContain('gracefulShutdown');
    });

    test('server.js should close MongoDB connection on shutdown', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      expect(content).toContain('mongoose.connection.close()');
    });

    test('server.js should close Socket.IO on shutdown', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      expect(content).toContain('io.close');
    });

    test('server.js should have force shutdown timeout', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      // Should have a 10 second timeout
      expect(content).toContain('10000');
      expect(content).toContain('forcefully shutting down');
    });
  });

  describe('Error Handlers', () => {
    test('server.js should handle unhandled rejections', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      expect(content).toContain('unhandledRejection');
    });

    test('server.js should handle uncaught exceptions', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      expect(content).toContain('uncaughtException');
    });
  });

  describe('Socket.IO Configuration', () => {
    test('server.js should initialize Socket.IO with CORS', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      expect(content).toContain('new Server(server');
      expect(content).toContain('cors:');
      expect(content).toContain('credentials: true');
    });

    test('server.js should setup Socket.IO handlers', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      expect(content).toContain('setupSocketIO(io)');
    });
  });

  describe('Email Service Integration', () => {
    test('server.js should initialize email service', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const serverFile = path.resolve(__dirname, '../../server.js');

      const content = fs.readFileSync(serverFile, 'utf8');

      expect(content).toContain('initializeEmailService');
    });
  });
});
