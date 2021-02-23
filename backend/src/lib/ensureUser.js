const { v4: uuid } = require('uuid')
const ensureSingularity = require('./ensureSingularity')
const ObjectId = require('mongoose').Types.ObjectId

async function ensureUser(req, res, next) {
  if (req.body.computerId) req.session.computerId = req.body.computerId
  else {
    req.session.computerId = req.session.computerId || `nobiri-${uuid()}`
  }

  if (!req.session.userId) {
    if (req.user) req.session.userId = req.user._id
    else {
      req.session.userId = ObjectId()

      await req.session.save()
    }
  }

  await ensureSingularity({
    userId: req.session.userId,
    sessionId: req.session.id,
    computerId: req.session.computerId,
  })

  next()
}

module.exports = ensureUser;
