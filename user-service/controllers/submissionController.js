import { config } from 'dotenv';
import axios from 'axios';

config();

export async function submitSolution(req, res) {
	const { problemId, language, code } = req.body;
	const userId = req.user.id;
	console.log('Received submission:', { code, language, problemId, userId });
	if (!code || !language || !problemId || !userId) {
		return res.status(400).json({ message: 'Missing required fields' });
	}
	try {
		// const response = await axios.post(`${process.env.PROBLEM_SERVICE_URL}/api/submit`, {
		const response = await axios.post(`${process.env.SUBMISSION_SERVICE_URL}/api/submit`, {
			problemId,
			language,
			code,
			userId
		});

		res.status(200).json(response.data);
	} catch (error) {
		console.error('Error submitting solution:', error);
		if(error.status === 404) {
			return res.status(404).json({ message: error.message });
		}
		res.status(500).json({ message: 'Error submitting solution' });
	}
}  

export async function getSubmissions(req, res) {
	try {
		const response = await axios.get(`${process.env.SUBMISSION_SERVICE_URL}/api/submissions`);
		res.status(200).json(response.data);
	} catch (error) {
		if(error.status === 404) {
			return res.status(404).json({ message: error.message });
		}
		res.status(500).json({ message: 'Error fetching submissions' });
	}
}