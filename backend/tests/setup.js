const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');

let mongoServer;

beforeAll(async () => {
  const opts = {};
  const binaryPath = 'C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.exe';
  if (fs.existsSync(binaryPath)) {
    opts.binary = { systemBinary: binaryPath };
  }
  mongoServer = await MongoMemoryServer.create(opts);
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
