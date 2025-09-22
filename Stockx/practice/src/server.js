const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { FAKE_JWT, apiResponses } = require('./responses');

const API_PREFIX = '/api/v1';

// --- Authentication Middleware ---
const checkAuth = (req, res, next) => {
  const header = req.header('Authorization');
  if (!header) {
    return res.status(401).jsonp(apiResponses.unauthorized);
  }
  const token = header.replace('Bearer ', '');
  if (token === FAKE_JWT) {
    next();
  } else {
    return res.status(403).jsonp(apiResponses.forbidden);
  }
};

// --- Database Setup for Multiple Files ---
const dataDir = path.join(__dirname, 'data');
const dbMap = {};
fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const resourceName = file.replace('.json', '');
    const adapter = new FileSync(path.join(dataDir, file));
    dbMap[resourceName] = low(adapter);
  }
});

const db = {};
Object.keys(dbMap).forEach(resource => {
  db[resource] = dbMap[resource].get(resource).value() || [];
});

const router = jsonServer.router(db, { id: 'id' });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// --- Custom Public Route for Login ---
server.post(`${API_PREFIX}/auth/login`, (req, res) => {
  const { email, password } = req.body;
  const users = dbMap.users.get('users').value() || [];
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...userSafe } = user;
    res.jsonp({ ...userSafe, jwt: FAKE_JWT });
  } else {
    res.status(401).jsonp(apiResponses.loginFailure);
  }
});

// --- Universal Security Middleware ---
server.use((req, res, next) => {
  if (req.path === `${API_PREFIX}/auth/login`) {
    next();
  } else {
    checkAuth(req, res, next);
  }
});

// --- Custom Protected Handlers ---
// This custom handler for GET /users removes passwords from the response.
server.get(`${API_PREFIX}/users`, (req, res) => {
  const users = dbMap.users.get('users').value() || [];
  const safeUsers = users.map(user => {
    const { password, ...userSafe } = user;
    return userSafe;
  });
  res.jsonp(safeUsers);
});

// --- Custom Sell/Purchase Transactions Handler ---
server.use((req, res, next) => {
  const isSell = req.path.endsWith('/transactions/sell');
  const isPurchase = req.path.endsWith('/transactions/purchase');

  if ((isSell || isPurchase) && req.method === 'POST') {
    const { productId, userId, supplierId, quantity, ...rest } = req.body;

    const product = dbMap.products.get('products').find({ id: String(productId) }).value();
    const user = dbMap.users.get('users').find({ id: String(userId) }).value();
    const supplier = supplierId
      ? dbMap.suppliers.get('suppliers').find({ id: String(supplierId) }).value()
      : null;

    if (!product || !user || (isPurchase && !supplier)) {
      return res.status(404).jsonp({ error: 'Product, User, or Supplier not found' });
    }

    const { password, ...userSafe } = user;

    // ✅ Safely handle empty transactions
    const transactions = router.db.get('transactions').value() || [];
    const newTransaction = {
      id: String(transactions.length + 1),
      transactionType: isSell ? 'SELL' : 'PURCHASE',
      status: 'COMPLETED',
      product,
      user: userSafe,
      supplier,
      totalProducts: quantity,
      totalPrice: product.price * quantity,
      createdAt: new Date().toISOString(),
      ...rest,
    };

    dbMap.transactions.get('transactions').push(newTransaction).write();
    router.db.set('transactions', dbMap.transactions.get('transactions').value()).write();

    return res.status(201).jsonp(newTransaction);
  }

  next();
});

// --- Generic Persistence Middleware (for all other write operations) ---
server.use((req, res, next) => {
  const resource = req.path.replace(`${API_PREFIX}/`, '').split('/')[0];

  if (!dbMap[resource] || req.method === 'GET') {
    return next();
  }

  const id = req.path.split('/').pop();
  const data = req.body;
  const resourceChain = dbMap[resource].get(resource);

  if (req.method === 'POST') {
    if (!data.id) data.id = String(resourceChain.value().length + 1);
    resourceChain.push(data).write();
    router.db.set(resource, resourceChain.value()).write();
    return res.status(201).jsonp(data);
  }

  const item = resourceChain.find({ id: String(id) });

  if (!item.value()) {
    return res.status(404).jsonp({ error: `${resource} with id ${id} not found` });
  }

  if (req.method === 'PATCH') {
    const updatedItem = item.assign(data).write();
    router.db.set(resource, resourceChain.value()).write();
    return res.jsonp(updatedItem);
  }

  if (req.method === 'PUT') {
    const replacedItem = item.assign({ ...data, id: String(id) }).write();
    router.db.set(resource, resourceChain.value()).write();
    return res.jsonp(replacedItem);
  }

  if (req.method === 'DELETE') {
    resourceChain.remove({ id: item.value().id }).write();
    router.db.set(resource, resourceChain.value()).write();
    return res.status(204).jsonp({});
  }
});

// --- Default Router (Now only handles GET requests) ---
server.use(API_PREFIX, router);

// --- Server Start ---
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
