import unzipper from 'unzipper';
import path from 'path';

export const validateProblemData = async (data) => {
    const { title, description, inputMethod, outputMethod, testCaseCount, memoryLimit, timeLimit } = data;
    
    if (!title || !description || !inputMethod || !outputMethod || !testCaseCount || !memoryLimit || !timeLimit) {
        return 'All fields are required';
    }
    
    if (typeof title !== 'string' || title.length < 2) {
        return 'Title must be a string with at least 2 characters';
    }

    if (typeof description !== 'string' || description.length < 10) {
        return 'Description must be a string with at least 10 characters';
    }
    
    if (typeof inputMethod !== 'string') {
        return 'Input method must be "string';
    }
    
    if (typeof outputMethod !== 'string') {
        return 'Output method must be "string';
    }
    
    if (isNaN(testCaseCount) || testCaseCount <= 0) {
        return 'Test case count must be a positive number';
    }
    
    if (isNaN(memoryLimit) || memoryLimit <= 0) {
        return 'Memory limit must be a positive number';
    }
    
    if (isNaN(timeLimit) || timeLimit <= 0) {
        return 'Time limit must be a positive number';
    }

    return null;
}

export const validateTestCase = async (file, testCaseCount) => {
    if (!file) {
        return 'Testcases file is required';
    }
    
    if (file.mimetype !== 'application/zip' && file.mimetype !== 'application/x-zip-compressed' && file.mimetype !== 'multipart/x-zip') {
        return 'Invalid file type. Only zip files are allowed.';
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10 MB
        return 'File size exceeds the limit of 10 MB';
    }
    
    const inputFiles = new Set();
    const outputFiles = new Set();

    try {
        const directory = await unzipper.Open.file(file.path);
        directory.files.forEach((file) => {
            if(file.type === 'File') {
                const filename = path.basename(file.path);
                const inputMatch = filename.match(/^input_(\d+)\.txt$/);
                const outputMatch = filename.match(/^expected_output_(\d+)\.txt$/);
                console.log(filename, inputMatch, outputMatch);
                if (inputMatch) {
                    inputFiles.add(inputMatch[1]);
                } else if (outputMatch) {
                    outputFiles.add(outputMatch[1]);
                } else {
                    return 'Invalid file name format. Expected input_1.txt, output_1.txt, etc.';
                }
            } else {
                return 'Invalid file structure. Only files are allowed.';
            }
        });

        if (inputFiles.size !== testCaseCount || outputFiles.size !== testCaseCount) {
            return `Expected ${testCaseCount} input and output files, but found ${inputFiles.size} input and ${outputFiles.size} output files.`;
        }

        for (let i = 1; i <= testCaseCount; i++) {
            if (!inputFiles.has(String(i)) || !outputFiles.has(String(i))) {
                return `Missing input or output file for test case ${i}`;
            }
        }
        return null;
    } catch (error) {
        console.error('Error reading zip file:', error);
        return 'Error reading zip file';
    }
}
