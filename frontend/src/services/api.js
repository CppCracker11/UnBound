import axios from 'axios';

// Ensure this matches the port your FastAPI server is running on
const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const tspService = {
    // Check if a matrix is symmetric/metric
    diagnose: (matrix, n) =>
        apiClient.post('/diagnose', { matrix, n }),

    // Call the C-Engine with a specific algorithm ('dp', 'bt', 'greedy', 'chris')
    solve: (algo, matrix, n) =>
        apiClient.post(`/solve/${algo}`, { matrix, n }),

    // Run the batch performance experiment
    runExperiment: (start, end, step, metric = true) =>
        apiClient.post('/experiment/range', {
            start_n: start,
            end_n: end,
            step: step,
            force_metric: metric
        }),

    // Ask the C-Engine to generate a valid metric matrix
    generateMatrix: (n, metric = true) =>
        apiClient.get(`/generate/${n}`, { params: { metric } }),
};