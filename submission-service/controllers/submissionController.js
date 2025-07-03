import prisma from '../db/client.js';
import handleSubmission from '../services/submitter.js';
import axios from 'axios';
import { config } from 'dotenv';

config();

export async function submit(req, res) {
  const userId = req.userId;
  // console.log(req.userId);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { code, language, problemId } = req.body;
  // console.log('Received submission:', { code, language, problemId, userId });
  if (!code || !language || !problemId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const problem = await axios.get(`${process.env.PROBLEM_SERVICE_URL}/problems/${problemId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching problem:', error);
      return null;
    });

  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  // const user = await axios.get(`${process.env.USER_SERVICE_URL}/api/user/${userId}`)
  //   .then(response => response.data)
  //   .catch(error => {
  //     console.error('Error fetching user:', error);
  //     return null;
  //   });
  // if (!user) {
  //   return res.status(404).json({ error: 'User not found' });
  // }
  // console.log('Received submission:', { code, language, problemId, userId });
  try {
    const id = await handleSubmission({ code, language, problemId, userId });
    if (!id) {
      return res.status(500).json({ error: 'Failed to handle submission' });
    }
    res.status(200).json({ submissionId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getSubmissions(req, res) {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { id: 'desc' },
      take: 100
    });
    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getSubmissionById(req, res) {
  const { id } = req.params;
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: parseInt(id, 10) }
    });
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.status(200).json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getSubmissionByUserId(req, res) {
  const userId = req.params.id;
  try {
    if(!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const submissions = await prisma.submission.findMany({
      where: { userId: userId },
      orderBy: { id: 'desc' },
      take: 100
    });
    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getSubmissionByProblemId(req, res) {
  const problemId = req.params.id;
  try {
    if(!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }
    const submissions = await prisma.submission.findMany({
      where: { problemId: parseInt(problemId) },
      orderBy: { id: 'desc' },
      take: 100
    });
    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getSubmissionByUserIdAndProblemId(req, res) {
  const { userId, problemId } = req.params;
  try {
    if(!userId || !problemId) {
      return res.status(400).json({ error: 'User ID and Problem ID are required' });
    }
    const submission = await prisma.submission.findMany({
      where: {
        userId: userId,
        problemId: parseInt(problemId)
      },
      orderBy: { id: 'desc' }
    });
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.status(200).json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getStatus(req, res) {
  const { userId } = req.userId;
  try {
    const statuses = await prisma.userProblemStatus.findMany({
      where: { userId },
      select: { problemId: true, status: true },
    });
    if (!statuses) {
      return res.status(404).json({ error: 'Status not found' });
    }
    res.status(200).json(statuses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}