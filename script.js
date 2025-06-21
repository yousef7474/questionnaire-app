// The base URL of our new backend server
const API_URL = 'https://questionnaire-app-xd7f.onrender.com/api';

// This variable will hold the user info returned from the server after login
let currentUser = null;

// Local copies of data, populated from the server on login.
let questions = [];
let responses = [];
let employees = [];

// =================================================================
// --- Theme & Language Logic ---
// =================================================================

// --- Theme Switcher Logic ---
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelectorAll('#themeToggle, #employeeThemeToggle').forEach(btn => btn.textContent = '🌙');
    } else {
        document.body.classList.remove('dark-theme');
        document.querySelectorAll('#themeToggle, #employeeThemeToggle').forEach(btn => btn.textContent = '☀️');
    }
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme); // Save choice in browser storage
    applyTheme(currentTheme);
}

// --- Language Switcher Logic ---
const translations = {
    en: {
        app_title: "Employee Questionnaire System",
        username_placeholder: "Username",
        password_placeholder: "Password",
        select_role: "Select Role",
        role_admin: "Manager/Admin",
        role_employee: "Employee",
        login_btn: "Login",
        register_link: "Register as new employee",
        demo_note: "Demo: Use any username/password",
        employee_registration_title: "Employee Registration",
        full_name_placeholder: "Full Name",
        email_placeholder: "Email Address",
        phone_placeholder: "Phone Number",
        department_placeholder: "Department",
        register_btn: "Register",
        back_to_login_link: "Back to login",
        admin_dashboard_title: "Manager Dashboard",
        logout_btn: "Logout",
        stat_total_questions: "Total Questions",
        stat_total_responses: "Total Responses",
        stat_total_employees: "Registered Employees",
        stat_pending_responses: "Pending Responses",
        tab_create_questions: "Create Questions",
        tab_manage_questions: "Manage Questions",
        tab_view_responses: "View Responses",
        tab_manage_employees: "Manage Employees",
        tab_reminders: "Reminders",
        create_new_question_title: "Create New Question",
        label_question_title: "Question Title:",
        question_title_placeholder: "Enter your question",
        label_release_time: "Release Date & Time:",
        label_expiry_time: "Expiry Date & Time (Optional):",
        label_target_employees: "Target Employees:",
        option_all_employees: "All Employees",
        notification_settings_title: "Notification Settings",
        checkbox_email_notification: "Send email notification when question is released",
        checkbox_expiry_reminder: "Send reminder 24 hours before expiry",
        create_question_btn: "Create Question",
        manage_questions_title: "Manage Questions",
        export_excel_btn: "Export to Excel",
        employee_responses_title: "Employee Responses",
        export_all_responses_btn: "Export All Responses to Excel",
        registered_employees_title: "Registered Employees",
        reminder_settings_title: "Reminder Settings",
        reminder_settings_desc: "Configure automatic reminders for employees",
        checkbox_enable_reminders: "Enable automatic reminders for all questions",
        label_reminder_schedule: "Reminder Schedule:",
        option_24_hours: "24 hours before expiry",
        option_48_hours: "48 hours before expiry",
        option_72_hours: "72 hours before expiry",
        save_settings_btn: "Save Settings",
        employee_dashboard_title: "Employee Dashboard",
        my_profile_btn: "My Profile",
        edit_profile_btn: "Edit Profile",
        your_questions_title: "Your Questions"
    },
    ar: {
        app_title: "نظام استبيان الموظفين",
        username_placeholder: "اسم المستخدم",
        password_placeholder: "كلمة المرور",
        select_role: "اختر الدور",
        role_admin: "مدير / مسؤول",
        role_employee: "موظف",
        login_btn: "تسجيل الدخول",
        register_link: "تسجيل كموظف جديد",
        demo_note: "تجريبي: استخدم أي اسم مستخدم/كلمة مرور",
        employee_registration_title: "تسجيل الموظف",
        full_name_placeholder: "الاسم الكامل",
        email_placeholder: "البريد الإلكتروني",
        phone_placeholder: "رقم الهاتف",
        department_placeholder: "القسم",
        register_btn: "تسجيل",
        back_to_login_link: "العودة إلى تسجيل الدخول",
        admin_dashboard_title: "لوحة تحكم المدير",
        logout_btn: "تسجيل الخروج",
        stat_total_questions: "مجموع الأسئلة",
        stat_total_responses: "مجموع الردود",
        stat_total_employees: "الموظفون المسجلون",
        stat_pending_responses: "الردود المعلقة",
        tab_create_questions: "إنشاء أسئلة",
        tab_manage_questions: "إدارة الأسئلة",
        tab_view_responses: "عرض الردود",
        tab_manage_employees: "إدارة الموظفين",
        tab_reminders: "التذكيرات",
        create_new_question_title: "إنشاء سؤال جديد",
        label_question_title: "عنوان السؤال:",
        question_title_placeholder: "أدخل سؤالك",
        label_release_time: "تاريخ ووقت النشر:",
        label_expiry_time: "تاريخ ووقت الانتهاء (اختياري):",
        label_target_employees: "الموظفون المستهدفون:",
        option_all_employees: "كل الموظفين",
        notification_settings_title: "إعدادات الإشعارات",
        checkbox_email_notification: "إرسال إشعار بالبريد الإلكتروني عند نشر السؤال",
        checkbox_expiry_reminder: "إرسال تذكير قبل 24 ساعة من الانتهاء",
        create_question_btn: "إنشاء السؤال",
        manage_questions_title: "إدارة الأسئلة",
        export_excel_btn: "تصدير إلى Excel",
        employee_responses_title: "ردود الموظفين",
        export_all_responses_btn: "تصدير كل الردود إلى Excel",
        registered_employees_title: "الموظفون المسجلون",
        reminder_settings_title: "إعدادات التذكير",
        reminder_settings_desc: "تكوين تذكيرات تلقائية للموظفين",
        checkbox_enable_reminders: "تمكين التذكيرات التلقائية لجميع الأسئلة",
        label_reminder_schedule: "جدول التذكير:",
        option_24_hours: "24 ساعة قبل الانتهاء",
        option_48_hours: "48 ساعة قبل الانتهاء",
        option_72_hours: "72 ساعة قبل الانتهاء",
        save_settings_btn: "حفظ الإعدادات",
        employee_dashboard_title: "لوحة تحكم الموظف",
        my_profile_btn: "ملفي الشخصي",
        edit_profile_btn: "تعديل الملف الشخصي",
        your_questions_title: "أسئلتك"
    }
};

