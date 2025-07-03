import prisma from '../db/client.js';
import { config } from 'dotenv';
import unzipper from 'unzipper';
import path from 'path';
import fs from 'fs/promises';
import fss from 'fs';
import { validateProblemData, validateTestCase } from '../utils/validateProblem.js';

config();
const PERM_TEST_CASE_DIR = process.env.PERM_TEST_CASE_DIR;

export async function getProblems(req, res) {
  try {
    const userId = req.userId;
    const problems = await prisma.problem.findMany();
    let statusMap = new Map();

    if (userId) {
      const userProblemStatuses = await prisma.userProblemStatus.findMany({
        where: { userId },
        select: { problemId: true, status: true },
      });

      statusMap = new Map(userProblemStatuses.map(s => [s.problemId, s.status]));
    }

    const enrichedProblems = problems.map(problem => ({
      ...problem,
      status: statusMap.get(problem.id) || 'not_attempted',
    }));

    res.status(200).json(enrichedProblems);

  } catch (error) {
    console.error('Error fetching problems: ', error);
    res.status(500).json({ message: 'Error fetching problems' });
  }
}


export async function getProblem(req, res) {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: Number(id) },
    });
    if (!problem || problem === null) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    problem.status = "not-attempted";
    if(userId){
      const userProblemStatus = await prisma.userProblemStatus.findUnique({
        where : {     
          userId_problemId: {
            userId: userId,
            problemId: Number(id),
          },
        },
        select : { status: true }
      });
      if (userProblemStatus) {
        problem.status = userProblemStatus.status;
      }
    }
    res.status(200).json(problem);
  } catch (error) {
    console.log('Error fetching problem: ', error);
    res.status(500).json({ message: 'Error fetching problem' });
  }
}

export async function createProblem(req, res) {
  const {
    title,
    description,
    inputMethod,
    outputMethod,
    testCaseCount,
    memoryLimit,
    timeLimit,
  } = req.body;

  if (
    !title ||
    !description ||
    !inputMethod ||
    !outputMethod ||
    !testCaseCount ||
    !memoryLimit ||
    !timeLimit
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Testcases file is required' });
  }

  const dataValidationError = await validateProblemData(req.body);
  if (dataValidationError) {
    return res.status(400).json({ message: dataValidationError });
  }

  const testCaseValidationError = await validateTestCase(req.file, Number(testCaseCount));
  if (testCaseValidationError) {
    return res.status(400).json({ message: testCaseValidationError });
  }

  let problem;

  try {
    problem = await prisma.problem.create({
      data: {
        title,
        description,
        inputMethod,
        outputMethod,
        testCaseCount: Number(testCaseCount),
        memoryLimit: Number(memoryLimit),
        timeLimit: Number(timeLimit),
      },
    });

    const problemIdStr = String(problem.id);
    const targetDir = path.join(PERM_TEST_CASE_DIR, problemIdStr);
    const tempExtractDir = path.join(targetDir, '__temp__');

    await fs.mkdir(tempExtractDir, { recursive: true });

    await fss.createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: tempExtractDir }))
      .promise();

    const extractedItems = await fs.readdir(tempExtractDir, { withFileTypes: true });
    const firstItem = extractedItems[0];

    if (firstItem?.isDirectory()) {
      const innerFolder = path.join(tempExtractDir, firstItem.name);
      const innerFiles = await fs.readdir(innerFolder);
      for (const file of innerFiles) {
        await fs.rename(
          path.join(innerFolder, file),
          path.join(targetDir, file)
        );
      }
    } else {
      for (const item of extractedItems) {
        await fs.rename(
          path.join(tempExtractDir, item.name),
          path.join(targetDir, item.name)
        );
      }
    }

    await fs.rm(tempExtractDir, { recursive: true, force: true });
    await fs.unlink(req.file.path).catch(() => { });

    return res.status(201).json({ message: 'Problem created successfully', problemId: problem.id });

  } catch (error) {
    console.error('Error creating problem:', error);

    if (problem?.id) {
      await prisma.problem.delete({ where: { id: problem.id } }).catch(() => { });
      await fs.rm(path.join(PERM_TEST_CASE_DIR, String(problem.id)), {
        recursive: true,
        force: true,
      }).catch(() => { });
    }

    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => { });
    }

    return res.status(500).json({ message: 'Error creating problem' });
  }
}

