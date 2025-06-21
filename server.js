// This MUST be the very first line to ensure all environment variables are loaded
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron'); // The task scheduler
const emailService = require('./emailService'); // Our custom email service

const app = express();
const PORT = process.env.PORT || 3000;

// Use the MONGO_URI from the environment variables
const MONGO_URI = process.env.MONGO_URI;

// --- Middleware ---
const corsOptions = {
  origin: 'https://questionnaire-app-xd7f.onrender.com', // Your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(__dirname));

// =================================================================
// --- DATABASE CONNECTION ---
// =================================================================
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connection successful!'))
    .catch(err => console.error('MongoDB connection error:', err));

// =================================================================
// --- DATABASE SCHEMAS & MODELS ---
// =================================================================

const EmployeeSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    department: { type: String },
    registeredAt: { type: Date, default: Date.now }
});
const Employee = mongoose.model('Employee', EmployeeSchema);

const QuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    releaseTime: { type: Date, required: true },
    expiryTime: { type: Date },
    targetEmployees: [String],
    createdBy: String,
    createdAt: { type: Date, default: Date.now }
});
const Question = mongoose.model('Question', QuestionSchema);

const ResponseSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    employeeUsername: { type: String, required: true },
    employeeFullName: { type: String },
    answer: { type: String, required: true },
    attachmentUrl: String,
    submittedAt: { type: Date, default: Date.now }
});
const Response = mongoose.model('Response', ResponseSchema);

// =================================================================
// --- API ROUTES (Now with Email Integration) ---
// =================================================================

// --- Employees API ---
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await Employee.find().select('-password');
        res.json(employees);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/employees/register', async (req, res) => {
    try {
        const existingEmployee = await Employee.findOne({ username: req.body.username });
        if (existingEmployee) {
            return res.status(409).json({ message: "Username already exists." });
        }
        const newEmployee = new Employee(req.body);
        await newEmployee.save();

        // --- Send Welcome Email ---
        emailService.sendWelcomeEmail(newEmployee.email, newEmployee.fullName);

        res.status(201).json(newEmployee);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

app.post('/api/employees/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (role === 'employee') {
            const employee = await Employee.findOne({ username: username });
            if (!employee || employee.password !== password) {
                return res.status(404).json({ message: "Invalid username or password." });
            }
            const employeeData = employee.toObject();
            delete employeeData.password;
            res.json({ ...employeeData, role: 'employee' });
        } else if (role === 'admin') {
            res.json({ username: username, role: 'admin' });
        } else {
            res.status(400).json({ message: "Invalid role." });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- Questions API ---
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/questions', async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();

        // --- Send New Question Notifications ---
        if (newQuestion.targetEmployees.includes('all')) {
            const allEmployees = await Employee.find({}, 'email');
            console.log(`Sending new question notification to all ${allEmployees.length} employees.`);
            allEmployees.forEach(emp => {
                emailService.sendNewQuestionEmail(emp.email, newQuestion.title, newQuestion.expiryTime);
            });
        } else {
            const targetEmployees = await Employee.find({ username: { $in: newQuestion.targetEmployees } }, 'email');
            console.log(`Sending new question notification to ${targetEmployees.length} targeted employees.`);
            targetEmployees.forEach(emp => {
                emailService.sendNewQuestionEmail(emp.email, newQuestion.title, newQuestion.expiryTime);
            });
        }

        res.status(201).json(newQuestion);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Response.deleteMany({ questionId: id });
        await Question.findByIdAndDelete(id);
        res.status(204).send();
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- Responses API ---
app.get('/api/responses', async (req, res) => {
    try {
        const responses = await Response.find();
        res.json(responses);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/responses', async (req, res) => {
    try {
        const newResponse = new Response(req.body);
        await newResponse.save();
        res.status(201).json(newResponse);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// =================================================================
// --- SCHEDULED TASKS (CRON JOBS) ---
// =================================================================
// This will run every hour, at the start of the hour (e.g., 1:00, 2:00, 3:00).
console.log('Cron job for email reminders scheduled to run every hour.');
cron.schedule('0 * * * *', async () => {
    const now = new Date();
    console.log(`[${now.toLocaleString()}] Running hourly check for email reminders...`);

    try {
        // --- 24-Hour Reminder Logic ---
        // Find questions expiring between 24 and 25 hours from now.
        const reminderTimeStart = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        const reminderTimeEnd = new Date(now.getTime() + (25 * 60 * 60 * 1000));

        const questionsForReminder = await Question.find({
            expiryTime: { $gte: reminderTimeStart, $lt: reminderTimeEnd }
        });

        // --- Deadline Passed Logic ---
        // Find questions whose deadline was between 24 and 25 hours ago.
        const deadlinePassedStart = new Date(now.getTime() - (25 * 60 * 60 * 1000));
        const deadlinePassedEnd = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        const questionsDeadlinePassed = await Question.find({
            expiryTime: { $gte: deadlinePassedStart, $lt: deadlinePassedEnd }
        });

        // --- Process Reminders ---
        if (questionsForReminder.length > 0) {
            console.log(`Found ${questionsForReminder.length} question(s) for 24-hour reminder.`);
            for (const q of questionsForReminder) {
                const responses = await Response.find({ questionId: q._id }).select('employeeUsername -_id');
                const respondedUsernames = responses.map(r => r.employeeUsername);

                const query = { username: { $nin: respondedUsernames } };
                if (!q.targetEmployees.includes('all')) {
                    query.username.$in = q.targetEmployees;
                }

                const employeesToRemind = await Employee.find(query, 'email username');
                
                console.log(`Sending ${employeesToRemind.length} reminders for question: "${q.title}"`);
                employeesToRemind.forEach(emp => {
                    emailService.sendReminderEmail(emp.email, q.title);
                });
            }
        }

        // --- Process Deadline Passed Notifications ---
        if (questionsDeadlinePassed.length > 0) {
            console.log(`Found ${questionsDeadlinePassed.length} question(s) for deadline-passed notification.`);
            for (const q of questionsDeadlinePassed) {
                const responses = await Response.find({ questionId: q._id }).select('employeeUsername -_id');
                const respondedUsernames = responses.map(r => r.employeeUsername);

                const query = { username: { $nin: respondedUsernames } };
                if (!q.targetEmployees.includes('all')) {
                    query.username.$in = q.targetEmployees;
                }
                
                const employeesToNotify = await Employee.find(query, 'email username');

                console.log(`Sending ${employeesToNotify.length} deadline-passed notifications for question: "${q.title}"`);
                employeesToNotify.forEach(emp => {
                    emailService.sendDeadlinePassedEmail(emp.email, q.title);
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