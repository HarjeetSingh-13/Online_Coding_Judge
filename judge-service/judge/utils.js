import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { config } from 'dotenv';

config();
const INPUT_OUTPUT_PATH = path.resolve(process.env.TEST_INPUT_OUTPUT_PATH);
const PROBLEM_SERVICE_URL = process.env.PROBLEM_SERVICE_URL;

async function getProblemById(problemId) {
  try {
    const response = await axios.get(`${PROBLEM_SERVICE_URL}/problems/${problemId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching problem:', error);
    return null;
  }
}

const execAsync = util.promisify(exec);

export async function runSubmissionInDocker(language, id, subPath) {
  const dockerImage = language === 'cpp' ? 'cpp-runner' : 'python-runner';

  const problem = await getProblemById(id);
  if (!problem) {
    throw new Error('Problem not found');
  }

  const testCaseCount = problem.testCaseCount;
  const codeMount = `${subPath}:/home/judgeuser/code:ro`;
  const memoryLimit = problem.memoryLimit;
  const timeLimit = problem.timeLimit;

  let maxRuntime = 0;

  for(let i = 1; i <= testCaseCount; i++) {
    console.log(`Running test case ${i}...`);

    const inputFileName = `input_${i}.txt`;
    const expectedOutputFileName = `expected_output_${i}.txt`;
    const inputFilePath = path.join(INPUT_OUTPUT_PATH, `${id}`, inputFileName);
    const expectedOutputFilePath = path.join(INPUT_OUTPUT_PATH, `${id}`, expectedOutputFileName);
    const inputMount = `${inputFilePath}:/home/judgeuser/input.txt:ro`;
    const expectedMount = `${expectedOutputFilePath}:/home/judgeuser/expected_output.txt:ro`;
    const cmd = [
      'docker run --rm',
      '--cpus=1',
      '--memory=256m',
      '--pids-limit=64',
      '--cap-drop=ALL',
      '--security-opt no-new-privileges:true',
      '--network=none',
      '--tmpfs /tmp:exec',
      `-e TIME_LIMIT=${timeLimit}`,
      `-e MEMORY_LIMIT=${memoryLimit*1024}`,
      `-v ${codeMount}`,
      `-v ${inputMount}`,
      `-v ${expectedMount}`,
      dockerImage,
      'bash /home/judgeuser/judge.sh'
    ].join(' ');
    try {
      const { stdout, stderr } = await execAsync(cmd);
      // console.log('[stdout]', stdout);
      // if (stderr) console.error('[stderr]', stderr);
      const res = stdout.trim().split('\n').pop();
      const result = JSON.parse(res);
      maxRuntime = Math.max(maxRuntime, result.runtime);
      console.log(`Test case ${i} result:`, result);
      if (result.verdict !== 'Accepted') {
        if(result.verdict !== 'Compilation Error') {
          result.verdict = result.verdict + ` on test case ${i}`;
        } 
        return result;
      }
    } catch (err) {
      console.error('[exec error]', err);
      if (err.stdout) console.log('[stdout]', err.stdout);
      if (err.stderr) console.error('[stderr]', err.stderr);
      return {
        verdict: `Runtime Error on test case ${i}`,
        runtime: 0,
        debug_info: ''
      }; 
    }
  }
  return {
    verdict: 'Accepted',
    runtime: maxRuntime,
    debug_info: ''
  };
}

export async function cleanUpTemp(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}
