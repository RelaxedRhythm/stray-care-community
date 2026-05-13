import express from 'express';
import Case from '../models/Case.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const cases = await Case.find(
      { status: 'open', 'location.lat': { $exists: true }, 'location.lng': { $exists: true } },
      { 'location.lat': 1, 'location.lng': 1, title: 1, 'location.address': 1 }
    ).lean();

    const markers = cases
      .filter((c) => c.location?.lat != null && c.location?.lng != null)
      .map((c) => ({
        position: [c.location.lat, c.location.lng],
        popup: c.title || c.location.address || 'Open case',
        caseId: c._id,
      }));

    res.json(markers);
  } catch (err) {
    next(err);
  }
});

export default router;
