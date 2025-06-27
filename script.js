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
        // NEW TRANSLATIONS FOR BUTTONS
        btn_reassign: "Re-assign", btn_quick_reassign: "Quick Re-assign", btn_delete: "Delete", btn_reassign_selected: "Re-assign Selected", btn_delete_selected: "Delete Selected"
    },
    ar: {
        app_title: "منصة حوكِم", username_placeholder: "اسم المستخدم", password_placeholder: "كلمة المرور", select_role: "اختر الدور", role_admin: "مدير / مسؤول", role_employee: "موظف", login_btn: "تسجيل الدخول", register_link: "تسجيل كموظف جديد", demo_note: "تجريبي: استخدم أي اسم مستخدم/كلمة مرور", employee_registration_title: "تسجيل الموظف", full_name_placeholder: "الاسم الكامل", email_placeholder: "البريد الإلكتروني", phone_placeholder: "رقم الهاتف", department_placeholder: "القسم", register_btn: "تسجيل", back_to_login_link: "العودة إلى تسجيل الدخول", admin_dashboard_title: "لوحة تحكم المدير", logout_btn: "تسجيل الخروج",
        stat_total_questions: "مجموع الأسئلة", stat_total_responses: "مجموع الردود", stat_total_employees: "الموظفون المسجلون", stat_pending_responses: "الردود المعلقة",
        tab_create_questions: "إنشاء أسئلة", tab_manage_questions: "إدارة الأسئلة", tab_view_responses: "عرض الردود", tab_manage_employees: "إدارة الموظفين", tab_reminders: "التذكيرات", create_new_question_title: "إنشاء سؤال جديد", label_question_title: "عنوان السؤال:", question_title_placeholder: "أدخل سؤالك", label_release_time: "تاريخ ووقت النشر:", label_expiry_time: "تاريخ ووقت الانتهاء (اختياري):", label_target_employees: "الموظفون المستهدفون:", option_all_employees: "كل الموظفين", notification_settings_title: "إعدادات الإشعارات", checkbox_email_notification: "إرسال إشعار بالبريد الإلكتروني عند نشر السؤال", checkbox_expiry_reminder: "إرسال تذكير قبل 24 ساعة من الانتهاء", create_question_btn: "إنشاء السؤال", manage_questions_title: "إدارة الأسئلة", export_excel_btn: "تصدير إلى Excel", employee_responses_title: "ردود الموظفين", export_all_responses_btn: "تصدير كل الردود إلى Excel", registered_employees_title: "الموظفون المسجلون", reminder_settings_title: "إعدادات التذكير", reminder_settings_desc: "تكوين تذكيرات تلقائية للموظفين", checkbox_enable_reminders: "تمكين التذكيرات التلقائية لجميع الأسئلة", label_reminder_schedule: "جدول التذكير:", option_24_hours: "24 ساعة قبل الانتهاء", option_48_hours: "48 ساعة قبل الانتهاء", option_72_hours: "72 ساعة قبل الانتهاء", save_settings_btn: "حفظ الإعدادات", employee_dashboard_title: "لوحة تحكم الموظف", my_profile_btn: "ملفي الشخصي", edit_profile_btn: "تعديل الملف الشخصي", your_questions_title: "أسئلتك", no_questions_available: "لا توجد أسئلة متاحة لك حاليًا.", your_response: "إجابتك:", attachment_label: "المرفق:", view_attachment_link: "عرض المرفق", submitted_on: "تم الإرسال في:", yes_option: "نعم", no_option: "لا", attachment_label_optional: "مرفق (اختياري):", paste_url_placeholder: "أو الصق رابطًا هنا", submit_response_btn: "إرسال الإجابة", profile_username: "اسم المستخدم:", profile_fullname: "الاسم الكامل:", profile_email: "البريد الإلكتروني:", profile_phone: "الهاتف:", profile_department: "القسم:", profile_since: "عضو منذ:",
        filter_all: "الكل", filter_unanswered: "لم تتم الإجابة عليها", filter_answered: "تمت الإجابة عليها",
        no_answered_questions: "لم تقم بالإجابة على أي أسئلة بعد.", no_unanswered_questions: "لقد أجبت على جميع الأسئلة المتاحة. عمل رائع!",
        // NEW ARABIC TRANSLATIONS FOR BUTTONS
        btn_reassign: "إعادة تكليف", btn_quick_reassign: "إعادة تكليف سريع", btn_delete: "حذف", btn_reassign_selected: "إعادة تكليف المحدد", btn_delete_selected: "حذف المحدد"
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
    
    // Update dynamically created buttons
    updateButtonTranslations(lang);
}

