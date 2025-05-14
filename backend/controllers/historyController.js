import History from '../models/historyModel.js';

// @desc   Create a new history log entry
// @route  POST /api/history
export const addHistoryEntry = async (req, res) => {
  try {
    const { employeeName, employeeEmail, creditedAmount, userEmail, userMobile } = req.body;

    // Duplicate check: Find if a very recent same log already exists (within 5 seconds)
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const existingLog = await History.findOne({
      employeeEmail,
      userEmail,
      userMobile,
      creditedAmount,
      createdAt: { $gte: fiveSecondsAgo } // Optional strictness
    });

    if (existingLog) {
      return res.status(409).json({ message: 'Duplicate credit detected. Entry skipped.' });
    }

    const newEntry = new History({
      employeeName,
      employeeEmail,
      creditedAmount,
      userEmail,
      userMobile,
      creditedAt: new Date(), // You can also remove this if the model uses timestamps
    });

    await newEntry.save();
    res.status(201).json({ message: 'History log added successfully' });
  } catch (err) {
    console.error('Error adding history:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Fetch all history logs
// @route  GET /api/history
export const getAllHistory = async (req, res) => {
  try {
    const logs = await History.find().sort({ creditedAt: -1 }); // Sort by creditedAt
    res.status(200).json(logs);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Fetch all history logs for a specific user (by userEmail or userMobile)
// @route  GET /api/history/:userEmail
export const getUserHistory = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const logs = await History.find({ userEmail }).sort({ creditedAt: -1 });
    console.log("History logs for user:", userEmail, logs);

    const creditedAmount = logs.reduce((total, log) => {
      const amount = typeof log.creditedAmount === 'number' ? log.creditedAmount : 0;
      return total + amount;
    }, 0);

    res.status(200).json({ creditedAmount });
  } catch (err) {
    console.error('Error fetching history for user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

