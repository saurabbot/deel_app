
const isAdmin = async (req, res, next) => {
    const { Profile } = req.app.get('models')
    const profile = await Profile.findOne({ where: { id: req.get('profile_id') || 0 } })
    if (!profile.isAdmin) return res.status(401).json({
        success: false,
        message: 'Only admin can acess this route'
    })
    req.profile = profile
    next()
}
module.exports = { isAdmin }