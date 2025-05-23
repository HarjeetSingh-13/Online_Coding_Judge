const express = require('express');
const router = express.Router();
const submitter = require('../services/submitter');

router.post('/', async (req, res) => {
  const { code, language, problemId } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  console.log('Received submission:', { code, language, problemId });
  try {
    const id = await submitter.handleSubmission({ code, language, problemId });
    if (!id) {
      return res.status(500).json({ error: 'Failed to handle submission' });
    }
    res.status(200).json({ submissionId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
