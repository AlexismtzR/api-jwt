const jwt = require('jsonwebtoken')

// middleware to validate token (rutas protegidas)
const verifyTokenAdmin = (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) return res.status(401).json({ error: 'Acceso denegado' })
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        //console.log("ASDSADAS"+verified.role)
        if(verified.role != 'admin'){
            return res.json({message: 'Permission denied.' });
        }
        req.user = verified
        next() // continuamos
    } catch (error) {
        res.status(400).json({error: 'token no es válido'})
    }
}

module.exports = verifyTokenAdmin;