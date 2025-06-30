import redis from 'redis';
import prisma from '../db/client.js';

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
client.connect();

async function getResult() {
    try {
    const res = await client.blPop('result_queue', 1);
    return JSON.parse(res?.element || '{}');
  } catch (err) {
    console.error('Queue error:', err);
    return null;
  }
}

async function workerLoop() {
  while (true) {
    const result = await getResult();
    if (result && result.id) {
      const submission = await prisma.submission.findUnique({
        where: { id: result.id },
        include: { problem: true },
      });
      if (!submission) {
        console.error(`Submission with ID ${result.id} not found`);
        continue;
      }
      await prisma.submission.update({
        where: { id: result.id },
        data: {
          verdict: result.verdict,
          runtime: result.runtime,
          debugInfo: result.debugInfo,
        },
      });
      // console.log(`Updated submission ${result.id} with verdict ${result.verdict}`);
    } else {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}
async function main() {
  try {
    await workerLoop();
  } catch (err) {
    console.error('Fatal error in main:', err);
    process.exit(1);
  }
}

export default main;

