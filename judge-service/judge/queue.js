import redis from 'redis';

const client = redis.createClient({
  url: 'redis://localhost:6379'
});
await client.connect();

export async function getSubmissionFromQueuePython() {
  try {
    const res = await client.blPop('submission_queue_python', 1);
    return JSON.parse(res?.element || '{}');
  } catch (err) {
    console.error('Queue error:', err);
    return null;
  }
}

export async function getSubmissionFromQueueCpp() {
  try {
    const res = await client.blPop('submission_queue_cpp', 1);
    return JSON.parse(res?.element || '{}');
  } catch (err) {
    console.error('Queue error:', err);
    return null;
  }
}