function setLanguage(lang) {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });

    if (lang === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.lang = 'ar';
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.lang = 'en';
    }
    localStorage.setItem('language', lang); // Save choice
}

// Apply saved settings when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Apply theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Apply language
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);

    // Add a single, delegated event listener for theme toggles
    document.body.addEventListener('click', function(event) {
        if (event.target.id === 'themeToggle' || event.target.id === 'employeeThemeToggle') {
            toggleTheme();
        }
    });
});


// =================================================================
// --- Authentication & Initialization ---
// =================================================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
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
        await fetchAllData();
        
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.add('hidden');

        if (currentUser.role === 'admin') {
            document.getElementById('adminDashboard').classList.remove('hidden');
            document.getElementById('adminUsername').textContent = currentUser.username;
            renderAdminDashboard();
        } else {
            document.getElementById('employeeDashboard').classList.remove('hidden');
            document.getElementById('employeeUsername').textContent = currentUser.fullName || currentUser.username;
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
        const [questionsRes, responsesRes, employeesRes] = await Promise.all([
            fetch(`${API_URL}/questions`),
            fetch(`${API_URL}/responses`),
            fetch(`${API_URL}/employees`)
        ]);

        if (!questionsRes.ok || !responsesRes.ok || !employeesRes.ok) {
            throw new Error('Failed to fetch one or more resources from the server.');
        }
        
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
// =================================================================

function renderAdminDashboard() {
    showAdminTab('create');
    updateStats();
    loadQuestions();
    loadEmployees();
    loadResponses();
    loadEmployeeOptions();
}

function renderEmployeeDashboard() {
    loadEmployeeQuestions();
}

function updateStats() {
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('totalResponses').textContent = responses.length;
    document.getElementById('totalEmployees').textContent = employees.length;
    
    const activeQuestions = questions.filter(q => {
        const now = new Date();
        const releaseTime = new Date(q.releaseTime);
        const expiryTime = q.expiryTime ? new Date(q.expiryTime) : null;
        return now >= releaseTime && (!expiryTime || now <= expiryTime);
    });
    
    const expectedResponses = activeQuestions.reduce((sum, q) => {
        const targetCount = q.targetEmployees.includes('all') ? employees.length : q.targetEmployees.length;
        return sum + targetCount;
    }, 0);
    
    const pendingCount = responses.filter(r => activeQuestions.some(q => q._id === r.questionId)).length;
    const pendingResponses = Math.max(0, expectedResponses - pendingCount);
    document.getElementById('pendingResponses').textContent = pendingResponses;
}

function loadQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

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
        const status = getStatus(q);
        const statusClass = status === 'Active' ? 'status-active' : 
                          status === 'Scheduled' ? 'status-scheduled' : 'status-expired';
        
        const responseCount = responses.filter(r => r.questionId === q._id).length;
        const targetCount = q.targetEmployees.includes('all') ? employees.length : q.targetEmployees.length;
        
        const card = document.createElement('div');
        card.className = 'question-card';
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
        `;
        questionsList.appendChild(card);
    });
}

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
        `;
        employeesList.appendChild(card);
    });
}

