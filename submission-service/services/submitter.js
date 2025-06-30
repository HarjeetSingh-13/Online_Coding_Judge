import redis from 'redis';
import prisma from '../db/client.js';

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
client.connect();

async function handleSubmission({ code, language, problemId, userId }) {
  const submission = await prisma.submission.create({
    data: {
      userId: userId,
      code: code,
      language: language,
      problemId: problemId,
      verdict: 'pending',
      runtime: 0,
      debugInfo: ''
    },
  });
  switch (language) {
    case 'cpp':
      // console.log(submission);
      await client.rPush('submission_queue_cpp', JSON.stringify(submission));
      break;
    case 'python':
      await client.rPush('submission_queue_python', JSON.stringify(submission));
      break;
    default:
      throw new Error('Unsupported language');
  }
  return submission.id;
}

export default handleSubmission;
