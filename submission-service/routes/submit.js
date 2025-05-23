import express from 'express';
import prisma from '../db/client.js';
import handleSubmission from '../services/submitter.js';

const router = express.Router();

router.post('/submit', async (req, res) => {
  const { userId, code, language, problemId } = req.body;
  console.log('Received submission:', { code, language, problemId, userId });
  if (!code || !language || !problemId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  console.log('Received submission:', { code, language, problemId, userId });
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
});

router.get('/submissions', async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany();
    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
