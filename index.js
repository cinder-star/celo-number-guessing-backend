const server = require('./server');

function options() {
  return {
    port: process.env.PORT || 8080,
    clientDirPath: process.env.CLIENT_DIR || null,
    indexPath: process.env.INDEX || null,
    staticDirPath: process.env.STATIC_DIR || null
  };
}

/**
 * Initialize the service and start managing it.
 */
(async function () {
  const service = await server.start(options());
  server.autoManageShutdown(service);
})();
