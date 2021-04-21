const router = require('express').Router();
const User = require('../models/User');
const Cuenta = require('../models/Cuenta');
const Movimiento = require('../models/movimientos')
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

const schemaCuenta= Joi.object({
    name: Joi.string().min(1).max(255).required(),
    cname: Joi.string().min(1).max(255).required(),
    opname: Joi.string().min(1).max(255).required(),
    members: Joi.array()
})

router.get('/', (req, res) => {
    res.json({
        error: null,
        data: {
            title: 'mi ruta protegida',
            user: req.user
        }
    })
})

router.post('/register', async (req, res) => {

    // validate user
    const { error } = schemaRegister.validate(req.body)
    
    if (error) {
        return res.status(400).json(
             {error: error.details[0].message}
        )
    }

    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(400).json(
            {error: 'Email ya registrado'}
        )
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);


    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: password
    });
    try {
        const savedUser = await user.save();
        res.json({
            error: null,
            data: savedUser
        })
    } catch (error) {
        res.status(400).json({error})
    }
})

router.post('/crearcuentas', async (req, res) => {

        // validate cuenta
        const { error } = schemaCuenta.validate(req.body)
    
        if (error) {
            return res.status(400).json(
                 {error: error.details[0].message}
            )
        }

        const cuentaexist = await Cuenta.findOne({ name: req.body.name });
        if (cuentaexist) {
            return res.status(400).json(
                {error: 'Cuenta ya registrada'}
            )
        }

    const cuenta = new Cuenta({
        name: req.body.name,
        cname: req.body.cname,
        opname: req.body.opname,
        members: req.body.members
    })


    try {
        const savedAccount = await cuenta.save();
        res.json({
            error: null,
            data: savedAccount
        })
    } catch (error) {
        res.status(400).json({error})
    }

})

router.get('/users', async (req, res) => {

    const users = await User.find({role:'user'});

    res.json({
        error: null,
        data: {
            users: users,
            user: req.user
        }
    })
})

router.get('/accounts', async (req, res) => {

    const cuentas = await Cuenta.find();

    res.json({
        error: null,
        data: {
            cuentas: cuentas,
            user: req.user
        }
    })
})


router.post('/deleteusr/:id', async (req, res) => {
    //router.delete('/users/:id', async (req, res) => {
    var id = req.params.id

    try {
        const user = await User.findOneAndRemove(
            { _id: id }, 
            { new: true }
        )

        if (!user) {
            
            return  res.status(400).json({ error: 'Usuario no encontrado' })
            
            }

        await Cuenta.updateMany(
            {}, 
            {$pull: {members:{_id: id}} });

          res.json({
            error: null,
            data: {
                "Mensaje":"usuario eliminado con exito",
                user
            }
        })
    } catch(err) {
        throw err
    }

})

router.post('/deleteaccount/:id', async (req, res) => {
    //router.delete('/accounts/:id', async (req, res) => {
    var id = req.params.id
    try {
        const cuenta = await Cuenta.findOneAndRemove(
            { _id: id }, 
            { new: true }
        )

        if (!cuenta) {
            
            return  res.status(400).json({ error: 'cuenta no encontrada' })
            
            }

        res.json({
            error: null,
            data: {
                "Mensaje":"Cuenta eliminada con exito",
                cuenta
            }
        })

    } catch(err) {
        throw err
    }

})

router.get('/accounts/:id', async (req, res) => {


    var id = req.params.id
    try {
        const cuenta = await Cuenta.findById({ _id: id })

        if (!cuenta) {
            
            return  res.status(400).json({ error: 'cuenta no encontrada' })
            
            }

        res.json({
            error: null,
            data: {
                cuenta
            }
        })

    } catch(err) {
        throw err
    }
}) 

router.post('/accounts/:id', async (req, res) => {

    var id = req.params.id

    const  updates  =  Object.keys(req.body)

    const  allowedUpdates  = ['name', 'cname', 'opname']

    const  isValidOperation  =  updates.every((update) =>  allowedUpdates.includes(update))

    try {

        if (!isValidOperation) {

            return  res.status(400).send('Invalid updates!')
            
            }

        const cuenta = await Cuenta.findByIdAndUpdate(id, req.body, { new:  true, runValidators:  true })

        if (!cuenta) {
            
            return  res.status(400).json({ error: 'cuenta no encontrada' })
            
            }

        res.json({
            error: null,
            data: {
                "Mensaje":"Cuenta actualizada",
                cuenta
            }
        })

    } catch(err) {
        throw err
    }
}) 

router.post('/cuenta/deletemembers/:accountid/:userid', async (req, res) => {

    var userid = req.params.userid

    var accountid = req.params.accountid


      const member = await Cuenta.findOne({ _id: accountid,"members._id":userid })
        if (!member) {
            
            return  res.status(400).json({ error: 'miembro no encontrado' })
            
        }
    
        const cuenta = await Cuenta.findOne({_id: accountid})
        const user = await User.findOne({_id: userid})
        const movimiento = new Movimiento({
            userId: userid,
            cuentaId: accountid,
            motivo: "baja",
            nombreusr: user.name,
            cname: cuenta.name
    
        });

            await Cuenta.updateMany(
                { _id: accountid }, 
                {$pull: {members:{_id: userid}} });
                
                await movimiento.save();
              res.json({
                error: null,
                data: {
                    "Mensaje":"usuario eliminado con exito",
                }
            })
}) 

router.post('/cuenta/addmembers/:accountid/:userid', async (req, res) => {

    var userid = req.params.userid

    var accountid = req.params.accountid

    const cuenta = await Cuenta.findOne({ _id: accountid})
    if (!cuenta) {
        
        return  res.status(400).json({ error: 'cuenta no encontrada' })
    }
    const member = await Cuenta.findOne({ _id: accountid,"members._id":userid })
    if (member) {    
        return  res.status(400).json({ error: 'usuario ya se encuentra en este equipo' })
    }

    const user = await User.findOne({_id: userid})
    const movimiento = new Movimiento({
        userId: userid,
        cuentaId: accountid,
        finicio: req.body.finicio,
        ffin: req.body.ffin,
        motivo: "Alta",
        nombreusr: user.name,
        cname: cuenta.name

    });
    await Cuenta.updateOne(
        { _id: accountid }, 
        {$push: {members:{_id: userid, finicio: req.body.finicio, ffin: req.body.ffin, name:user.name}} });

        await movimiento.save();

      res.json({
        error: null,
        data: {
            "Mensaje":"usuario agregado con exito",
        },
    })

}) 

router.get('/movimientos', async (req, res) => {

    const movimientos = await Movimiento.find();

    res.json({
        error: null,
        data: {
            Movimiento: movimientos,
        }
    })
})


module.exports = router