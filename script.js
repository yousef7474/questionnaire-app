// The base URL of our new backend server
// In script.js
const API_URL = 'https://questionnaire-app-xd7f.onrender.com/api';
// This variable will hold the user info returned from the server after login
let currentUser = null;

// The data arrays are now GONE from the frontend. 
// We will keep a local copy after fetching from the server to build the UI.
let questions = [];
let responses = [];
let employees = [];

// =================================================================
// --- Authentication & Initialization ---
// =================================================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value; // In a real app, this should be handled more securely
    const role = document.getElementById('userRole').value;

    try {
        const res = await fetch(`${API_URL}/employees/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Login failed');
        }

        currentUser = await res.json();
        
        // Fetch all necessary data from the server once after successful login
        await fetchAllData();
        
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.add('hidden');

        if (currentUser.role === 'admin') {
            document.getElementById('adminDashboard').classList.remove('hidden');
            document.getElementById('adminUsername').textContent = currentUser.username;
            // Now render the UI with the fetched data
            renderAdminDashboard();
        } else {
            document.getElementById('employeeDashboard').classList.remove('hidden');
            document.getElementById('employeeUsername').textContent = currentUser.fullName || currentUser.username;
            // Now render the UI with the fetched data
            renderEmployeeDashboard();
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const newEmployee = {
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        fullName: document.getElementById('regFullName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        department: document.getElementById('regDepartment').value,
    };

    try {
        const res = await fetch(`${API_URL}/employees/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEmployee)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Registration failed.');
        }

        alert('Registration successful! You can now login.');
        showLogin();
        document.getElementById('registerForm').reset();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

async function fetchAllData() {
    try {
        // Use Promise.all to fetch all data concurrently for better performance
        const [questionsRes, responsesRes, employeesRes] = await Promise.all([
            fetch(`${API_URL}/questions`),
            fetch(`${API_URL}/responses`),
            fetch(`${API_URL}/employees`)
        ]);

        if (!questionsRes.ok || !responsesRes.ok || !employeesRes.ok) {
            throw new Error('Failed to fetch one or more resources from the server.');
        }
        
        // Populate our local arrays with data from the server
        questions = await questionsRes.json();
        responses = await responsesRes.json();
        employees = await employeesRes.json();

    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        alert("Could not connect to the server. Please ensure the server is running and accessible.");
    }
}

// =================================================================
// --- UI Rendering Functions ---
// These functions are now responsible for DISPLAYING the data
// that was fetched and stored in the local arrays.
// =================================================================

function renderAdminDashboard() {
    showAdminTab('create'); // Start on the create tab
    updateStats();
    loadQuestions();
    loadEmployees();
    loadResponses();
    loadEmployeeOptions();
    // loadReminders(); // Reminder logic is complex and best handled server-side in a future phase
}

function renderEmployeeDashboard() {
    loadEmployeeQuestions();
}

// Update statistics using the client-side arrays
function updateStats() {
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('totalResponses').textContent = responses.length;
    document.getElementById('totalEmployees').textContent = employees.length;
    
    const activeQuestions = questions.filter(q => q.status === 'Active');
    const expectedResponses = activeQuestions.reduce((sum, q) => {
        const targetCount = q.targetEmployees.includes('all') ? 
            employees.length : q.targetEmployees.length;
        return sum + targetCount;
    }, 0);
    
    const pendingCount = responses.filter(r => activeQuestions.some(q => q.id === r.questionId)).length;
    const pendingResponses = Math.max(0, expectedResponses - pendingCount);
    document.getElementById('pendingResponses').textContent = pendingResponses;
}

