import express from 'express';
import { getUserLogs, getFileActivityLogs, getLogDetails, getLogStatistics } from '../controller/log';

const router = express.Router();

// Get user's logs with filtering and pagination
router.get('/', getUserLogs);

// get statistics for logs
router.get('/statistics', getLogStatistics);

// Get details of a specific log entry
router.get('/:logId', getLogDetails);

// Get all logs for a specific file
router.get('/file/:fileId', getFileActivityLogs);

export default router;
