const express = require('express');
const cors = require('cors');
const path = 'path';
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// In server.js - THIS IS THE CORRECT LINE
const MONGO_URI = process.env.MONGO_URI;
// --- Middleware ---
app.use(cors()); 
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
// These are the blueprints for how our data will be stored in MongoDB.
// =================================================================

const EmployeeSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In a real app, ALWAYS hash passwords
    fullName: { type: String, required: true },
    email: { type: String, required: true },
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
    // We remove `sendEmailNotification` and `sendReminder` for now, as that's an advanced server-side feature
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

// THE IN-MEMORY ARRAYS and initializeSampleData() ARE NOW GONE!

// =================================================================
// --- API ROUTES (Now interacting with the database) ---
// =================================================================

// --- Employees API ---
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await Employee.find().select('-password'); // Exclude passwords from being sent
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
        res.status(201).json(newEmployee);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

app.post('/api/employees/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (role === 'employee') {
            const employee = await Employee.findOne({ username: username });
            if (!employee || employee.password !== password) { // Simple password check, NOT secure
                return res.status(404).json({ message: "Invalid username or password." });
            }
            const employeeData = employee.toObject();
            delete employeeData.password; // Don't send password to client
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
        res.status(201).json(newQuestion);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Also delete all responses associated with this question
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
// --- Server Start ---
// =================================================================
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});