// Load questions for admin view
// In script.js
function loadQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    // Helper function to calculate status on the client-side
    const getStatus = (q) => {
        const now = new Date();
        const releaseTime = new Date(q.releaseTime);
        const expiryTime = q.expiryTime ? new Date(q.expiryTime) : null;
        if (now < releaseTime) return 'Scheduled';
        if (expiryTime && now > expiryTime) return 'Expired';
        return 'Active';
    };
    
    const sortedQuestions = [...questions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedQuestions.forEach(q => {
        const status = getStatus(q); // Calculate status here!
        const statusClass = status === 'Active' ? 'status-active' : 
                          status === 'Scheduled' ? 'status-scheduled' : 'status-expired';
        
        // ... the rest of the function remains the same, but uses 'status'
        const responseCount = responses.filter(r => r.questionId === q._id).length; // Use _id for MongoDB
        // ...
        // The rest of your innerHTML logic is the same, just make sure to use `status`
        // For completeness, here is the full card content:
        const card = document.createElement('div');
        card.className = 'question-card';
        const targetCount = q.targetEmployees.includes('all') ? employees.length : q.targetEmployees.length;
        card.innerHTML = `
            <h3>${q.title}</h3>
            <p><strong>Release:</strong> ${new Date(q.releaseTime).toLocaleString()}</p>
            ${q.expiryTime ? `<p><strong>Expiry:</strong> ${new Date(q.expiryTime).toLocaleString()}</p>` : ''}
            <p><strong>Target:</strong> ${q.targetEmployees.join(', ')}</p>
            <p><strong>Responses:</strong> ${responseCount} / ${targetCount}</p>
            <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${status}</span></p>
            <div style="margin-top: 15px;">
                <button class="danger-btn" onclick="deleteQuestion('${q._id}')">Delete</button>
            </div>
        `; // IMPORTANT: Changed to q._id and passed as a string
        questionsList.appendChild(card);
    });
}

