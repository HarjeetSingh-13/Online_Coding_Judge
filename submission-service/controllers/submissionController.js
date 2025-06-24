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
  const problem = await axios.get(`${process.env.PROBLEM_SERVICE_URL}/api/problems/${problemId}`)
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
    const submissions = await prisma.submission.findMany();
    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}