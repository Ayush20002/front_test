const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = 5050;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// --- CUSTOM ROUTES START ---
// The placement here, before server.use(router), is crucial.

// Custom route to get users without their passwords
server.get('/api/users', (req, res) => {
  const db = router.db.getState();
  const usersWithoutPasswords = db.users.map(user => {
    const { password, ...userSafe } = user;
    return userSafe;
  });
  res.jsonp(usersWithoutPasswords);
});

// Custom POST route for handling logins
server.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db.getState();
  const user = db.users.find(
    u => u.email === email && u.password === password
  );

  if (user) {
    // If the user is found, send back a fake token along with the user data
    const { password, ...userSafe } = user;
    res.jsonp({
      token: "this-is-a-fake-jwt-token-for-mocking", // Our new fake token
      user: userSafe
    });
  } else {
    res.status(401).jsonp({
      error: "Invalid email or password"
    });
  }
});

// --- CUSTOM ROUTES END ---


// This rewrites URLs based on routes.json for things like /api/transactions/sell
const routes = require('./routes.json');
server.use(jsonServer.rewriter(routes));


// Use the default JSON Server router
server.use(router);


server.listen(port, () => {
  console.log(`🚀 JSON Server is running on http://localhost:${port}`);
});