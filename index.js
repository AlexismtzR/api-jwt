const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const admin = require('./routes/admin');
const users = require('./routes/users')
const verifyTokenAdmin = require('./routes/validateadmin-token');
const verifyToken = require('./routes/validate-token');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

require('dotenv').config()

const app = express();

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Conexión a Base de datos
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.1ipip.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose.connect(uri,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log('Base de datos conectada'))
.catch(e => console.log('error db:', e))

// import routes
const authRoutes = require('./routes/auth');

// route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/admin', verifyTokenAdmin, admin);
app.use('/api/users', verifyToken, users);

// iniciar server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`)
})