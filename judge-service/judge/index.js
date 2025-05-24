import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { getSubmissionFromQueueCpp, getSubmissionFromQueuePython, addResultToQueue } from './queue.js';
import { runSubmissionInDocker, cleanUpTemp } from './utils.js';
import express from 'express';

const app = express();

config();

const TEMP_DIR = path.resolve(process.env.TEMP_SUBMISSION_PATH);
await fs.mkdir(TEMP_DIR, { recursive: true });

console.log('Judge Service started. Waiting for submissions...');

const MAX_WORKERS = 3;

const activeWorkers = {
  cpp: 0,
  python: 0,
};

async function judgeSubmission(submission) {
  const id = String(submission.id);
  const subPath = path.join(TEMP_DIR, id);
  await fs.mkdir(subPath, { recursive: true });
  console.log(submission);
  try {
    const codeFileName = submission.language === 'cpp' ? 'solution.cpp' : 'solution.py';
    await fs.writeFile(path.join(subPath, codeFileName), submission.code);
    const result = await runSubmissionInDocker(submission.language, submission.problemId, subPath);
    console.log(`Submission ${id} => Verdict: ${result.verdict}`);
    submission.verdict = result.verdict;
    submission.runtime = result.runtime;
    submission.debugInfo = result.debugInfo;
    await addResultToQueue(submission);

  } catch (err) {
    console.error(`Error handling submission ${id}`, err);
  } finally {
    await cleanUpTemp(subPath);
  }
}

async function workerLoop(language, getQueueFunc) {
  while (true) {
    if (activeWorkers[language] < MAX_WORKERS) {
      const submission = await getQueueFunc();
      if (submission && submission.id) {
        activeWorkers[language]++;
        judgeSubmission(submission)
          .catch(console.error)
          .finally(() => {
            activeWorkers[language]--;
          });
      } else {
        await new Promise(r => setTimeout(r, 500));
      }
    } else {
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

async function main() {
  try {
    await Promise.all([
      workerLoop('cpp', getSubmissionFromQueueCpp),
      workerLoop('python', getSubmissionFromQueuePython)
    ]);
  } catch (err) {
    console.error('Fatal error in main:', err);
    process.exit(1);
  }
}

main();

app.listen(process.env.JUDGE_SERVICE_PORT, () => {
  console.log(`Judge service is running on port ${process.env.JUDGE_SERVICE_PORT}`);
});