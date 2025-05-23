const redis = require('redis');
const { generateId } = require('../utils/idGenerator');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
client.connect();

async function handleSubmission({ code, language, problemId }) {
  const id = await generateId();
  const submission = { id, code, language, problemId, status: 'queued' };
  switch (language) {
    case 'cpp':
      console.log(submission);
      await client.rPush('submission_queue_cpp', JSON.stringify(submission));
      break;
    case 'python':
      await client.rPush('submission_queue_python', JSON.stringify(submission));
      break;
    default:
      throw new Error('Unsupported language');
  }
  return id;
}

module.exports = { handleSubmission };
