// The base URL of our new backend server
const API_URL = 'https://questionnaire-app-xd7f.onrender.com/api';

// This variable will hold the user info returned from the server after login
let currentUser = null;

// Local copies of data, populated from the server on login.
let questions = [];
let responses = [];
let employees = [];

// This will hold our Cloudinary configuration
let cloudinaryConfig = null;

// Helper function to fetch Cloudinary config from our server
async function getCloudinaryConfig() {
    if (!cloudinaryConfig) {
        try {
            const res = await fetch(`${API_URL}/config/cloudinary`);
            if (!res.ok) throw new Error('Failed to fetch Cloudinary config.');
            cloudinaryConfig = await res.json();
        } catch (error) {
            console.error("Could not fetch Cloudinary config", error);
        }
    }
    return cloudinaryConfig;
}


// =================================================================
// --- Theme & Language Logic ---
// =================================================================

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
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

const translations = {
    en: {
        app_title: "Employee Questionnaire System", username_placeholder: "Username", password_placeholder: "Password", select_role: "Select Role", role_admin: "Manager/Admin", role_employee: "Employee", login_btn: "Login", register_link: "Register as new employee", demo_note: "Demo: Use any username/password", employee_registration_title: "Employee Registration", full_name_placeholder: "Full Name", email_placeholder: "Email Address", phone_placeholder: "Phone Number", department_placeholder: "Department", register_btn: "Register", back_to_login_link: "Back to login", admin_dashboard_title: "Manager Dashboard", logout_btn: "Logout",
        stat_total_questions: "Total Questions", stat_total_responses: "Total Responses", stat_total_employees: "Registered Employees", stat_pending_responses: "Pending Responses",
        tab_create_questions: "Create Questions", tab_manage_questions: "Manage Questions", tab_view_responses: "View Responses", tab_manage_employees: "Manage Employees", tab_reminders: "Reminders", create_new_question_title: "Create New Question", label_question_title: "Question Title:", question_title_placeholder: "Enter your question", label_release_time: "Release Date & Time:", label_expiry_time: "Expiry Date & Time (Optional):", label_target_employees: "Target Employees:", option_all_employees: "All Employees", notification_settings_title: "Notification Settings", checkbox_email_notification: "Send email notification when question is released", checkbox_expiry_reminder: "Send reminder 24 hours before expiry", create_question_btn: "Create Question", manage_questions_title: "Manage Questions", export_excel_btn: "Export to Excel", employee_responses_title: "Employee Responses", export_all_responses_btn: "Export All Responses to Excel", registered_employees_title: "Registered Employees", reminder_settings_title: "Reminder Settings", reminder_settings_desc: "Configure automatic reminders for employees", checkbox_enable_reminders: "Enable automatic reminders for all questions", label_reminder_schedule: "Reminder Schedule:", option_24_hours: "24 hours before expiry", option_48_hours: "48 hours before expiry", option_72_hours: "72 hours before expiry", save_settings_btn: "Save Settings", employee_dashboard_title: "Employee Dashboard", my_profile_btn: "My Profile", edit_profile_btn: "Edit Profile", your_questions_title: "Your Questions", no_questions_available: "No questions are currently available for you.", your_response: "Your Response:", attachment_label: "Attachment:", view_attachment_link: "View Attachment", submitted_on: "Submitted on:", yes_option: "Yes", no_option: "No", attachment_label_optional: "Attachment (Optional):", paste_url_placeholder: "Or paste a URL", submit_response_btn: "Submit Response", profile_username: "Username:", profile_fullname: "Full Name:", profile_email: "Email:", profile_phone: "Phone:", profile_department: "Department:", profile_since: "Member Since:",
        filter_all: "All", filter_unanswered: "Unanswered", filter_answered: "Answered",
        no_answered_questions: "You have not answered any questions yet.", no_unanswered_questions: "You have answered all available questions. Great job!",
    },
    ar: {
        app_title: "منصة حوكِم", username_placeholder: "اسم المستخدم", password_placeholder: "كلمة المرور", select_role: "اختر الدور", role_admin: "مدير / مسؤول", role_employee: "موظف", login_btn: "تسجيل الدخول", register_link: "تسجيل كموظف جديد", demo_note: "تجريبي: استخدم أي اسم مستخدم/كلمة مرور", employee_registration_title: "تسجيل الموظف", full_name_placeholder: "الاسم الكامل", email_placeholder: "البريد الإلكتروني", phone_placeholder: "رقم الهاتف", department_placeholder: "القسم", register_btn: "تسجيل", back_to_login_link: "العودة إلى تسجيل الدخول", admin_dashboard_title: "لوحة تحكم المدير", logout_btn: "تسجيل الخروج",
        stat_total_questions: "مجموع الأسئلة", stat_total_responses: "مجموع الردود", stat_total_employees: "الموظفون المسجلون", stat_pending_responses: "الردود المعلقة",
        tab_create_questions: "إنشاء أسئلة", tab_manage_questions: "إدارة الأسئلة", tab_view_responses: "عرض الردود", tab_manage_employees: "إدارة الموظفين", tab_reminders: "التذكيرات", create_new_question_title: "إنشاء سؤال جديد", label_question_title: "عنوان السؤال:", question_title_placeholder: "أدخل سؤالك", label_release_time: "تاريخ ووقت النشر:", label_expiry_time: "تاريخ ووقت الانتهاء (اختياري):", label_target_employees: "الموظفون المستهدفون:", option_all_employees: "كل الموظفين", notification_settings_title: "إعدادات الإشعارات", checkbox_email_notification: "إرسال إشعار بالبريد الإلكتروني عند نشر السؤال", checkbox_expiry_reminder: "إرسال تذكير قبل 24 ساعة من الانتهاء", create_question_btn: "إنشاء السؤال", manage_questions_title: "إدارة الأسئلة", export_excel_btn: "تصدير إلى Excel", employee_responses_title: "ردود الموظفين", export_all_responses_btn: "تصدير كل الردود إلى Excel", registered_employees_title: "الموظفون المسجلون", reminder_settings_title: "إعدادات التذكير", reminder_settings_desc: "تكوين تذكيرات تلقائية للموظفين", checkbox_enable_reminders: "تمكين التذكيرات التلقائية لجميع الأسئلة", label_reminder_schedule: "جدول التذكير:", option_24_hours: "24 ساعة قبل الانتهاء", option_48_hours: "48 ساعة قبل الانتهاء", option_72_hours: "72 ساعة قبل الانتهاء", save_settings_btn: "حفظ الإعدادات", employee_dashboard_title: "لوحة تحكم الموظف", my_profile_btn: "ملفي الشخصي", edit_profile_btn: "تعديل الملف الشخصي", your_questions_title: "أسئلتك", no_questions_available: "لا توجد أسئلة متاحة لك حاليًا.", your_response: "إجابتك:", attachment_label: "المرفق:", view_attachment_link: "عرض المرفق", submitted_on: "تم الإرسال في:", yes_option: "نعم", no_option: "لا", attachment_label_optional: "مرفق (اختياري):", paste_url_placeholder: "أو الصق رابطًا هنا", submit_response_btn: "إرسال الإجابة", profile_username: "اسم المستخدم:", profile_fullname: "الاسم الكامل:", profile_email: "البريد الإلكتروني:", profile_phone: "الهاتف:", profile_department: "القسم:", profile_since: "عضو منذ:",
        filter_all: "الكل", filter_unanswered: "لم تتم الإجابة عليها", filter_answered: "تمت الإجابة عليها",
        no_answered_questions: "لم تقم بالإجابة على أي أسئلة بعد.", no_unanswered_questions: "لقد أجبت على جميع الأسئلة المتاحة. عمل رائع!",
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
    localStorage.setItem('language', lang);
}

// =================================================================
// --- Page Load & Session Management ---
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);

    document.body.addEventListener('click', function(event) {
        if (event.target.id === 'themeToggle' || event.target.id === 'employeeThemeToggle') {
            toggleTheme();
        }
    });

    checkLoginStatus();
});

