require('dotenv').config();
const path = require('path')
const express = require(`express`);
const cors = require('cors');
const connectDB = require('./db/connection')
const passport = require('passport');
const fs = require('fs');
const { isAuthenticatedUser } = require('./middleware/authMiddleware.js');
const {app, server} = require('./socket')



const cookieParser = require('cookie-parser')

const corsOptions = {
  origin: process.env.CLIENT_URL, //set client url 
  credentials: true,            //access-control-allow-credentials:true
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions));


// Database connection
connectDB(process.env.MONGO_URL)
// Initialize Passport
app.use(passport.initialize());


//routers
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes.js")
const notificationRoutes = require('./routes/notificationRoute');

//middleware
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler');
const morgan = require('morgan');



app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser())

app.use("/uploads/",  express.static(path.join(__dirname, "uploads")));


app.get('/', (req, res) => {
  res.send('testing route')
})


app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/chat', chatRoutes)
app.use('/api/v1/messages', messageRoutes)
app.use('/api/v1/notifications', notificationRoutes);




app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

//exit process
process.on('uncaughtException', (err) => {
  console.log(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

const port = process.env.PORT || 4001;
server.listen(port, () => console.log(`Server listening on port ${port}`));
