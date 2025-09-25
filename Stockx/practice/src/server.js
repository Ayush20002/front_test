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

// --- Custom Public Routes (Login & Register) ---
server.post(`${API_PREFIX}/auth/login`, (req, res) => {
  const { email, password } = req.body;
  const users = dbMap.users.get('users').value() || [];
  const user = users.find(
    u => u.email === email && (u.password === password || u.password.startsWith(`hashed_${password}_`))
  );
  if (user) {
    const { password, ...userSafe } = user;
    res.jsonp({ ...userSafe, jwt: FAKE_JWT });
  } else {
    res.status(401).jsonp(apiResponses.loginFailure);
  }
});

server.post(`${API_PREFIX}/auth/register`, (req, res) => {
  const { name, email, password, phoneNumber } = req.body;
  if (!name || !email || !password) {
    return res.status(400).jsonp({ message: 'Name, email, and password are required.' });
  }
  if (phoneNumber && !/^\d{10,15}$/.test(phoneNumber)) {
    return res.status(400).jsonp({ message: 'Phone number must be between 10 and 15 digits.' });
  }

  const usersDb = dbMap.users.get('users');
  const existingUser = usersDb.find({ email }).value();
  if (existingUser) {
    return res.status(409).jsonp({ message: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    email,
    password: `hashed_${password}_${Date.now()}`,
    phoneNumber: phoneNumber || '',
    role: 'MANAGER'
  };

  usersDb.push(newUser).write();
  router.db.set('users', usersDb.value());
  const { password: _, ...userSafe } = newUser;
  return res.status(201).jsonp({ ...userSafe, jwt: FAKE_JWT });
});

// --- Universal Security Middleware ---
server.use((req, res, next) => {
  const publicRoutes = [`${API_PREFIX}/auth/login`, `${API_PREFIX}/auth/register`];
  if (publicRoutes.includes(req.path)) {
    next();
  } else {
    checkAuth(req, res, next);
  }
});

// --- Custom Protected Handlers ---
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
    const supplier = supplierId ? dbMap.suppliers.get('suppliers').find({ id: String(supplierId) }).value() : null;

    if (!product || !user || (isPurchase && !supplier)) {
      return res.status(404).jsonp({ error: 'Product, User, or Supplier not found' });
    }

    // REMOVED: All logic for updating stock quantity is gone from this block.

    const { password, ...userSafe } = user;
    const transactionsDb = dbMap.transactions.get('transactions');
    const newTransaction = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      transactionType: isSell ? 'SELL' : 'PURCHASE',
      status: 'PENDING', // CHANGED: All new transactions are now PENDING
      product,
      user: userSafe,
      supplier,
      totalProducts: quantity,
      totalPrice: product.price * quantity,
      createdAt: new Date().toISOString(),
      ...rest,
    };

    transactionsDb.push(newTransaction).write();
    router.db.set('transactions', transactionsDb.value());

    return res.status(201).jsonp(newTransaction);
  }
  next();
});

// --- Generic Persistence Middleware (with Smart Transaction Updates) ---
server.use((req, res, next) => {
  const resource = req.path.replace(`${API_PREFIX}/`, '').split('/')[0];
  if (!dbMap[resource] || req.method === 'GET') {
    return next();
  }
  
  const id = req.path.split('/').pop();
  const data = req.body;
  const resourceChain = dbMap[resource].get(resource);

  // --- NEW: Special logic for PATCHing transactions ---
  if (resource === 'transactions' && req.method === 'PATCH' && data.status) {
    const oldTransaction = resourceChain.find({ id: String(id) }).value();
    const newStatus = data.status;

    if (!oldTransaction) {
      return res.status(404).jsonp({ error: `Transaction with id ${id} not found` });
    }

    if (newStatus !== oldTransaction.status) {
      const productsDb = dbMap.products.get('products');
      const product = productsDb.find({ id: String(oldTransaction.product.id) }).value();
      let newStockQuantity = product.stockQuantity;

      // Case 1: Reversing a COMPLETED order (e.g., to CANCELLED)
      if (oldTransaction.status === 'COMPLETED') {
        newStockQuantity = oldTransaction.transactionType === 'SELL'
          ? product.stockQuantity + oldTransaction.totalProducts // Add stock back
          : product.stockQuantity - oldTransaction.totalProducts; // Remove stock
      }
      
      // Case 2: Fulfilling an order by setting it TO COMPLETED
      if (newStatus === 'COMPLETED') {
        newStockQuantity = oldTransaction.transactionType === 'SELL'
          ? product.stockQuantity - oldTransaction.totalProducts // Remove stock
          : product.stockQuantity + oldTransaction.totalProducts; // Add stock
      }

      // Save the updated stock quantity to products.json
      productsDb.find({ id: String(product.id) }).assign({ stockQuantity: newStockQuantity }).write();
      router.db.set('products', productsDb.value());
    }

    // Finally, update the transaction itself with the new status
    const updatedTransaction = resourceChain.find({ id: String(id) }).assign(data).write();
    router.db.set('transactions', resourceChain.value());
    return res.jsonp(updatedTransaction);
  }

  // --- Logic for all other POST, PUT, PATCH, DELETE operations ---
  if (req.method === 'POST') {
    if (!data.id) data.id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    resourceChain.push(data).write();
    router.db.set(resource, resourceChain.value());
    return res.status(201).jsonp(data);
  }

  const item = resourceChain.find({ id: String(id) });
  if (!item.value()) {
    return res.status(404).jsonp({ error: `${resource} with id ${id} not found` });
  }
  
  if (req.method === 'PATCH') { // For non-transaction patches
    const updatedItem = item.assign(data).write();
    router.db.set(resource, resourceChain.value());
    return res.jsonp(updatedItem);
  }
  if (req.method === 'PUT') {
    const replacedItem = item.assign({ ...data, id: String(id) }).write();
    router.db.set(resource, resourceChain.value());
    return res.jsonp(replacedItem);
  }
  if (req.method === 'DELETE') {
    resourceChain.remove({ id: item.value().id }).write();
    router.db.set(resource, resourceChain.value());
    return res.status(204).jsonp({});
  }
});
// --- Default Router ---
server.use(API_PREFIX, router);

// --- Server Start ---
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});