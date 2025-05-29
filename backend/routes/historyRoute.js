import express from 'express';  // Import the Wallet model (adjust the path as needed)
import {
  addHistoryEntry,
  getAllHistory,
  getUserHistory
} from '../controllers/historyController.js';

const router = express.Router();

router.post('/add', addHistoryEntry);
router.get('/', getAllHistory);
// New route to fetch credited amount for a specific user
router.get('/user/:userMobile', getUserHistory);


export { router as historyRoutes };
