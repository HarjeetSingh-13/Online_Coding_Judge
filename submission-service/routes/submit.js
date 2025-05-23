import express from 'express';
import prisma from '../db/client.js';
import handleSubmission from '../services/submitter.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const userId = 'cmb0p7p7d0000vcd8xrfqdo8c';
  const { code, language, problemId } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  console.log('Received submission:', { code, language, problemId });
  try {
    const id = await handleSubmission({ code, language, problemId });
    if (!id) {
      return res.status(500).json({ error: 'Failed to handle submission' });
    }
    res.status(200).json({ submissionId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
