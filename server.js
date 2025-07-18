// This MUST be the very first line to ensure all environment variables are loaded
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const emailService = require('./emailService');
const multer = require('multer');
const AWS = require('aws-sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- AWS S3 Configuration ---
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Multer setup for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// =================================================================
// --- DATABASE CONNECTION ---
// =================================================================
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connection successful!'))
    .catch(err => console.error('MongoDB connection error:', err));

// =================================================================
// --- DATABASE SCHEMAS & MODELS ---
// =================================================================
const EmployeeSchema = new mongoose.Schema({ username: { type: String, required: true, unique: true }, password: { type: String, required: true }, fullName: { type: String, required: true }, email: { type: String, required: true, unique: true }, phone: { type: String }, department: { type: String }, registeredAt: { type: Date, default: Date.now }});
const Employee = mongoose.model('Employee', EmployeeSchema);
const QuestionSchema = new mongoose.Schema({ title: { type: String, required: true }, standard: { type: String }, indicatorNumber: { type: String }, practiceNumber: { type: String }, questionNumber: { type: String }, releaseTime: { type: Date, required: true }, expiryTime: { type: Date }, targetEmployees: [String], createdBy: String, createdAt: { type: Date, default: Date.now }});
const Question = mongoose.model('Question', QuestionSchema);
const ResponseSchema = new mongoose.Schema({ questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }, employeeUsername: { type: String, required: true }, employeeFullName: { type: String }, answer: { type: String, required: true }, attachmentUrl: String, submittedAt: { type: Date, default: Date.now }});
const Response = mongoose.model('Response', ResponseSchema);

// =================================================================
// --- API ROUTES ---
// =================================================================

// FINAL ROBUST FILE UPLOAD ENDPOINT using AWS S3
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
        console.error("CRITICAL: S3_BUCKET_NAME is not set.");
        return res.status(500).json({ message: "File storage is not configured." });
    }

    // Sanitize the filename to be URL-safe
    const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const key = `${Date.now()}_${sanitizedFilename}`;

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
        // We do not set ACL here; the bucket policy handles permissions.
    };

    try {
        const data = await s3.upload(params).promise();
        console.log(`File uploaded successfully to S3: ${data.Location}`);
        res.json({ success: true, link: data.Location }); // data.Location is the public URL
    } catch (error) {
        console.error('Error during S3 upload:', error);
        res.status(500).json({ message: `Upload failed: ${error.message}` });
    }
});


// --- Employees API ---
app.get('/api/employees', async (req, res) => { try { const employees = await Employee.find().select('-password'); res.json(employees); } catch (err) { res.status(500).json({ message: err.message }); }});
app.post('/api/employees/register', async (req, res) => { try { const existingEmployee = await Employee.findOne({ username: req.body.username }); if (existingEmployee) { return res.status(409).json({ message: "Username already exists." }); } const newEmployee = new Employee(req.body); await newEmployee.save(); emailService.sendWelcomeEmail(newEmployee.email, newEmployee.fullName); res.status(201).json(newEmployee); } catch (err) { res.status(400).json({ message: err.message }); }});
app.post('/api/employees/login', async (req, res) => { try { const { username, password, role } = req.body; if (role === 'admin') { const adminUser = process.env.ADMIN_USERNAME; const adminPass = process.env.ADMIN_PASSWORD; if (!adminUser || !adminPass) { console.error("CRITICAL: Admin credentials are not set in environment variables."); return res.status(500).json({ message: "Server configuration error." }); } if (username === adminUser && password === adminPass) { console.log(`Admin user "${username}" logged in successfully.`); res.json({ username: username, role: 'admin' }); } else { console.warn(`Failed admin login attempt for user "${username}".`); return res.status(401).json({ message: "Invalid admin username or password." }); } } else if (role === 'employee') { const employee = await Employee.findOne({ username: username }); if (!employee || employee.password !== password) { return res.status(401).json({ message: "Invalid employee username or password." }); } const employeeData = employee.toObject(); delete employeeData.password; res.json({ ...employeeData, role: 'employee' }); } else { res.status(400).json({ message: "Invalid role specified." }); } } catch (err) { console.error("Login endpoint error:", err); res.status(500).json({ message: err.message }); }});
app.put('/api/employees/:id', async (req, res) => { try { const { id } = req.params; const updates = req.body; const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, { new: true }); if (!updatedEmployee) { return res.status(404).json({ message: 'Employee not found' }); } console.log(`Updated employee: ${updatedEmployee.username}`); res.json(updatedEmployee); } catch (err) { console.error('Error updating employee:', err); res.status(500).json({ message: err.message }); }});
app.delete('/api/employees/:id', async (req, res) => { try { const { id } = req.params; const employeeToDelete = await Employee.findById(id); if (!employeeToDelete) { return res.status(404).json({ message: 'Employee not found' }); } await Response.deleteMany({ employeeUsername: employeeToDelete.username }); await Employee.findByIdAndDelete(id); console.log(`Deleted employee ${employeeToDelete.username} and their responses.`); res.status(204).send(); } catch (err) { console.error('Error deleting employee:', err); res.status(500).json({ message: err.message }); }});

