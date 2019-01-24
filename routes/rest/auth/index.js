const jwt = require("jsonwebtoken")

const User = require("../../../models/user")

module.exports = {
  async post(req, res) {
    try {
      // const { type } = req.params
      const { handle, password } = req.body
      if (handle === undefined || password === undefined) {
        return res.status(400).json({ error: true, reason: "Fields `handle` and `password` are mandatory" })
      }
      const user = await User.findOne({
        $or: [{ email: handle.toLowerCase() }, { phone: handle }]
      }).exec()
      if (user === null) throw new Error("User Not Found")
      if (user.isActive === false) throw new Error("User Inactive")
      // check pass
      await user.comparePassword(password)
      // No error, send jwt
      const payload = {
        id: user._id,
        _id: user._id,
        fullName: user.name.full,
        email: user.email,
        phone: user.phone,
      }
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: 3600 * 24 * 30 // 1 month
      })
      return res.json({ error: false, handle, token })
    } catch (err) {
      return res.status(500).json({ error: true, reason: err.message })
    }
  }
}