// Function to update button translations
function updateButtonTranslations(lang) {
    const currentLang = lang || localStorage.getItem('language') || 'en';
    
    // Update reassign buttons
    document.querySelectorAll('button[onclick*="reassignQuestionWithCalendar"]').forEach(btn => {
        btn.innerHTML = `📅 ${translations[currentLang].btn_reassign}`;
    });
    
    // Update quick reassign buttons
    document.querySelectorAll('button[onclick*="quickReassignQuestion"]').forEach(btn => {
        btn.innerHTML = `⚡ ${translations[currentLang].btn_quick_reassign}`;
    });
    
    // Update delete buttons
    document.querySelectorAll('button[onclick*="deleteQuestion"]').forEach(btn => {
        btn.innerHTML = `🗑️ ${translations[currentLang].btn_delete}`;
    });
    
    // Update bulk action buttons
    document.querySelectorAll('button[onclick*="reassignSelectedQuestions"]').forEach(btn => {
        btn.textContent = translations[currentLang].btn_reassign_selected;
    });
    
    document.querySelectorAll('button[onclick*="deleteSelectedQuestions"]').forEach(btn => {
        btn.textContent = translations[currentLang].btn_delete_selected;
    });
}

// =================================================================
// --- PERMANENT MODAL FIX - Prevent Old Modal from Showing ---
// =================================================================