async function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.add('hidden');
        await fetchAllData();
        if (currentUser.role === 'admin') {
            document.getElementById('adminDashboard').classList.remove('hidden');
            document.getElementById('adminUsername').textContent = currentUser.username;
            renderAdminDashboard();
        } else {
            document.getElementById('employeeDashboard').classList.remove('hidden');
            document.getElementById('employeeUsername').textContent = currentUser.fullName || currentUser.username;
            renderEmployeeDashboard();
        }
    }
}


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
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
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
    showMainTab('governance');
    showSubTab('create');
    updateStats();
    loadQuestions();
    loadEmployees();
    loadResponses();
    loadEmployeeOptions();
}

function renderEmployeeDashboard() {
    const allRadio = document.querySelector('input[name="employeeQuestionFilter"][value="all"]');
    if (allRadio) {
        allRadio.checked = true;
    }
    loadEmployeeQuestions('all'); 
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
    
    const respondedCount = responses.filter(r => {
        return activeQuestions.some(q => q._id.toString() === r.questionId.toString());
    }).length;

    const pendingResponses = Math.max(0, expectedResponses - respondedCount);
    document.getElementById('pendingResponses').textContent = pendingResponses;
}


function getQuestionDetailsHtml(question) {
    if (!question) return '';
    const hasDetails = question.standard || question.indicatorNumber || question.practiceNumber || question.questionNumber;
    if (!hasDetails) return '';
    return `
        <div class="question-details-grid">
            ${question.standard ? `<span><strong>المعيار:</strong> ${question.standard}</span>` : ''}
            ${question.indicatorNumber ? `<span><strong>المؤشر:</strong> ${question.indicatorNumber}</span>` : ''}
            ${question.practiceNumber ? `<span><strong>الممارسة:</strong> ${question.practiceNumber}</span>` : ''}
            ${question.questionNumber ? `<span><strong>السؤال:</strong> ${question.questionNumber}</span>` : ''}
        </div>
    `;
}

