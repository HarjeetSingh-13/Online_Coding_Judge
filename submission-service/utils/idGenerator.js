const redis = require('redis');

const idClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
idClient.connect();

async function generateId() {
  const id = await idClient.incr('submission_id_counter');
  return `sub_${id}`;
}

module.exports = { generateId };
