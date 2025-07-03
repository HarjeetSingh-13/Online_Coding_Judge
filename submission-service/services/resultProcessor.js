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
      const { userId, problemId } = submission;
      await prisma.submission.update({
        where: { id: result.id },
        data: {
          verdict: result.verdict,
          runtime: result.runtime,
          debugInfo: result.debugInfo,
        },
      });
      const existing = await prisma.userProblemStatus.findUnique({
        where: {
          userId_problemId: {
            userId,
            problemId
          },
        },
      });

      if (result.verdict === 'Accepted') {
        if (!existing) {
          await prisma.userProblemStatus.create({
            data: {
              userId,
              problemId,
              status: 'solved',
            },
          });
        } else if (existing.status !== 'solved') {
          await prisma.userProblemStatus.update({
            where: { userId_problemId: { userId, problemId } },
            data: { status: 'solved' },
          });
        }
      } else {
        if (!existing) {
          await prisma.userProblemStatus.create({
            data: {
              userId,
              problemId,
              status: 'attempted',
            },
          });
        }
      }
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

