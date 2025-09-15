const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Apply default middlewares (logger, static, cors, no-cache)
server.use(middlewares);

// Example: apply routes.json if you have it
try {
  const routes = require("./routes.json");
  server.use(jsonServer.rewriter(routes));
} catch (err) {
  console.log("No routes.json found, using default routes");
}

// Use default router
server.use(router);

server.listen(5050, () => {
  console.log("🚀 JSON Server is running on http://localhost:5050");
});