function loadResponses() {
    const responsesList = document.getElementById('responsesList');
    responsesList.innerHTML = '';
    
    if (responses.length === 0) {
        responsesList.innerHTML = '<div class="response-card"><p>No responses have been submitted yet.</p></div>';
        return;
    }

    const responsesByQuestion = responses.reduce((acc, response) => {
        (acc[response.questionId] = acc[response.questionId] || []).push(response);
        return acc;
    }, {});

    const sortedQuestions = [...questions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedQuestions.forEach(question => {
        const questionId = question._id;
        const questionResponses = responsesByQuestion[questionId];

        if (!questionResponses || questionResponses.length === 0) return;
        
        const questionDiv = document.createElement('div');
        questionDiv.style.marginBottom = "30px";
        questionDiv.innerHTML = `<h3 style="color: var(--text-primary); margin-bottom: 15px;">${question.title}</h3>`;

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
                    <span style="color: var(--text-secondary);">${new Date(r.submittedAt).toLocaleString()}</span>
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

function loadEmployeeQuestions() {
    const employeeQuestionsDiv = document.getElementById('employeeQuestions');
    employeeQuestionsDiv.innerHTML = '';
    
    const now = new Date();
    const myQuestions = questions.filter(q => {
        const isReleased = now >= new Date(q.releaseTime);
        const notExpired = !q.expiryTime || now <= new Date(q.expiryTime);
        const isTargeted = q.targetEmployees.includes('all') || q.targetEmployees.includes(currentUser.username);
        return isReleased && notExpired && isTargeted;
    });
    
    if (myQuestions.length === 0) {
        employeeQuestionsDiv.innerHTML = '<div class="question-card"><p data-translate="no_questions_available">No questions are currently available for you.</p></div>';
        setLanguage(localStorage.getItem('language') || 'en'); // Re-apply language
        return;
    }

    myQuestions.forEach(q => {
        const existingResponse = responses.find(r => r.questionId === q._id && r.employeeUsername === currentUser.username);
        const card = document.createElement('div');
        card.className = 'question-card';
        
        if (existingResponse) {
            card.innerHTML = `
                <h3>${q.title}</h3>
                <div class="response-section">
                    <p><strong data-translate="your_response">Your Response:</strong> 
                        <span class="response-answer ${existingResponse.answer.toLowerCase()}">${existingResponse.answer}</span>
                    </p>
                    ${existingResponse.attachmentUrl ? `<p><strong data-translate="attachment_label">Attachment:</strong> <a href="${existingResponse.attachmentUrl}" class="attachment-link" target="_blank" data-translate="view_attachment_link">View Attachment</a></p>` : ''}
                    <p style="color: var(--text-secondary); margin-top: 10px;">
                        <span data-translate="submitted_on">Submitted on:</span> ${new Date(existingResponse.submittedAt).toLocaleString()}
                    </p>
                </div>
            `;
        } else {
            card.innerHTML = `
                <h3>${q.title}</h3>
                <form onsubmit="submitResponse(event, '${q._id}')">
                    <div class="radio-group">
                        <label class="radio-label"><input type="radio" name="answer_${q._id}" value="Yes" required><span data-translate="yes_option">Yes</span></label>
                        <label class="radio-label"><input type="radio" name="answer_${q._id}" value="No" required><span data-translate="no_option">No</span></label>
                    </div>
                    <div class="attachment-section">
                        <label data-translate="attachment_label_optional">Attachment (Optional):</label>
                        <input type="file" id="attachment_${q._id}" accept="image/*,.pdf,.doc,.docx">
                        <input type="url" id="url_${q._id}" data-translate-placeholder="paste_url_placeholder" placeholder="Or paste a URL">
                    </div>
                    <button type="submit" class="secondary-btn" data-translate="submit_response_btn">Submit Response</button>
                </form>
            `;
        }
        
        employeeQuestionsDiv.appendChild(card);
    });
    setLanguage(localStorage.getItem('language') || 'en'); // Re-apply language after creating dynamic content
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
        questions.push(newQuestion);
        
        alert('Question created successfully!');
        document.getElementById('questionForm').reset();
        renderAdminDashboard();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

async function submitResponse(event, questionId) {
    event.preventDefault();
    const answer = document.querySelector(`input[name="answer_${questionId}"]:checked`).value;
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
        responses.push(newResponse);

        alert('Response submitted successfully!');
        renderEmployeeDashboard();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question and all its associated responses?')) return;
    try {
        const res = await fetch(`${API_URL}/questions/${id}`, { method: 'DELETE' });
        if (res.status !== 204) throw new Error('Failed to delete question on the server.');
        
        await fetchAllData();
        alert('Question deleted successfully.');
        renderAdminDashboard();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// =================================================================
// --- Helper & Utility Functions ---
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
    select.innerHTML = '<option value="all" data-translate="option_all_employees">All Employees</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.username;
        option.textContent = `${emp.fullName} (${emp.department || 'No Dept'})`;
        select.appendChild(option);
    });
    setLanguage(localStorage.getItem('language') || 'en'); // Re-apply language
}

function showEmployeeProfile() {
    const profileDiv = document.getElementById('employeeProfile');
    const profileInfo = document.getElementById('profileInfo');
    
    profileInfo.innerHTML = `
        <div class="employee-info">
            <p><strong data-translate="profile_username">Username:</strong> ${currentUser.username}</p>
            <p><strong data-translate="profile_fullname">Full Name:</strong> ${currentUser.fullName}</p>
            <p><strong data-translate="profile_email">Email:</strong> ${currentUser.email}</p>
            <p><strong data-translate="profile_phone">Phone:</strong> ${currentUser.phone}</p>
            <p><strong data-translate="profile_department">Department:</strong> ${currentUser.department || 'Not specified'}</p>
            <p><strong data-translate="profile_since">Member Since:</strong> ${new Date(currentUser.registeredAt).toLocaleDateString()}</p>
        </div>
    `;
    
    profileDiv.classList.toggle('hidden');
    setLanguage(localStorage.getItem('language') || 'en');
}

function editProfile() {
    // Basic prompt, can be improved with a modal
    const newEmail = prompt('Enter new email:', currentUser.email);
    if (newEmail) {
        // In a real app, this would be a PATCH/PUT request to the server
        currentUser.email = newEmail;
        const empIndex = employees.findIndex(e => e._id === currentUser._id);
        if (empIndex !== -1) {
            employees[empIndex].email = newEmail;
        }
        alert('Profile updated locally! (Server update not implemented)');
        showEmployeeProfile();
    }
}

// Export functions remain largely the same, but should be updated to use current language for headers
function exportQuestionsToExcel() {
    const data = questions.map(q => ({
        'Question': q.title,
        'Release Date': new Date(q.releaseTime).toLocaleString(),
        'Expiry Date': q.expiryTime ? new Date(q.expiryTime).toLocaleString() : 'No expiry',
        'Target': q.targetEmployees.join(', '),
        'Status': 'N/A', // getStatus is not available here, simplify for export
        'Responses': responses.filter(r => r.questionId === q._id).length,
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
    responses.forEach(r => {
        const question = questions.find(q => q._id === r.questionId);
        const employee = employees.find(e => e.username === r.employeeUsername);
        data.push({
            'Question': question ? question.title : 'N/A',
            'Employee Name': r.employeeFullName || r.employeeUsername,
            'Employee Email': employee ? employee.email : 'N/A',
            'Department': employee ? employee.department : 'N/A',
            'Answer': r.answer,
            'Has Attachment': r.attachmentUrl ? 'Yes' : 'No',
            'Submitted At': new Date(r.submittedAt).toLocaleString()
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