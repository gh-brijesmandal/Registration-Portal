const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs").promises; // Use promises version
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8000;
// Don't require the JSON at startup; read/write it when needed so we always
// work with the latest data on disk.

// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Serve static files: expose the entire `public` folder (so CSS, images, etc. are available)
app.use(express.static(path.join(__dirname, 'public')));

// Serve JS files from `controllers` under the `/js` route (e.g. /js/registration-form.js)
app.use('/js', express.static(path.join(__dirname, 'controllers')));

app.use((req,res,next) => {
    console.log(`${req.method} , ${req.url}`);
    next();
})

app.set('views', path.join(__dirname, 'views'));


// Read/write helpers for form_data.json
async function getFormData() {
    try {
        const raw = await fs.readFile(path.join(__dirname, 'form_data.json'), 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}

async function saveFormData(data) {
    await fs.writeFile(path.join(__dirname, 'form_data.json'), JSON.stringify(data, null, 2), 'utf8');
}

// GET Routes - Serve HTML files
app.get(['/', '/index'], (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/registration-form", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "registration-form.html"));
});

app.get("/summary", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "summary.html"));
});

app.get("/thank-you", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "thank-you.html"));
});

app.get("/admin", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "admin.html"));
});

// POST Route - Fixed version
app.post('/registration-form', async (req, res) => {
    try {
        const body = req.body;

        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ status: 'error', message: 'Empty request body' });
        }

        const existing = await getFormData();
        existing.push({ ...body, timestamp: new Date().toISOString() });
        await saveFormData(existing);

        // Send email (best-effort)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: "nsa.msu1878@gmail.com",
                pass: "nspb ujfu pmah zjsu"
            }
        });

        transporter.sendMail({
            to: body.email,
            subject: 'Registration Successful',
            text: `Dear intelactual ${body.fullName}, your registration has been successful. Thank you.`
        }).then(() => {
            console.log("Email Sent");
        }).catch(err => {
            console.error(err);
    });

        return res.status(200).json({ status: 'successful', message: 'Form submitted and confirmation email sent!' });
    } catch (error) {
        console.error('Error processing form:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error. Please try again.' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: "error",
        message: "Something went wrong!"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on PORT: http://localhost:${PORT}`);
});