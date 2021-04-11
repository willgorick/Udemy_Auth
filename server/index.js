const express = require('express');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');

const app = express();
const verifyToken = require('./routes/verifyToken');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Auth System');
})

app.get('/api/user/profile', verifyToken, (req, res) => {
  res.send({success: true, data: req.user});
})
app.use('/api/users', authRoutes)
console.log("hello")
mongoose.connect('mongodb+srv://will_auth:zXkZvc11qZAtDLdt@cluster0.jrinw.mongodb.net/auth_system?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    app.listen(3000, () => console.log("Server is running on port 3000"));
  })
  .catch(err => console.log(err))
