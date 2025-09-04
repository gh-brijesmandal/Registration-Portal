const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const rateLimit = require('express-rate-limit');
// nodemailer removed - verification email functionality disabled
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from NSA root directory
app.use(express.static(path.join(__dirname, '/public')));

// serve js files
app.use("/js",express.static(path.join(__dirname,"/js")));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// payload limit 
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: false, limit: '20mb' }));

const DATA_FILE = path.join(__dirname, 'registrations.json');
const UPLOADS_DIR = path.join(__dirname, '/uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// default middlewares used here hai
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Security middlewares
app.use(helmet());
app.use(cookieParser());

// Basic rate limiter for write endpoints
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// CSRF protection using cookies. We'll expose a GET /csrf-token that returns the token.
const csrfProtection = csurf({ cookie: true });

// portal name here 

const allowedOrigins = ['https//PORTAL_NAME.com','http://localhost:3000']; // Add more if needed

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, CSRF-Token');
  next();
});

// Helper function to save base64 file
function saveBase64File(base64Data, fileName, fileType) {
  try {
    // Remove the data URL prefix (e.g., "data:image/png;base64,")
    const base64String = base64Data.split(',')[1];
    const buffer = Buffer.from(base64String, 'base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);
    
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${uniqueFileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
}



// routes handlers
app.get(/^\/(index\.html?)?$/,(req,res) => {
  res.sendFile(path.join(__dirname,"views","index.html"));
});

app.get("/registration.html", (req,res) => {
  res.sendFile(path.join(__dirname,"views","registration.html"));
});

app.get("/admin.html",(req,res) => {
  res.sendFile(path.join(__dirname,"views","admin.html"));
});

app.get("/admin-dashboard.html",(req,res) => {
  res.sendFile(path.join(__dirname,"views","admin-dashboard.html"));
});

app.get("/thank-you.html", (req,res) => {
  res.sendFile(path.join(__dirname,"views","thank-you.html"));
})

// POST /register - save registration
app.post('/register', writeLimiter, csrfProtection, (req, res) => {
  // send the ty shit

  // res.sendFile(path.join(__dirname,"/views","thank-you.html"));

  // validation logic
  const { name, email, phone, category, personalEmail, memberType, enrolledDate, membershipFee, paymentProof } = req.body;
  if (!name || !email || !phone || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  let registrations = [];
  if (fs.existsSync(DATA_FILE)) {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    if (fileContent.trim()) {
      try {
        registrations = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error parsing registrations.json:', error);
        registrations = [];
      }
    }
  }
  
  // Create registration object
  const registration = { 
    name, 
    email, 
    phone, 
    category,
    memberType: memberType || 'passive', // Default to passive if not specified
    registrationDate: new Date().toISOString()
  };
  
  // Add personal email if provided (for current MSU students/faculty)
  if (personalEmail && personalEmail.trim() !== '') {
    registration.personalEmail = personalEmail;
  }
  
  // Add enrolled date if provided
  if (enrolledDate && enrolledDate.trim() !== '') {
    registration.enrolledDate = enrolledDate;
  }
  
  // Add membership fee if provided (for active members)
  if (membershipFee && membershipFee > 0) {
    registration.membershipFee = membershipFee;
  }
  
  // Handle file upload
  if (paymentProof && paymentProof.name && paymentProof.data) {
    const filePath = saveBase64File(paymentProof.data, paymentProof.name, paymentProof.type);
    if (filePath) {
      registration.paymentProof = {
        name: paymentProof.name,
        type: paymentProof.type,
        size: paymentProof.size,
        filePath: filePath,
        uploadedDate: new Date().toISOString()
      };
    }
  }
  
  registrations.push(registration);
  fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
  
  console.log('New registration:', registration);
  res.json({ success: true });
});

// GET /registrations - get all registrations
app.get('/registrations', (req, res) => {
  let registrations = [];
  if (fs.existsSync(DATA_FILE)) {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    if (fileContent.trim()) {
      try {
        registrations = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error parsing registrations.json:', error);
        registrations = [];
      }
    }
  }
  res.json(registrations);
});

// POST /send-verification-code - send verification code to email
// Verification endpoint removed. Email verification is no longer required.

// POST /update-status - update registration status
app.post('/update-status', writeLimiter, csrfProtection, (req, res) => {
  const { index, status } = req.body;
  
  if (typeof index !== 'number' || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid index or status' });
  }
  
  let registrations = [];
  if (fs.existsSync(DATA_FILE)) {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    if (fileContent.trim()) {
      try {
        registrations = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error parsing registrations.json:', error);
        registrations = [];
      }
    }
  }
  
  if (index >= 0 && index < registrations.length) {
    registrations[index].status = status;
    registrations[index].statusUpdatedDate = new Date().toISOString();
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
    console.log(`Registration ${index} status updated to: ${status}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Registration not found' });
  }
});

app.use((err,req,res,next) => {
  res.status(500).send("Oops, something broke. Report this incident to the NSA team please!");
})


app.use((req,res,next) => {
  res.status(404).send('404, Page not found.');
  next();
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Expose a route to get CSRF token for client-side fetches
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});