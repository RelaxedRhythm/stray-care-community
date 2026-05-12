import express from 'express';
import Case from '../models/Case.js';
import User from '../models/User.js';
import { authMiddleware, loadUser, requireVolunteer, requireAdmin } from '../middleware/auth.js';
import { upload, publicUploadPath } from '../middleware/upload.js';

const router = express.Router();

router.get('/public', async (req, res, next) => {
  try {
    const { status, lat, lng, radiusKm } = req.query;
    const q = { status: { $in: ['open', 'funded', 'completed'] } };
    if (status) q.status = status;
    let cases = await Case.find(q).sort({ createdAt: -1 }).populate('volunteerId', 'name').limit(200);
    if (lat && lng && radiusKm) {
      const R = 6371;
      const la = Number(lat);
      const ln = Number(lng);
      const r = Number(radiusKm);
      cases = cases.filter((c) => {
        if (c.location?.lat == null || c.location?.lng == null) return false;
        const dLat = ((c.location.lat - la) * Math.PI) / 180;
        const dLng = ((c.location.lng - ln) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((la * Math.PI) / 180) * Math.cos((c.location.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        const d = 2 * R * Math.asin(Math.sqrt(a));
        return d <= r;
      });
    }
    res.json(cases);
  } catch (e) {
    next(e);
  }
});

router.get('/public/:id', async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id).populate('volunteerId', 'name email');
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (e) {
    next(e);
  }
});

router.post('/', authMiddleware, loadUser, requireVolunteer, upload.array('images', 6), async (req, res, next) => {
  try {
    const { title, description, address, lat, lng, requiredFunds } = req.body;
    const reqFunds = Number(requiredFunds);
    if (!title || !description || !reqFunds) return res.status(400).json({ message: 'Missing fields' });
    const images = (req.files || []).map((f) => publicUploadPath(f.filename));
    const c = await Case.create({
      volunteerId: req.user._id,
      title,
      description,
      location: {
        address: address || '',
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
      },
      images,
      requiredFunds: reqFunds,
      status: 'pending_approval',
    });
    res.status(201).json(c);
  } catch (e) {
    next(e);
  }
});

router.get('/mine', authMiddleware, loadUser, requireVolunteer, async (req, res, next) => {
  try {
    const list = await Case.find({ volunteerId: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/updates', authMiddleware, loadUser, requireVolunteer, upload.array('media', 6), async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    if (String(c.volunteerId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your case' });
    }
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: 'Update text required' });
    const media = (req.files || []).map((f) => ({
      url: publicUploadPath(f.filename),
      kind: f.mimetype.startsWith('video') ? 'video' : 'image',
    }));
    c.updates.push({ body, media, createdBy: req.user._id });
    await c.save();
    res.json(c);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/status', authMiddleware, loadUser, requireVolunteer, async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    if (String(c.volunteerId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.body.status === 'completed' && ['funded', 'open'].includes(c.status)) c.status = 'completed';
    await c.save();
    res.json(c);
  } catch (e) {
    next(e);
  }
});

router.get('/pending', authMiddleware, loadUser, requireAdmin, async (req, res, next) => {
  try {
    const list = await Case.find({ status: 'pending_approval' }).populate('volunteerId', 'name email');
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/review', authMiddleware, loadUser, requireAdmin, async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    const { action, adminNote } = req.body;
    if (action === 'approve') {
      c.status = 'open';
      c.adminNote = adminNote || '';
    } else if (action === 'reject') {
      c.status = 'rejected';
      c.adminNote = adminNote || '';
    }
    await c.save();
    res.json(c);
  } catch (e) {
    next(e);
  }
});

export default router;