function loadQuestions(filterStandard = 'all') {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';
    
    let filteredQuestions = [...questions];
    if (filterStandard && filterStandard !== 'all') {
        filteredQuestions = questions.filter(q => q.standard === filterStandard);
    }
    
    const getStatus = (q) => {
        const now = new Date();
        const releaseTime = new Date(q.releaseTime);
        const expiryTime = q.expiryTime ? new Date(q.expiryTime) : null;
        if (now < releaseTime) return 'Scheduled';
        if (expiryTime && now > expiryTime) return 'Expired';
        return 'Active';
    };
    const sortedQuestions = filteredQuestions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sortedQuestions.forEach(q => {
        const status = getStatus(q);
        const statusClass = status === 'Active' ? 'status-active' : status === 'Scheduled' ? 'status-scheduled' : 'status-expired';
        const responseCount = responses.filter(r => r.questionId === q._id).length;
        const targetCount = q.targetEmployees.includes('all') ? employees.length : q.targetEmployees.length;
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3>${q.title}</h3>
                <span class="status-badge ${statusClass}">${status}</span>
            </div>
            ${getQuestionDetailsHtml(q)}
            <p><strong>Release:</strong> ${new Date(q.releaseTime).toLocaleString()}</p>
            ${q.expiryTime ? `<p><strong>Expiry:</strong> ${new Date(q.expiryTime).toLocaleString()}</p>` : ''}
            <p><strong>Target:</strong> ${q.targetEmployees.join(', ')}</p>
            <p><strong>Responses:</strong> ${responseCount} / ${targetCount}</p>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="secondary-btn" onclick="reassignQuestion('${q._id}')">Re-assign</button>
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
        card.innerHTML = `<h3>${emp.fullName}</h3><div class="employee-info"><p><strong>Username:</strong> ${emp.username}</p><p><strong>Email:</strong> ${emp.email}</p><p><strong>Phone:</strong> ${emp.phone}</p><p><strong>Department:</strong> ${emp.department || 'Not specified'}</p><p><strong>Total Responses:</strong> ${responseCount}</p><p><strong>Registered:</strong> ${new Date(emp.registeredAt).toLocaleDateString()}</p></div><div class="button-group" style="display: flex; gap: 10px; margin-top: 15px;"><button class="info-btn" onclick="editEmployee('${emp._id}', '${emp.department || ''}')">Edit</button><button class="danger-btn" onclick="deleteEmployee('${emp._id}')">Delete</button></div>`;
        employeesList.appendChild(card);
    });
}

