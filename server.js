const express = require("express")
const cors = require('cors')
const dotenv = require("dotenv")
const mongoose = require('mongoose')
const connecttoDB = require("./config/db.js")
const Project = require("./models/Project.js")
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')

dotenv.config()
const PORT = process.env.PORT || 8000;

const app = express()

// middlewares
app.use(cors({
  // Replace this with your Vercel frontend URL once deployed
  origin: "*",
  credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}));

// Remove static file serving since frontend is separate
// app.use(express.static(path.join(__dirname, "frontend/build")))

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// routes
app.get('/api/projects', async (req, res) => {
  try{
    const projects = await Project.find()
    res.json(projects)
  } catch(err) {
    res.status(500).json({ error: "Server error"})
  }
})

app.post('/api/sendmail', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  console.log(name,email,phone,subject,message)

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  })

  const mailOptions = {
    from: email,
    to: process.env.EMAIL,
    subject: `New Contact Form Submission(PORTFOLIO): ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
      console.error("Error sending mail: ",error)
      return res.status(500).json({ success: false, message: "Failed to send mail. "})
    } else {
      console.log("Email sent: ", info.response)
      return res.status(200).json({ success: true, message: "Email sent successfully!"})
    }
  })
})

// Remove the catch-all route since we're not serving frontend
// app.get('*', (req,res) => {
//   res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'))
// })

connecttoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Failed to connect to the server:", err)
    process.exit(1);
  })