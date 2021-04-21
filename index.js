const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const admin = require('./routes/admin');
const users = require('./routes/users')
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cors = require('cors');
const morgan = require('morgan')
const verifyTokenAdmin = require('./routes/validateadmin-token');
const verifyToken = require('./routes/validate-token');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

require('dotenv').config()

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Arkus api jwt",
			version: "1.0.0",
			description: "Arkus challenge",
		},
		servers: [
			{
				url: "http://localhost:3001",
			},
		],
	},
    components: {
		securitySchemes: {
		  bearerAuth: {
			type: 'http',
			scheme: 'bearer',
			bearerFormat: 'JWT',
		  }
		}
	  },
	  security: [{
		bearerAuth: []
	  }],
	apis: ["./routes/*.js"],
};


const specs = swaggerJsDoc(options);

const app = express();
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors());
app.use(morgan("dev"))

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