// Load employees for admin view
function loadEmployees() {
    const employeesList = document.getElementById('employeesList');
    employeesList.innerHTML = '';
    
    employees.forEach(emp => {
        const responseCount = responses.filter(r => r.employeeUsername === emp.username).length;
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <h3>${emp.fullName}</h3>
            <div class="employee-info">
                <p><strong>Username:</strong> ${emp.username}</p>
                <p><strong>Email:</strong> ${emp.email}</p>
                <p><strong>Phone:</strong> ${emp.phone}</p>
                <p><strong>Department:</strong> ${emp.department || 'Not specified'}</p>
                <p><strong>Total Responses:</strong> ${responseCount}</p>
                <p><strong>Registered:</strong> ${new Date(emp.registeredAt).toLocaleDateString()}</p>
            </div>
            <!-- <button class="danger-btn" onclick="deleteEmployee(${emp.id})">Remove Employee</button> -->
        `;
        employeesList.appendChild(card);
    });
}

// Load responses for admin view
function loadResponses() {
    const responsesList = document.getElementById('responsesList');
    responsesList.innerHTML = '';
    
    if (responses.length === 0) {
        responsesList.innerHTML = '<div class="response-card"><p>No responses have been submitted yet.</p></div>';
        return;
    }

    // Group responses by question ID
    const responsesByQuestion = responses.reduce((acc, response) => {
        (acc[response.questionId] = acc[response.questionId] || []).push(response);
        return acc;
    }, {});

    const sortedQuestions = [...questions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedQuestions.forEach(question => {
        const questionId = question.id;
        const questionResponses = responsesByQuestion[questionId];

        if (!questionResponses || questionResponses.length === 0) {
            return; // Skip questions with no responses
        }
        
        const questionDiv = document.createElement('div');
        questionDiv.style.marginBottom = "30px";
        questionDiv.innerHTML = `<h3 style="color: white; margin-bottom: 15px;">${question.title}</h3>`;

        questionResponses.forEach(r => {
            const employee = employees.find(e => e.username === r.employeeUsername);
            const card = document.createElement('div');
            card.className = 'response-card';
            card.innerHTML = `
                <div class="response-header">
                    <div>
                        <strong>${r.employeeFullName || r.employeeUsername}</strong>
                        ${employee ? `<br><small>${employee.email}</small>` : ''}
                    </div>
                    <span style="color: #666;">${new Date(r.submittedAt).toLocaleString()}</span>
                </div>
                <p><strong>Answer:</strong> 
                    <span class="response-answer ${r.answer.toLowerCase()}">${r.answer}</span>
                </p>
                ${r.attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${r.attachmentUrl}" class="attachment-link" target="_blank">View Attachment</a></p>` : ''}
            `;
            questionDiv.appendChild(card);
        });
        responsesList.appendChild(questionDiv);
    });
}

// Load questions for a specific employee
function loadEmployeeQuestions() {
    const employeeQuestionsDiv = document.getElementById('employeeQuestions');
    employeeQuestionsDiv.innerHTML = '';
    
    const now = new Date();
    // Filter questions based on targeting and date constraints
    const myQuestions = questions.filter(q => {
        const isReleased = now >= new Date(q.releaseTime);
        const notExpired = !q.expiryTime || now <= new Date(q.expiryTime);
        const isTargeted = q.targetEmployees.includes('all') || q.targetEmployees.includes(currentUser.username);
        return isReleased && notExpired && isTargeted;
    });
    
    if (myQuestions.length === 0) {
        employeeQuestionsDiv.innerHTML = '<div class="question-card"><p>No questions are currently available for you.</p></div>';
        return;
    }

    myQuestions.forEach(q => {
        const existingResponse = responses.find(r => r.questionId === q.id && r.employeeUsername === currentUser.username);
        const card = document.createElement('div');
        card.className = 'question-card';
        
        if (existingResponse) {
            card.innerHTML = `
                <h3>${q.title}</h3>
                <div class="response-section">
                    <p><strong>Your Response:</strong> 
                        <span class="response-answer ${existingResponse.answer.toLowerCase()}">${existingResponse.answer}</span>
                    </p>
                    ${existingResponse.attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${existingResponse.attachmentUrl}" class="attachment-link" target="_blank">View Attachment</a></p>` : ''}
                    <p style="color: #666; margin-top: 10px;">Submitted on: ${new Date(existingResponse.submittedAt).toLocaleString()}</p>
                </div>
            `;
        } else {
            card.innerHTML = `
                <h3>${q.title}</h3>
                <form onsubmit="submitResponse(event, ${q.id})">
                    <div class="radio-group">
                        <label class="radio-label"><input type="radio" name="answer_${q.id}" value="Yes" required><span>Yes</span></label>
                        <label class="radio-label"><input type="radio" name="answer_${q.id}" value="No" required><span>No</span></label>
                    </div>
                    <div class="attachment-section">
                        <label>Attachment (Optional):</label>
                        <input type="file" id="attachment_${q.id}" accept="image/*,.pdf,.doc,.docx">
                        <input type="url" id="url_${q.id}" placeholder="Or paste a URL">
                    </div>
                    <button type="submit" class="secondary-btn">Submit Response</button>
                </form>
            `;
        }
        
        employeeQuestionsDiv.appendChild(card);
    });
}


// =================================================================
// --- Actions (Functions that send data TO the server) ---
// =================================================================

document.getElementById('questionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const questionData = {
        title: document.getElementById('questionTitle').value,
        releaseTime: new Date(document.getElementById('releaseTime').value),
        expiryTime: document.getElementById('expiryTime').value ? new Date(document.getElementById('expiryTime').value) : null,
        targetEmployees: Array.from(document.getElementById('targetEmployees').selectedOptions).map(option => option.value),
        sendEmailNotification: document.getElementById('sendEmailNotification').checked,
        sendReminder: document.getElementById('sendReminder').checked,
        createdBy: currentUser.username,
    };

    try {
        const res = await fetch(`${API_URL}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData)
        });
        if (!res.ok) throw new Error('Failed to create question.');
        
        const newQuestion = await res.json();
        questions.push(newQuestion); // Add new question to our local copy for immediate UI update
        
        alert('Question created successfully!');
        document.getElementById('questionForm').reset();
        renderAdminDashboard(); // Re-render the entire admin UI with the new data
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

async function submitResponse(event, questionId) {
    event.preventDefault();
    const answer = document.querySelector(`input[name="answer_${questionId}"]:checked`).value;
    // NOTE: File upload is complex. This example only sends the URL.
    // A real implementation would require a file upload endpoint on the server.
    const attachmentUrl = document.getElementById(`url_${questionId}`).value || ''; 
    
    const responseData = {
        questionId: questionId,
        employeeUsername: currentUser.username,
        employeeFullName: currentUser.fullName,
        answer: answer,
        attachmentUrl: attachmentUrl,
    };
    
    try {
        const res = await fetch(`${API_URL}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responseData)
        });
        if (!res.ok) throw new Error('Failed to submit response.');

        const newResponse = await res.json();
        responses.push(newResponse); // Add to our local copy for immediate UI update

        alert('Response submitted successfully!');
        renderEmployeeDashboard(); // Re-render this employee's view
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// In script.js
async function deleteQuestion(id) {
    // The 'id' is now a string from MongoDB, so we don't need parseInt
    if (!confirm('Are you sure you want to delete this question and all its associated responses?')) return;
    try {
        const res = await fetch(`${API_URL}/questions/${id}`, { method: 'DELETE' });
        if (res.status !== 204) throw new Error('Failed to delete question on the server.');
        
        // Refetch all data to ensure consistency
        await fetchAllData();

        alert('Question deleted successfully.');
        renderAdminDashboard();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// =================================================================
// --- Helper & Utility Functions (Largely Unchanged) ---
// =================================================================

function showRegister() { document.getElementById('loginScreen').classList.add('hidden'); document.getElementById('registerScreen').classList.remove('hidden'); }
function showLogin() { document.getElementById('registerScreen').classList.add('hidden'); document.getElementById('loginScreen').classList.remove('hidden'); }

function logout() {
    currentUser = null;
    questions = [];
    responses = [];
    employees = [];
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('employeeDashboard').classList.add('hidden');
    document.getElementById('loginForm').reset();
}

function showAdminTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`${tab}Tab`).classList.remove('hidden');
    document.querySelector(`.tab[onclick="showAdminTab('${tab}')"]`).classList.add('active');
}

function loadEmployeeOptions() {
    const select = document.getElementById('targetEmployees');
    select.innerHTML = '<option value="all">All Employees</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.username;
        option.textContent = `${emp.fullName} (${emp.department || 'No Dept'})`;
        select.appendChild(option);
    });
}

// Export functions remain the same as they operate on the client-side arrays, which are populated from the server.
function exportQuestionsToExcel() {
    const data = questions.map(q => ({
        'Question': q.title,
        'Release Date': new Date(q.releaseTime).toLocaleString(),
        'Expiry Date': q.expiryTime ? new Date(q.expiryTime).toLocaleString() : 'No expiry',
        'Target': q.targetEmployees.join(', '),
        'Status': q.status,
        'Responses': responses.filter(r => r.questionId === q.id).length,
        'Created By': q.createdBy,
        'Created At': new Date(q.createdAt).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "questions_export.xlsx");
}

function exportResponsesToExcel() {
    const data = [];
    questions.forEach(q => {
        const questionResponses = responses.filter(r => r.questionId === q.id);
        questionResponses.forEach(r => {
            const employee = employees.find(e => e.username === r.employeeUsername);
            data.push({
                'Question': q.title,
                'Employee Name': r.employeeFullName || r.employeeUsername,
                'Employee Email': employee ? employee.email : 'N/A',
                'Department': employee ? employee.department : 'N/A',
                'Answer': r.answer,
                'Has Attachment': r.attachmentUrl ? 'Yes' : 'No',
                'Submitted At': new Date(r.submittedAt).toLocaleString()
            });
        });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    XLSX.writeFile(wb, "responses_export.xlsx");
}

function exportEmployeesToExcel() {
    const data = employees.map(emp => ({
        'Full Name': emp.fullName,
        'Username': emp.username,
        'Email': emp.email,
        'Phone': emp.phone,
        'Department': emp.department || 'Not specified',
        'Total Responses': responses.filter(r => r.employeeUsername === emp.username).length,
        'Registered Date': new Date(emp.registeredAt).toLocaleDateString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employees_export.xlsx");
}