// --- Questions API ---
app.get('/api/questions', async (req, res) => { try { const questions = await Question.find(); res.json(questions); } catch (err) { res.status(500).json({ message: err.message }); }});
app.post('/api/questions', async (req, res) => { try { const newQuestion = new Question(req.body); await newQuestion.save(); if (newQuestion.targetEmployees.includes('all')) { const allEmployees = await Employee.find({}, 'email'); allEmployees.forEach(emp => { emailService.sendNewQuestionEmail(emp.email, newQuestion.title, newQuestion.expiryTime); }); } else { const targetEmployees = await Employee.find({ username: { $in: newQuestion.targetEmployees } }, 'email'); targetEmployees.forEach(emp => { emailService.sendNewQuestionEmail(emp.email, newQuestion.title, newQuestion.expiryTime); }); } res.status(201).json(newQuestion); } catch (err) { res.status(400).json({ message: err.message }); }});
app.delete('/api/questions/:id', async (req, res) => { try { const { id } = req.params; await Response.deleteMany({ questionId: id }); await Question.findByIdAndDelete(id); res.status(204).send(); } catch (err) { res.status(500).json({ message: err.message }); }});

// NEW: Bulk delete questions endpoint
app.delete('/api/questions/bulk', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty list of IDs provided.' });
        }
        
        const questionDeleteResult = await Question.deleteMany({ _id: { $in: ids } });
        const responseDeleteResult = await Response.deleteMany({ questionId: { $in: ids } });

        console.log(`Bulk delete: ${questionDeleteResult.deletedCount} questions and ${responseDeleteResult.deletedCount} responses deleted.`);
        
        res.status(200).json({ 
            message: 'Bulk deletion successful.',
            questionsDeleted: questionDeleteResult.deletedCount,
            responsesDeleted: responseDeleteResult.deletedCount 
        });

    } catch (err) {
        console.error('Error during bulk question deletion:', err);
        res.status(500).json({ message: err.message });
    }
});


// --- Responses API ---
app.get('/api/responses', async (req, res) => { try { const responses = await Response.find(); res.json(responses); } catch (err) { res.status(500).json({ message: err.message }); }});
app.post('/api/responses', async (req, res) => { try { const newResponse = new Response(req.body); await newResponse.save(); res.status(201).json(newResponse); } catch (err) { res.status(400).json({ message: err.message }); }});

// =================================================================
// --- SCHEDULED TASKS (CRON JOBS) ---
// =================================================================
console.log('Cron job for email reminders scheduled to run every hour.');
cron.schedule('0 * * * *', async () => {
    const now = new Date();
    console.log(`[${now.toLocaleString()}] Running hourly check for email reminders...`);
    try {
        const reminderTimeStart = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        const reminderTimeEnd = new Date(now.getTime() + (25 * 60 * 60 * 1000));
        const questionsForReminder = await Question.find({
            expiryTime: { $gte: reminderTimeStart, $lt: reminderTimeEnd }
        });

        if (questionsForReminder.length > 0) {
            for (const q of questionsForReminder) {
                const responses = await Response.find({ questionId: q._id }).select('employeeUsername -_id');
                const respondedUsernames = responses.map(r => r.employeeUsername);
                const query = { username: { $nin: respondedUsernames } };
                if (!q.targetEmployees.includes('all')) {
                    query.username.$in = q.targetEmployees;
                }
                const employeesToRemind = await Employee.find(query, 'email username');
                employeesToRemind.forEach(emp => {
                    emailService.sendReminderEmail(emp.email, q.title);
                });
            }
        }
    } catch (error) {
        console.error("Error during scheduled cron job:", error);
    }
});

// =================================================================
// --- Server Start ---
// =================================================================
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});