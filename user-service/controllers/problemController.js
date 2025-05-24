import { config } from 'dotenv';
import axios from 'axios';

config();

export async function getProblems(req, res) {
	axios.get(`${process.env.PROBLEM_SERVICE_URL}/api/problems`)
		.then(response => {
			const problems = response.data;
			return res.status(200).json(problems);
		})
		.catch(error => {
			console.error('Error fetching problems:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		});
}  

export async function getProblemById(req, res) {
	const { id } = req.params;
	if (!id) {
		return res.status(400).json({ error: 'Problem ID is required' });
	}
	axios.get(`${process.env.PROBLEM_SERVICE_URL}/api/problems/${id}`)
		.then(response => {
			const problem = response.data;
			if (!problem) {
				return res.status(404).json({ error: 'Problem not found' });
			}
			return res.status(200).json(problem);
		})
		.catch(error => {
			if (error.response && error.response.status === 404) {
				return res.status(404).json({ error: 'Problem not found' });
			} else{
				console.error('Error fetching problem:', error);
				return res.status(500).json({ error: 'Internal Server Error' });
		}
	});
}