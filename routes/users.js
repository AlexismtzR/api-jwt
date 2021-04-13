const router = require('express').Router();
const User = require('../models/User');


router.get('/:id', (req, res) => {

    var id = req.params.id
    User.findById(id).then(user => res.json({
        error: null,
        data: {
            user: user
        }
    })).catch(e => res.status(400).json({ error: 'Usuario no encontrado' }))
}) 

router.post('/:id', async (req, res) => {

    var id = req.params.id

    const  updates  =  Object.keys(req.body)

    const  allowedUpdates  = ['name', 'english', 'skills','cvlink']

    const  isValidOperation  =  updates.every((update) =>  allowedUpdates.includes(update))

        
    if (!isValidOperation) {

        return  res.status(400).send('Invalid updates!')
        
        }

        try {

            const  user  =  await  User.findByIdAndUpdate(id, req.body, { new:  true, runValidators:  true })
            
            if (!user) {
            
            return  res.status(400).json({ error: 'Usuario no encontrado' })
            
            }
            
            res.status(201).send(user)
            
            } catch (error) {
            
            res.status(400).send(error)
            
            }
})


module.exports = router