export async function updateProblem(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Problem ID is required' });
  }
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: Number(id) },
    });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    const updateData = {
      title: req.body.title ?? problem.title,
      description: req.body.description ?? problem.description,
      inputMethod: req.body.inputMethod ?? problem.inputMethod,
      outputMethod: req.body.outputMethod ?? problem.outputMethod,
      testCaseCount: problem.testCaseCount,
      timeLimit: req.body.timeLimit ?? problem.timeLimit,
      memoryLimit: req.body.memoryLimit ?? problem.memoryLimit,
    };
    const dataValidationError = await validateProblemData(updateData);
    if (dataValidationError) {
      return res.status(400).json({ message: dataValidationError });
    }
    const updatedProblem = await prisma.problem.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.status(200).json(updatedProblem);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ message: 'Error updating problem' });
  }
}

export async function addTestCase(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Problem ID is required' });
  }

  const count = Number(req.body.count);
  if (!count) {
    return res.status(400).json({ message: 'Test case count is required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Testcases file is required' });
  }

  const dataValidationError = await validateTestCase(req.file, count);
  if (dataValidationError) {
    return res.status(400).json({ message: dataValidationError });
  }

  const targetDir = path.join(PERM_TEST_CASE_DIR, String(id));
  const tempExtractDir = path.join(targetDir, '__temp__');

  try {
    await fs.mkdir(tempExtractDir, { recursive: true });

    await fss.createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: tempExtractDir }))
      .promise();

    const extractedItems = await fs.readdir(tempExtractDir, { withFileTypes: true });
    const firstItem = extractedItems[0];
    const regex = /(input|expected_output)_(\d+)\.txt/;

    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT * FROM "Problem" WHERE id = ${Number(id)} FOR UPDATE`;
      
      const problem = await tx.problem.findUnique({
        where: { id: Number(id) },
      });

      if (!problem) {
        throw new Error('Problem not found');
      }

      const testCaseCount = problem.testCaseCount;

      if (firstItem?.isDirectory()) {
        const innerFolder = path.join(tempExtractDir, firstItem.name);
        const innerFiles = await fs.readdir(innerFolder);
        for (const file of innerFiles) {
          const match = file.match(regex);
          if (!match) {
            throw new Error('Invalid test case file name');
          }
          const prefix = match[1];
          const oldNum = Number(match[2]);
          const newNum = testCaseCount + oldNum;
          const newFileName = `${prefix}_${newNum}.txt`;
          await fs.rename(
            path.join(innerFolder, file),
            path.join(targetDir, newFileName)
          );
        }
      } else {
        for (const item of extractedItems) {
          const file = item.name;
          const match = file.match(regex);
          if (!match) {
            throw new Error('Invalid test case file name');
          }
          const prefix = match[1];
          const oldNum = Number(match[2]);
          const newNum = testCaseCount + oldNum;
          const newFileName = `${prefix}_${newNum}.txt`;
          await fs.rename(
            path.join(tempExtractDir, file),
            path.join(targetDir, newFileName)
          );
        }
      }

      await tx.problem.update({
        where: { id: Number(id) },
        data: {
          testCaseCount: testCaseCount + count,
        },
      });
    });

    await fs.rm(tempExtractDir, { recursive: true, force: true });
    await fs.unlink(req.file.path).catch(() => { });

    return res.status(201).json({ message: 'Test cases added successfully' });
  } catch (error) {
    console.error('Error adding test cases:', error);
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => { });
    }
    return res.status(500).json({ message: 'Error adding test cases' });
  }
}


export async function deleteProblem(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Problem ID is required' });
  }
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: Number(id) },
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const problemDir = path.join(PERM_TEST_CASE_DIR, String(id));

    await prisma.problem.delete({
      where: { id: Number(id) },
    });
    await fs.rm(problemDir, { recursive: true, force: true });

    return res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Error deleting problem:', error);
    return res.status(500).json({ message: 'Error deleting problem' });
  }
}