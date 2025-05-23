import fs from 'fs/promises';
import path from 'path';
import prisma from './db/client.js';
import { config } from 'dotenv';
import { getSubmissionFromQueueCpp, getSubmissionFromQueuePython } from './queue.js';
import { runSubmissionInDocker, cleanUpTemp } from './utils.js';

config();

const TEMP_DIR = path.resolve(process.env.TEMP_SUBMISSION_PATH);
await fs.mkdir(TEMP_DIR, { recursive: true });

console.log('Judge Service started. Waiting for submissions...');

const MAX_WORKERS = 3;

const activeWorkers = {
  cpp: 0,
  python: 0,
};

// async function addProblem() {
//   const newProblem = await prisma.problem.create({
//     data: {
//       title: "Addition of Two Numbers",
//       description: "Given two integers, output their sum.",
//       inputMethod: "stdin",
//       outputMethod: "stdout",
//       testCaseCount: 2,
//       memoryLimit: 256,
//       timeLimit: 1,
//     } 
//   });

//   console.log(newProblem);
// }

// addProblem();

async function judgeSubmission(submission) {
  const id = submission.id;
  const subPath = path.join(TEMP_DIR, id);
  await fs.mkdir(subPath, { recursive: true });
  console.log(submission);
  try {
    const codeFileName = submission.language === 'cpp' ? 'solution.cpp' : 'solution.py';
    await fs.writeFile(path.join(subPath, codeFileName), submission.code);
    const result = await runSubmissionInDocker(submission.language, submission.problemId, subPath);
    console.log(`Submission ${id} => Verdict: ${result.verdict}`);

    // TODO: Update DB status here

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