function forceHideModal() {
    const modal = document.getElementById('reassignModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none !important';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
}

// Override old modal-related functions to prevent old modal from showing
function reassignSelectedModal() {
    console.log('Old reassign modal is disabled - using new calendar modal');
    return false;
}

function closeReassignModal() {
    forceHideModal();
    return false;
}

function handleOverlayClick() {
    return false;
}

function handleReassignSubmit(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    return false;
}
// =================================================================
// --- CALENDAR MODAL FUNCTIONALITY ---
// =================================================================

// 1. CREATE CALENDAR MODAL
function createCalendarModal() {
    const modalHtml = `
        <div id="calendarModal" class="modal-overlay" style="display: none;">
            <div class="calendar-modal-content">
                <div class="calendar-header">
                    <h3>📅 Re-assign Question - Select Dates</h3>
                    <button class="close-calendar-btn" onclick="closeCalendarModal()">&times;</button>
                </div>
                
                <div class="calendar-body">
                    <div class="question-info">
                        <div id="calendarQuestionInfo"></div>
                    </div>
                    
                    <div class="date-selection-container">
                        <!-- Release Date Section -->
                        <div class="date-section">
                            <h4>🚀 Release Date & Time</h4>
                            <div class="date-picker-container">
                                <input type="date" id="calendarReleaseDate" class="date-input">
                                <input type="time" id="calendarReleaseTime" class="time-input" value="09:00">
                            </div>
                            <div class="selected-datetime" id="selectedReleaseDateTime"></div>
                        </div>
                        
                        <!-- Expiry Date Section -->
                        <div class="date-section">
                            <h4>⏰ Expiry Date & Time (Optional)</h4>
                            <div class="date-picker-container">
                                <input type="date" id="calendarExpiryDate" class="date-input">
                                <input type="time" id="calendarExpiryTime" class="time-input" value="23:59">
                                <button type="button" class="clear-date-btn" onclick="clearExpiryDate()">Clear</button>
                            </div>
                            <div class="selected-datetime" id="selectedExpiryDateTime"></div>
                        </div>
                        
                        <!-- Employee Selection -->
                        <div class="employee-section">
                            <h4>👥 Target Employees</h4>
                            <div class="employee-selection">
                                <select id="calendarTargetEmployees" multiple class="employee-select">
                                    <option value="all">🌟 All Employees</option>
                                </select>
                                <div class="employee-selection-help">
                                    Hold Ctrl/Cmd to select multiple employees
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="calendar-footer">
                    <button class="cancel-btn" onclick="closeCalendarModal()">Cancel</button>
                    <button class="confirm-btn" onclick="confirmCalendarReassign()">✅ Confirm Re-assign</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to page if not exists
    if (!document.getElementById('calendarModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        addCalendarStyles();
        setupCalendarEventListeners();
    }
}

// 2. ADD CALENDAR STYLES
function addCalendarStyles() {
    const calendarStyles = `
        <style id="calendarModalStyles">
            .calendar-modal-content {
                background: var(--bg-primary);
                border-radius: 15px;
                padding: 0;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                direction: ltr;
                text-align: left;
            }
            
            .calendar-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px 15px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .calendar-header h3 {
                margin: 0;
                color: white;
            }
            
            .close-calendar-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                font-size: 24px;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-calendar-btn:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .calendar-body {
                padding: 25px;
            }
            
            .question-info {
                background: var(--bg-secondary);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 25px;
                border-left: 4px solid #667eea;
            }
            
            .date-section {
                background: var(--bg-secondary);
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                border: 1px solid var(--border-color);
            }
            
            .date-section h4 {
                margin: 0 0 15px 0;
                color: var(--text-primary);
                font-size: 16px;
            }
            
            .date-picker-container {
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .date-input, .time-input {
                flex: 1;
                min-width: 140px;
                padding: 12px;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-size: 14px;
                background: var(--bg-primary);
                color: var(--text-primary);
            }
            
            .date-input:focus, .time-input:focus {
                border-color: #667eea;
                outline: none;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .clear-date-btn {
                background: #f56565;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .clear-date-btn:hover {
                background: #e53e3e;
            }
            
            .selected-datetime {
                margin-top: 10px;
                padding: 8px 12px;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 6px;
                font-size: 13px;
                color: var(--text-secondary);
                min-height: 20px;
            }
            
            .employee-section {
                background: var(--bg-secondary);
                padding: 20px;
                border-radius: 10px;
                border: 1px solid var(--border-color);
            }
            
            .employee-section h4 {
                margin: 0 0 15px 0;
                color: var(--text-primary);
            }
            
            .employee-select {
                width: 100%;
                height: 120px;
                padding: 10px;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                background: var(--bg-primary);
                color: var(--text-primary);
                font-size: 14px;
            }
            
            .employee-select:focus {
                border-color: #667eea;
                outline: none;
            }
            
            .employee-selection-help {
                margin-top: 8px;
                font-size: 12px;
                color: var(--text-secondary);
                font-style: italic;
            }
            
            .calendar-footer {
                padding: 20px 25px;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                gap: 15px;
                background: var(--bg-secondary);
                border-radius: 0 0 15px 15px;
            }
            
            .cancel-btn, .confirm-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .cancel-btn {
                background: #a0aec0;
                color: white;
            }
            
            .cancel-btn:hover {
                background: #718096;
            }
            
            .confirm-btn {
                background: #48bb78;
                color: white;
            }
            
            .confirm-btn:hover {
                background: #38a169;
                transform: translateY(-1px);
            }
            
            @media (max-width: 768px) {
                .calendar-modal-content {
                    width: 95%;
                    max-height: 95vh;
                }
                
                .date-picker-container {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .date-input, .time-input {
                    min-width: auto;
                }
                
                .calendar-footer {
                    flex-direction: column;
                }
                
                .cancel-btn, .confirm-btn {
                    width: 100%;
                }
            }
        </style>
    `;
    
    if (!document.getElementById('calendarModalStyles')) {
        document.head.insertAdjacentHTML('beforeend', calendarStyles);
    }
}

// 3. SETUP EVENT LISTENERS
function setupCalendarEventListeners() {
    // Update display when dates change
    document.getElementById('calendarReleaseDate').addEventListener('change', updateReleaseDateDisplay);
    document.getElementById('calendarReleaseTime').addEventListener('change', updateReleaseDateDisplay);
    document.getElementById('calendarExpiryDate').addEventListener('change', updateExpiryDateDisplay);
    document.getElementById('calendarExpiryTime').addEventListener('change', updateExpiryDateDisplay);
    
    // Close modal on outside click
    document.getElementById('calendarModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCalendarModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !document.getElementById('calendarModal').style.display === 'none') {
            closeCalendarModal();
        }
    });
}

// 4. UPDATE DATE DISPLAYS
function updateReleaseDateDisplay() {
    const dateInput = document.getElementById('calendarReleaseDate');
    const timeInput = document.getElementById('calendarReleaseTime');
    const display = document.getElementById('selectedReleaseDateTime');
    
    if (dateInput.value && timeInput.value) {
        const dateTime = new Date(`${dateInput.value}T${timeInput.value}`);
        display.innerHTML = `📅 <strong>Selected:</strong> ${dateTime.toLocaleString()}`;
        display.style.color = '#48bb78';
    } else {
        display.innerHTML = '⚠️ Please select release date and time';
        display.style.color = '#f56565';
    }
}

function updateExpiryDateDisplay() {
    const dateInput = document.getElementById('calendarExpiryDate');
    const timeInput = document.getElementById('calendarExpiryTime');
    const display = document.getElementById('selectedExpiryDateTime');
    
    if (dateInput.value && timeInput.value) {
        const dateTime = new Date(`${dateInput.value}T${timeInput.value}`);
        display.innerHTML = `📅 <strong>Selected:</strong> ${dateTime.toLocaleString()}`;
        display.style.color = '#48bb78';
    } else {
        display.innerHTML = '💡 No expiry date (question will remain active indefinitely)';
        display.style.color = 'var(--text-secondary)';
    }
}

// 5. CLEAR EXPIRY DATE
function clearExpiryDate() {
    document.getElementById('calendarExpiryDate').value = '';
    document.getElementById('calendarExpiryTime').value = '23:59';
    updateExpiryDateDisplay();
}

// 6. CLOSE CALENDAR MODAL
function closeCalendarModal() {
    const modal = document.getElementById('calendarModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset modal state
        modal.dataset.questionId = '';
        modal.dataset.bulkQuestionIds = '';
        modal.dataset.isBulk = 'false';
        
        // Reset confirm button text
        const confirmBtn = document.querySelector('.confirm-btn');
        if (confirmBtn) {
            confirmBtn.textContent = '✅ Confirm Re-assign';
            confirmBtn.disabled = false;
        }
        
        // Reset header text
        const headerTitle = document.querySelector('.calendar-header h3');
        if (headerTitle) {
            headerTitle.textContent = '📅 Re-assign Question - Select Dates';
        }
    }
}
// =================================================================
// --- Page Load & Session Management ---
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);

    // PERMANENT MODAL FIX - Force hide old modal immediately on page load
    forceHideModal();
    
    // Add CSS to force hide the old modal
    const style = document.createElement('style');
    style.textContent = `
        #reassignModal {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(style);

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
        
        // Get current language for button text
        const currentLang = localStorage.getItem('language') || 'en';
        
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <div class="question-card-header">
                <label class="checkbox-label" style="margin-bottom: 0; padding-right: 10px;">
                    <input type="checkbox" class="question-select-checkbox" value="${q._id}" onchange="updateBulkActionState()">
                </label>
                <h3 style="flex-grow: 1;">${q.title}</h3>
                <span class="status-badge ${statusClass}" style="flex-shrink: 0;">${status}</span>
            </div>
            ${getQuestionDetailsHtml(q)}
            <p><strong>Release:</strong> ${new Date(q.releaseTime).toLocaleString()}</p>
            ${q.expiryTime ? `<p><strong>Expiry:</strong> ${new Date(q.expiryTime).toLocaleString()}</p>` : ''}
            <p><strong>Target:</strong> ${q.targetEmployees.join(', ')}</p>
            <p><strong>Responses:</strong> ${responseCount} / ${targetCount}</p>
            <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="secondary-btn" onclick="reassignQuestionWithCalendar('${q._id}')" title="Re-assign with calendar date picker">
                    📅 ${translations[currentLang].btn_reassign}
                </button>
                <button class="info-btn" onclick="quickReassignQuestion('${q._id}')" title="Quick re-assign with current settings">
                    ⚡ ${translations[currentLang].btn_quick_reassign}
                </button>
                <button class="danger-btn" onclick="deleteQuestion('${q._id}')">
                    🗑️ ${translations[currentLang].btn_delete}
                </button>
            </div>
        `;
        questionsList.appendChild(card);
    });

    updateBulkActionState();
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
                        <input type="file" id="attachment_${q._id}" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx">
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
// --- CALENDAR RE-ASSIGN FUNCTIONS ---
// =================================================================

// CALENDAR-BASED RE-ASSIGN FUNCTION FOR INDIVIDUAL QUESTIONS
async function reassignQuestionWithCalendar(questionId) {
    const question = questions.find(q => q._id === questionId);
    if (!question) {
        alert('Question not found.');
        return;
    }

    // Create modal if it doesn't exist
    createCalendarModal();
    
    // Populate question info
    const questionInfo = document.getElementById('calendarQuestionInfo');
    questionInfo.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>📋 Question:</strong> "${question.title}"
        </div>
        <div style="margin-bottom: 10px;">
            <strong>📊 Standard:</strong> ${question.standard || 'N/A'}
        </div>
        <div style="margin-bottom: 10px;">
            <strong>🕐 Current Release:</strong> ${new Date(question.releaseTime).toLocaleString()}
        </div>
        <div style="margin-bottom: 10px;">
            <strong>⏰ Current Expiry:</strong> ${question.expiryTime ? new Date(question.expiryTime).toLocaleString() : 'No expiry'}
        </div>
        <div>
            <strong>👥 Current Targets:</strong> ${question.targetEmployees.join(', ')}
        </div>
    `;
    
    // Set default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 8);
    
    document.getElementById('calendarReleaseDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('calendarReleaseTime').value = '09:00';
    document.getElementById('calendarExpiryDate').value = weekLater.toISOString().split('T')[0];
    document.getElementById('calendarExpiryTime').value = '23:59';
    
    // Populate employee options
    const employeeSelect = document.getElementById('calendarTargetEmployees');
    employeeSelect.innerHTML = '<option value="all">🌟 All Employees</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.username;
        option.textContent = `${emp.fullName} (${emp.department || 'No Dept'})`;
        if (question.targetEmployees.includes(emp.username)) {
            option.selected = true;
        }
        employeeSelect.appendChild(option);
    });
    
    // Select "all" if it was selected before
    if (question.targetEmployees.includes('all')) {
        employeeSelect.querySelector('option[value="all"]').selected = true;
    }
    
    // Update displays
    updateReleaseDateDisplay();
    updateExpiryDateDisplay();
    
    // Store question ID for confirmation
    document.getElementById('calendarModal').dataset.questionId = questionId;
    document.getElementById('calendarModal').dataset.isBulk = 'false';
    
    // Show modal
    document.getElementById('calendarModal').style.display = 'flex';
}

// BULK CALENDAR RE-ASSIGN FUNCTION
async function bulkReassignWithCalendar() {
    const selectedCheckboxes = document.querySelectorAll('#questionsList .question-select-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

    if (selectedIds.length === 0) {
        alert('Please select at least one question to re-assign.');
        return;
    }

    // Create modal if it doesn't exist
    createCalendarModal();
    
    // Update header for bulk operation
    document.querySelector('.calendar-header h3').textContent = `📅 Bulk Re-assign ${selectedIds.length} Questions`;
    
    // Show selected questions info
    const questionInfo = document.getElementById('calendarQuestionInfo');
    const selectedQuestions = selectedIds.map(id => {
        const q = questions.find(question => question._id === id);
        return q ? q.title : 'Unknown';
    });
    
    const displayQuestions = selectedQuestions.slice(0, 3);
    const moreCount = selectedQuestions.length - 3;
    
    questionInfo.innerHTML = `
        <div style="margin-bottom: 15px;">
            <strong>📋 Selected Questions (${selectedIds.length}):</strong>
        </div>
        <div style="margin-left: 15px;">
            ${displayQuestions.map(title => `• ${title}`).join('<br>')}
            ${moreCount > 0 ? `<br>• ... and ${moreCount} more questions` : ''}
        </div>
        <div style="margin-top: 15px; padding: 10px; background: rgba(102, 126, 234, 0.1); border-radius: 6px;">
            <strong>⚠️ Note:</strong> All selected questions will get the same new schedule and target employees.
        </div>
    `;
    
    // Set default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 8);
    
    document.getElementById('calendarReleaseDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('calendarReleaseTime').value = '09:00';
    document.getElementById('calendarExpiryDate').value = weekLater.toISOString().split('T')[0];
    document.getElementById('calendarExpiryTime').value = '23:59';
    
    // Populate employee options (default to "all" for bulk)
    const employeeSelect = document.getElementById('calendarTargetEmployees');
    employeeSelect.innerHTML = '<option value="all" selected>🌟 All Employees</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.username;
        option.textContent = `${emp.fullName} (${emp.department || 'No Dept'})`;
        employeeSelect.appendChild(option);
    });
    
    // Update displays
    updateReleaseDateDisplay();
    updateExpiryDateDisplay();
    
    // Store selected IDs for bulk confirmation
    document.getElementById('calendarModal').dataset.bulkQuestionIds = selectedIds.join(',');
    document.getElementById('calendarModal').dataset.isBulk = 'true';
    
    // Update confirm button text
    document.querySelector('.confirm-btn').textContent = `✅ Confirm Bulk Re-assign (${selectedIds.length})`;
    
    // Show modal
    document.getElementById('calendarModal').style.display = 'flex';
}

// GET CALENDAR FORM DATA
function getCalendarFormData() {
    const releaseDate = document.getElementById('calendarReleaseDate').value;
    const releaseTime = document.getElementById('calendarReleaseTime').value;
    const expiryDate = document.getElementById('calendarExpiryDate').value;
    const expiryTime = document.getElementById('calendarExpiryTime').value;
    const selectedEmployees = Array.from(document.getElementById('calendarTargetEmployees').selectedOptions)
        .map(option => option.value);
    
    // Validate
    if (!releaseDate || !releaseTime) {
        alert('Please select release date and time.');
        return { releaseDateTime: null, selectedEmployees: null };
    }
    
    if (selectedEmployees.length === 0) {
        alert('Please select at least one target employee.');
        return { releaseDateTime: null, selectedEmployees: null };
    }
    
    const releaseDateTime = new Date(`${releaseDate}T${releaseTime}`);
    let expiryDateTime = null;
    
    if (expiryDate && expiryTime) {
        expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
        if (expiryDateTime <= releaseDateTime) {
            alert('Expiry date must be after release date.');
            return { releaseDateTime: null, selectedEmployees: null };
        }
    }
    
    return { releaseDateTime, expiryDateTime, selectedEmployees };
}

// CONFIRM CALENDAR RE-ASSIGN (HANDLES BOTH SINGLE AND BULK)
async function confirmCalendarReassign() {
    const modal = document.getElementById('calendarModal');
    const isBulk = modal.dataset.isBulk === 'true';
    
    if (isBulk) {
        await confirmBulkCalendarReassign();
    } else {
        await confirmSingleCalendarReassign();
    }
}

// SINGLE QUESTION CONFIRM
async function confirmSingleCalendarReassign() {
    const questionId = document.getElementById('calendarModal').dataset.questionId;
    const question = questions.find(q => q._id === questionId);
    
    if (!question) {
        alert('Question not found.');
        return;
    }
    
    const { releaseDateTime, expiryDateTime, selectedEmployees } = getCalendarFormData();
    if (!releaseDateTime || !selectedEmployees) return;
    
    const newQuestionData = {
        title: question.title,
        standard: question.standard,
        indicatorNumber: question.indicatorNumber,
        practiceNumber: question.practiceNumber,
        questionNumber: question.questionNumber,
        releaseTime: releaseDateTime,
        expiryTime: expiryDateTime,
        targetEmployees: selectedEmployees,
        createdBy: currentUser.username,
    };
    
    try {
        const response = await fetch(`${API_URL}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newQuestionData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create re-assigned question.');
        }
        
        closeCalendarModal();
        
        alert(`✅ Question re-assigned successfully!\n\n📅 Release: ${releaseDateTime.toLocaleString()}\n⏰ Expiry: ${expiryDateTime ? expiryDateTime.toLocaleString() : 'No expiry'}\n👥 Targets: ${selectedEmployees.join(', ')}`);
        
        await fetchAllData();
        renderAdminDashboard();
    } catch (error) {
        alert(`❌ Error re-assigning question: ${error.message}`);
    }
}

// BULK QUESTIONS CONFIRM
async function confirmBulkCalendarReassign() {
    const selectedIds = document.getElementById('calendarModal').dataset.bulkQuestionIds.split(',');
    
    const { releaseDateTime, expiryDateTime, selectedEmployees } = getCalendarFormData();
    if (!releaseDateTime || !selectedEmployees) return;
    
    // Show progress
    const confirmBtn = document.querySelector('.confirm-btn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    
    let successCount = 0;
    let failureCount = 0;
    
    try {
        for (let i = 0; i < selectedIds.length; i++) {
            const questionId = selectedIds[i];
            const originalQuestion = questions.find(q => q._id === questionId);
            
            if (!originalQuestion) {
                failureCount++;
                continue;
            }
            
            confirmBtn.textContent = `Processing ${i + 1}/${selectedIds.length}...`;
            
            const newQuestionData = {
                title: originalQuestion.title,
                standard: originalQuestion.standard,
                indicatorNumber: originalQuestion.indicatorNumber,
                practiceNumber: originalQuestion.practiceNumber,
                questionNumber: originalQuestion.questionNumber,
                releaseTime: releaseDateTime,
                expiryTime: expiryDateTime,
                targetEmployees: selectedEmployees,
                createdBy: currentUser.username,
            };
            
            try {
                const response = await fetch(`${API_URL}/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newQuestionData)
                });
                
                if (response.ok) {
                    successCount++;
                } else {
                    failureCount++;
                }
            } catch (error) {
                failureCount++;
            }
            
            // Small delay between requests
            if (i < selectedIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        closeCalendarModal();
        
        // Clear selections
        document.querySelectorAll('#questionsList .question-select-checkbox:checked').forEach(cb => {
            cb.checked = false;
        });
        updateBulkActionState();
        
        alert(`✅ Bulk Re-assignment Completed!\n\n📊 Results:\n• Successful: ${successCount}\n• Failed: ${failureCount}\n\n📅 New Schedule:\n• Release: ${releaseDateTime.toLocaleString()}\n• Expiry: ${expiryDateTime ? expiryDateTime.toLocaleString() : 'No expiry'}`);
        
        // Refresh data if any were successful
        if (successCount > 0) {
            await fetchAllData();
            renderAdminDashboard();
        }
        
    } catch (error) {
        alert(`❌ Error during bulk re-assignment: ${error.message}`);
    } finally {
        // Reset button
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

// QUICK RE-ASSIGN FUNCTION (Same date, same employees)
async function quickReassignQuestion(questionId) {
    const question = questions.find(q => q._id === questionId);
    if (!question) {
        alert('Question not found.');
        return;
    }

    if (!confirm(`Quick re-assign "${question.title}" with current settings?\n\nThis will create a new question with:\n- Release: Now\n- Expiry: Same as original\n- Targets: Same as original`)) {
        return;
    }

    const newQuestionData = {
        title: question.title,
        standard: question.standard,
        indicatorNumber: question.indicatorNumber,
        practiceNumber: question.practiceNumber,
        questionNumber: question.questionNumber,
        releaseTime: new Date(), // Now
        expiryTime: question.expiryTime ? new Date(question.expiryTime) : null,
        targetEmployees: question.targetEmployees,
        createdBy: currentUser.username,
    };

    try {
        const response = await fetch(`${API_URL}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newQuestionData)
        });

        if (!response.ok) {
            throw new Error('Failed to quick re-assign question.');
        }

        alert('Question quickly re-assigned successfully!');
        
        await fetchAllData();
        renderAdminDashboard();
    } catch (error) {
        alert(`Error quick re-assigning question: ${error.message}`);
    }
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
            
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json();
                throw new Error(errorData.message || `File upload failed: ${uploadRes.status}`);
            }

            const uploadData = await uploadRes.json();
            attachmentUrl = uploadData.link;
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
        console.error('File submission process error:', error);
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

// IMPROVED MULTIPLE DELETE FUNCTION
async function deleteSelectedQuestions() {
    const selectedCheckboxes = document.querySelectorAll('#questionsList .question-select-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

    if (selectedIds.length === 0) {
        alert('Please select at least one question to delete.');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected question(s) and all their associated responses? This cannot be undone.`)) {
        return;
    }

    // Show progress
    alert(`Starting deletion of ${selectedIds.length} question(s). This may take a moment...`);

    let successCount = 0;
    let failedCount = 0;

    // Process each question
    for (let i = 0; i < selectedIds.length; i++) {
        const questionId = selectedIds[i];
        
        try {
            console.log(`Deleting question ${i + 1} of ${selectedIds.length}...`);
            
            const response = await fetch(`${API_URL}/questions/${questionId}`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 204) {
                successCount++;
                console.log(`✅ Question ${i + 1} deleted successfully`);
            } else {
                failedCount++;
                console.error(`❌ Question ${i + 1} failed: ${response.status}`);
            }
        } catch (error) {
            failedCount++;
            console.error(`❌ Question ${i + 1} error:`, error);
        }

        // Small delay between deletions
        if (i < selectedIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Clear all checkboxes
    selectedCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Update UI
    updateBulkActionState();

    // Show results
    let message = `Deletion completed!\n\nSuccessful: ${successCount}\nFailed: ${failedCount}`;
    alert(message);

    // Refresh data if any deletions were successful
    if (successCount > 0) {
        try {
            await fetchAllData();
            renderAdminDashboard();
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }
}
// =================================================================
// --- Bulk Action Functions ---
// =================================================================

function updateBulkActionState() {
    try {
        const checkboxes = document.querySelectorAll('#questionsList .question-select-checkbox:checked');
        const selectedCount = checkboxes.length;
        const bulkActionsBar = document.getElementById('bulkActionsBar');
        
        if (!bulkActionsBar) return;
        
        if (selectedCount > 0) {
            bulkActionsBar.classList.remove('hidden');
            const selectionCountEl = document.getElementById('selectionCount');
            if (selectionCountEl) {
                selectionCountEl.textContent = `${selectedCount} selected`;
            }
            
            // Update bulk actions buttons
            updateBulkActionButtons(bulkActionsBar, selectedCount);
        } else {
            bulkActionsBar.classList.add('hidden');
        }

        const totalCheckboxes = document.querySelectorAll('#questionsList .question-select-checkbox').length;
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = (totalCheckboxes > 0 && selectedCount === totalCheckboxes);
        }
        
        forceHideModal();
    } catch (error) {
        console.error('Error in updateBulkActionState:', error);
    }
}

function updateBulkActionButtons(bulkActionsBar, selectedCount) {
    // Find or create the buttons container
    let buttonsContainer = bulkActionsBar.querySelector('.bulk-action-buttons');
    if (!buttonsContainer) {
        buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'bulk-action-buttons';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '10px';
        bulkActionsBar.appendChild(buttonsContainer);
    }

    // Clear existing buttons
    buttonsContainer.innerHTML = '';

    // Get current language for button text
    const currentLang = localStorage.getItem('language') || 'en';

    // Add Re-assign button
    const reassignBtn = document.createElement('button');
    reassignBtn.className = 'info-btn';
    reassignBtn.textContent = translations[currentLang].btn_reassign_selected;
    reassignBtn.onclick = bulkReassignWithCalendar;
    reassignBtn.title = `Re-assign ${selectedCount} selected questions`;
    buttonsContainer.appendChild(reassignBtn);

    // Add Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'danger-btn';
    deleteBtn.textContent = translations[currentLang].btn_delete_selected;
    deleteBtn.onclick = deleteSelectedQuestions;
    deleteBtn.title = `Delete ${selectedCount} selected questions`;
    buttonsContainer.appendChild(deleteBtn);
}

function toggleSelectAll(checked) {
    document.querySelectorAll('#questionsList .question-select-checkbox').forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateBulkActionState();
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

function showRegister() { 
    document.getElementById('loginScreen').classList.add('hidden'); 
    document.getElementById('registerScreen').classList.remove('hidden'); 
}

function showLogin() { 
    document.getElementById('registerScreen').classList.add('hidden'); 
    document.getElementById('loginScreen').classList.remove('hidden'); 
}

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
    if(tabName === 'manage'){
        updateBulkActionState();
    }
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
// =================================================================
// --- Export Functions ---
// =================================================================

function exportQuestionsToExcel() {
    const data = questions.map(q => ({
        'Question': q.title, 
        'Release Date': new Date(q.releaseTime).toLocaleString(), 
        'Expiry Date': q.expiryTime ? new Date(q.expiryTime).toLocaleString() : 'No expiry', 
        'Target': q.targetEmployees.join(', '), 
        'Status': 'N/A', 
        'Responses': responses.filter(r => r.questionId === q._id).length, 
        'Created By': q.createdBy, 
        'Created At': new Date(q.createdAt).toLocaleString()
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

// =================================================================
// --- LEGACY REASSIGN FUNCTION (FOR BACKWARDS COMPATIBILITY) ---
// =================================================================

function reassignQuestion(questionId) {
    // Redirect to calendar-based reassign for better UX
    reassignQuestionWithCalendar(questionId);
}