function loadResponses(filterStandard = 'all') {
    const responsesList = document.getElementById('responsesByEmployeeList');
    responsesList.innerHTML = '';
    if (responses.length === 0) {
        responsesList.innerHTML = '<div class="response-card"><p>No responses have been submitted yet.</p></div>';
        return;
    }

    const responsesByEmployee = responses.reduce((acc, response) => {
        (acc[response.employeeUsername] = acc[response.employeeUsername] || []).push(response);
        return acc;
    }, {});
    
    let hasVisibleResponses = false;

    const sortedUsernames = Object.keys(responsesByEmployee).sort((a, b) => {
        const empA = employees.find(e => e.username === a);
        const empB = employees.find(e => e.username === b);
        const nameA = empA ? empA.fullName.toLowerCase() : a;
        const nameB = empB ? empB.fullName.toLowerCase() : b;
        return nameA.localeCompare(nameB);
    });

    for (const username of sortedUsernames) {
        const employeeResponses = responsesByEmployee[username];
        
        const responsesToDisplay = (filterStandard === 'all')
            ? employeeResponses
            : employeeResponses.filter(r => {
                const question = questions.find(q => q._id === r.questionId);
                return question && question.standard === filterStandard;
            });

        if (responsesToDisplay.length === 0) {
            continue;
        }
        
        hasVisibleResponses = true;
        const employee = employees.find(e => e.username === username);
        const employeeName = employee ? employee.fullName : username;
        const employeeGroupDiv = document.createElement('div');
        employeeGroupDiv.className = 'employee-response-group';
        
        let responsesHtml = '';
        responsesToDisplay.forEach(r => {
            const question = questions.find(q => q._id === r.questionId);
            responsesHtml += `
                <div class="response-card">
                    <div class="response-header">
                        <div>
                            <strong>Question:</strong> ${question ? question.title : 'N/A'}
                            ${getQuestionDetailsHtml(question)}
                        </div>
                        <span style="color: var(--text-secondary);">${new Date(r.submittedAt).toLocaleString()}</span>
                    </div>
                    <p><strong>Answer:</strong> <span class="response-answer ${r.answer.toLowerCase()}">${r.answer}</span></p>
                    ${r.attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${r.attachmentUrl}" class="attachment-link" target="_blank" download>View Attachment</a></p>` : ''}
                </div>
            `;
        });
        
        const lang = localStorage.getItem('language') || 'en';
        const exportBtnText = lang === 'ar' ? 'تصدير لهذا الموظف' : 'Export for this Employee';
        employeeGroupDiv.innerHTML = `
            <div class="employee-response-header">
                <h3>${employeeName} (${employee ? employee.email : 'N/A'})</h3>
                <button class="secondary-btn" style="padding: 8px 16px; font-size: 14px;" onclick="exportResponsesForEmployee('${username}')">${exportBtnText}</button>
            </div>
            <div class="responses-container">${responsesHtml}</div>
        `;
        responsesList.appendChild(employeeGroupDiv);
    }
    
    if (!hasVisibleResponses) {
        responsesList.innerHTML = '<div class="response-card"><p>No responses match the selected filter.</p></div>';
    }
}


function loadEmployeeQuestions(filter = 'all') {
    const employeeQuestionsDiv = document.getElementById('employeeQuestions');
    employeeQuestionsDiv.innerHTML = '';
    const now = new Date();

    let myQuestions = questions.filter(q => {
        const isReleased = now >= new Date(q.releaseTime);
        const notExpired = !q.expiryTime || now <= new Date(q.expiryTime);
        const isTargeted = q.targetEmployees.includes('all') || q.targetEmployees.includes(currentUser.username);
        return isReleased && notExpired && isTargeted;
    });

    if (filter !== 'all') {
        myQuestions = myQuestions.filter(q => {
            const hasResponse = responses.some(r => r.questionId === q._id && r.employeeUsername === currentUser.username);
            return (filter === 'answered') ? hasResponse : !hasResponse;
        });
    }

    if (myQuestions.length === 0) {
        let messageKey = 'no_questions_available';
        if (filter === 'answered') messageKey = 'no_answered_questions';
        if (filter === 'unanswered') messageKey = 'no_unanswered_questions';
        
        employeeQuestionsDiv.innerHTML = `<div class="question-card"><p data-translate="${messageKey}">No questions match the current filter.</p></div>`;
        setLanguage(localStorage.getItem('language') || 'en');
        return;
    }
    
    myQuestions.forEach(q => {
        const existingResponse = responses.find(r => r.questionId === q._id && r.employeeUsername === currentUser.username);
        const card = document.createElement('div');
        card.className = 'question-card';
        if (existingResponse) {
            card.innerHTML = `
                <h3>${q.title}</h3>
                ${getQuestionDetailsHtml(q)}
                <div class="response-section">
                    <p><strong data-translate="your_response">Your Response:</strong> <span class="response-answer ${existingResponse.answer.toLowerCase()}">${existingResponse.answer}</span></p>
                    ${existingResponse.attachmentUrl ? `<p><strong data-translate="attachment_label">Attachment:</strong> <a href="${existingResponse.attachmentUrl}" class="attachment-link" target="_blank" download data-translate="view_attachment_link">View Attachment</a></p>` : ''}
                    <p style="color: var(--text-secondary); margin-top: 10px;"><span data-translate="submitted_on">Submitted on:</span> ${new Date(existingResponse.submittedAt).toLocaleString()}</p>
                </div>`;
        } else {
            card.innerHTML = `
                <h3>${q.title}</h3>
                ${getQuestionDetailsHtml(q)}
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
                </form>`;
        }
        employeeQuestionsDiv.appendChild(card);
    });
    setLanguage(localStorage.getItem('language') || 'en');
}


// =================================================================
// --- Actions (Functions that send data TO the server) ---
// =================================================================

document.getElementById('questionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const questionData = {
        title: document.getElementById('questionTitle').value,
        standard: document.getElementById('standard').value,
        indicatorNumber: document.getElementById('indicatorNumber').value,
        practiceNumber: document.getElementById('practiceNumber').value,
        questionNumber: document.getElementById('questionNumber').value,
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

// THIS FUNCTION IS NOW FIXED
async function submitResponse(event, questionId) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const answer = document.querySelector(`input[name="answer_${questionId}"]:checked`).value;
        const fileInput = document.getElementById(`attachment_${questionId}`);
        const urlInput = document.getElementById(`url_${questionId}`);
        
        let attachmentUrl = urlInput.value.trim();

        if (fileInput.files.length > 0) {
            submitButton.textContent = 'Uploading file...';
            const file = fileInput.files[0];
            const config = await getCloudinaryConfig();
            if (!config || !config.cloudName || !config.uploadPreset) {
                throw new Error("Cloudinary configuration is missing. Cannot upload file.");
            }
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', config.uploadPreset);
            let uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`;
            if (!file.type.startsWith('image/')) {
                formData.append('resource_type', 'raw');
            }
            const cloudinaryRes = await fetch(uploadUrl, { method: 'POST', body: formData });
            if (!cloudinaryRes.ok) {
                const errorText = await cloudinaryRes.text();
                throw new Error(`File upload failed: ${cloudinaryRes.status}`);
            }
            const cloudinaryData = await cloudinaryRes.json();
            let finalUrl = cloudinaryData.secure_url;
            // THIS IS THE FIX: Add fl_attachment if it's not an image, especially for PDFs
            if (!file.type.startsWith('image/')) {
                 finalUrl = finalUrl.replace('/upload/', '/upload/fl_attachment/');
            }
            attachmentUrl = finalUrl;
        }

        submitButton.textContent = 'Saving response...';

        const responseData = {
            questionId: questionId,
            employeeUsername: currentUser.username,
            employeeFullName: currentUser.fullName,
            answer: answer,
            attachmentUrl: attachmentUrl,
        };
        
        const res = await fetch(`${API_URL}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responseData)
        });

        if (!res.ok) throw new Error('Failed to submit response to our server.');
        
        alert('Response submitted successfully!');
        await fetchAllData();
        filterEmployeeQuestions();

    } catch (error) {
        console.error('Upload error:', error);
        alert(`Error: ${error.message}`);
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
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

async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to permanently delete this employee and all of their responses? This cannot be undone.')) {
        return;
    }
    try {
        const res = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
        if (res.status !== 204) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to delete employee.');
        }
        alert('Employee deleted successfully.');
        await fetchAllData();
        renderAdminDashboard();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function editEmployee(id, currentDepartment) {
    const newDepartment = prompt('Enter the new department for this employee:', currentDepartment);
    if (newDepartment === null || newDepartment.trim() === '') {
        return;
    }
    const updates = { department: newDepartment };
    try {
        const res = await fetch(`${API_URL}/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update employee.');
        }
        alert('Employee updated successfully!');
        await fetchAllData();
        renderAdminDashboard();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

function reassignQuestion(questionId) {
    const questionToReassign = questions.find(q => q._id === questionId);
    if (!questionToReassign) {
        alert('Error: Question not found.');
        return;
    }
    showMainTab('governance');
    showSubTab('create');
    document.getElementById('questionTitle').value = questionToReassign.title;
    document.getElementById('standard').value = questionToReassign.standard || '';
    document.getElementById('indicatorNumber').value = questionToReassign.indicatorNumber || '';
    document.getElementById('practiceNumber').value = questionToReassign.practiceNumber || '';
    document.getElementById('questionNumber').value = questionToReassign.questionNumber || '';
    document.getElementById('releaseTime').value = '';
    document.getElementById('expiryTime').value = '';
    const targetSelect = document.getElementById('targetEmployees');
    Array.from(targetSelect.options).forEach(option => {
        option.selected = questionToReassign.targetEmployees.includes(option.value);
    });
    window.scrollTo(0, 0);
    document.getElementById('questionTitle').focus();
    alert('Question data has been pre-filled. Please set a new release and expiry date to re-assign.');
}


// =================================================================
// --- Helper & Utility Functions ---
// =================================================================

function filterQuestions() {
    const filterValue = document.getElementById('questionFilterStandard').value;
    loadQuestions(filterValue);
}

function filterResponses() {
    const filterValue = document.getElementById('responseFilterStandard').value;
    loadResponses(filterValue);
}

function filterEmployeeQuestions() {
    const filterValue = document.querySelector('input[name="employeeQuestionFilter"]:checked').value;
    loadEmployeeQuestions(filterValue);
}

function showRegister() { document.getElementById('loginScreen').classList.add('hidden'); document.getElementById('registerScreen').classList.remove('hidden'); }
function showLogin() { document.getElementById('registerScreen').classList.add('hidden'); document.getElementById('loginScreen').classList.remove('hidden'); }

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    questions = [];
    responses = [];
    employees = [];
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('employeeDashboard').classList.add('hidden');
    document.getElementById('loginForm').reset();
}

function showMainTab(tabName) {
    document.querySelectorAll('.main-tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`${tabName}MainTab`).classList.remove('hidden');
    document.querySelector(`.main-tab[onclick="showMainTab('${tabName}')"]`).classList.add('active');
}

function showSubTab(tabName) {
    document.querySelectorAll('.sub-tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`${tabName}SubTab`).classList.remove('hidden');
    document.querySelector(`.sub-tab[onclick="showSubTab('${tabName}')"]`).classList.add('active');
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
    setLanguage(localStorage.getItem('language') || 'en');
}

function showEmployeeProfile() {
    const profileDiv = document.getElementById('employeeProfile');
    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `<div class="employee-info"><p><strong data-translate="profile_username">Username:</strong> ${currentUser.username}</p><p><strong data-translate="profile_fullname">Full Name:</strong> ${currentUser.fullName}</p><p><strong data-translate="profile_email">Email:</strong> ${currentUser.email}</p><p><strong data-translate="profile_phone">Phone:</strong> ${currentUser.phone}</p><p><strong data-translate="profile_department">Department:</strong> ${currentUser.department || 'Not specified'}</p><p><strong data-translate="profile_since">Member Since:</strong> ${new Date(currentUser.registeredAt).toLocaleDateString()}</p></div>`;
    profileDiv.classList.toggle('hidden');
    setLanguage(localStorage.getItem('language') || 'en');
}

function editProfile() {
    const newEmail = prompt('Enter new email:', currentUser.email);
    if (newEmail) {
        currentUser.email = newEmail;
        const empIndex = employees.findIndex(e => e._id === currentUser._id);
        if (empIndex !== -1) {
            employees[empIndex].email = newEmail;
        }
        alert('Profile updated locally! (Server update not implemented)');
        showEmployeeProfile();
    }
}

function exportQuestionsToExcel() {
    const data = questions.map(q => ({
        'Question': q.title, 'Release Date': new Date(q.releaseTime).toLocaleString(), 'Expiry Date': q.expiryTime ? new Date(q.expiryTime).toLocaleString() : 'No expiry', 'Target': q.targetEmployees.join(', '), 'Status': 'N/A', 'Responses': responses.filter(r => r.questionId === q._id).length, 'Created By': q.createdBy, 'Created At': new Date(q.createdAt).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "questions_export.xlsx");
}

function exportAllResponsesToExcel() {
    const data = [];
    responses.forEach(r => {
        const question = questions.find(q => q._id === r.questionId);
        const employee = employees.find(e => e.username === r.employeeUsername);
        data.push({
            'Question': question ? question.title : 'N/A', 'Employee Name': r.employeeFullName || r.employeeUsername, 'Employee Email': employee ? employee.email : 'N/A', 'Department': employee ? employee.department : 'N/A', 'Answer': r.answer, 'Has Attachment': r.attachmentUrl ? 'Yes' : 'No', 'Submitted At': new Date(r.submittedAt).toLocaleString()
        });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    XLSX.writeFile(wb, "responses_export.xlsx");
}

function exportResponsesForEmployee(username) {
    const employeeResponses = responses.filter(r => r.employeeUsername === username);
    const employeeData = employees.find(e => e.username === username);
    if (!employeeData || employeeResponses.length === 0) {
        alert('This employee has no responses to export.');
        return;
    }
    const data = employeeResponses.map(r => {
        const question = questions.find(q => q._id === r.questionId);
        return {
            'Question Title': question ? question.title : 'N/A',
            'Answer': r.answer,
            'Attachment URL': r.attachmentUrl || 'No',
            'Submitted At': new Date(r.submittedAt).toLocaleString()
        };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    const safeFilename = (employeeData.fullName.replace(/\s/g, '_') || username) + '.xlsx';
    XLSX.writeFile(wb, `responses_export_${safeFilename}`);
}

function exportEmployeesToExcel() {
    const data = employees.map(emp => ({
        'Full Name': emp.fullName, 'Username': emp.username, 'Email': emp.email, 'Phone': emp.phone, 'Department': emp.department || 'Not specified', 'Total Responses': responses.filter(r => r.employeeUsername === emp.username).length, 'Registered Date': new Date(emp.registeredAt).toLocaleDateString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employees_export.xlsx");
}