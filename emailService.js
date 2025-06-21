const sgMail = require('@sendgrid/mail');

// Set the API key from your environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const fromEmail = process.env.SENDER_EMAIL;

/**
 * Sends a "Welcome" email to a newly registered employee.
 * @param {string} employeeEmail - The recipient's email address.
 * @param {string} employeeName - The recipient's full name.
 */
async function sendWelcomeEmail(employeeEmail, employeeName) {
    if (!process.env.SENDGRID_API_KEY || !fromEmail) {
        console.log('Email sending is disabled. Missing API Key or Sender Email.');
        return;
    }
    const msg = {
        to: employeeEmail,
        from: fromEmail,
        subject: 'مرحباً بك في نظام استبيان الموظفين',
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right;">
                <h1>أهلاً بك، ${employeeName}!</h1>
                <p>تم تسجيلك بنجاح في نظام استبيان الموظفين.</p>
                <p>يمكنك الآن تسجيل الدخول والبدء في الإجابة على الأسئلة المخصصة لك.</p>
                <p>شكراً لك.</p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`Welcome email sent to ${employeeEmail}`);
    } catch (error) {
        console.error('Error sending welcome email:', error.response?.body || error);
    }
}

/**
 * Sends a "New Question" notification to an employee.
 * @param {string} employeeEmail - The recipient's email address.
 * @param {string} questionTitle - The title of the new question.
 * @param {Date} expiryDate - The expiry date of the question, if any.
 */
async function sendNewQuestionEmail(employeeEmail, questionTitle, expiryDate) {
     if (!process.env.SENDGRID_API_KEY || !fromEmail) return;

    let expiryText = expiryDate 
        ? `<p>يرجى ملاحظة أن آخر موعد للإجابة هو: <strong>${new Date(expiryDate).toLocaleString('ar-SA')}</strong></p>` 
        : '';

    const msg = {
        to: employeeEmail,
        from: fromEmail,
        subject: `سؤال جديد متاح لك: ${questionTitle}`,
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right;">
                <h1>لديك سؤال جديد!</h1>
                <p>تم تعيين سؤال جديد لك في نظام الاستبيان:</p>
                <h2>${questionTitle}</h2>
                <p>يرجى تسجيل الدخول إلى النظام للإجابة عليه.</p>
                ${expiryText}
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`New question notification sent to ${employeeEmail}`);
    } catch (error) {
        console.error('Error sending new question email:', error.response?.body || error);
    }
}

/**
 * Sends a "Reminder" email to an employee.
 * @param {string} employeeEmail - The recipient's email address.
 * @param {string} questionTitle - The title of the question.
 */
async function sendReminderEmail(employeeEmail, questionTitle) {
    if (!process.env.SENDGRID_API_KEY || !fromEmail) return;
    const msg = {
        to: employeeEmail,
        from: fromEmail,
        subject: `تذكير: يتبقى 24 ساعة للإجابة على سؤال "${questionTitle}"`,
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right;">
                <h1>تذكير ودي!</h1>
                <p>هذا تذكير بأنه يتبقى حوالي 24 ساعة للإجابة على السؤال التالي:</p>
                <h2>${questionTitle}</h2>
                <p>نرجو منك تسجيل الدخول وإكمال الإجابة قبل انتهاء الوقت.</p>
            </div>
        `,
    };
    try {
        await sgMail.send(msg);
        console.log(`Reminder email sent to ${employeeEmail}`);
    } catch (error) {
        console.error('Error sending reminder email:', error.response?.body || error);
    }
}

/**
 * Sends a "Deadline Passed" email to an employee.
 * @param {string} employeeEmail - The recipient's email address.
 * @param {string} questionTitle - The title of the question.
 */
async function sendDeadlinePassedEmail(employeeEmail, questionTitle) {
    if (!process.env.SENDGRID_API_KEY || !fromEmail) return;
     const msg = {
        to: employeeEmail,
        from: fromEmail,
        subject: `تنويه: انتهى الموعد النهائي لسؤال "${questionTitle}"`,
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right;">
                <h1>انتهى الموعد النهائي</h1>
                <p>هذا تنويه بأن الموعد النهائي للإجابة على السؤال التالي قد انتهى:</p>
                <h2>${questionTitle}</h2>
                <p>لم يعد بإمكانك تقديم إجابة لهذا السؤال.</p>
            </div>
        `,
    };
    try {
        await sgMail.send(msg);
        console.log(`Deadline passed email sent to ${employeeEmail}`);
    } catch (error) {
        console.error('Error sending deadline passed email:', error.response?.body || error);
    }
}


// Export the functions to be used in server.js
// THIS IS THE LINE THAT WAS MISSING/INCOMPLETE BEFORE
module.exports = {
    sendWelcomeEmail,
    sendNewQuestionEmail,
    sendReminderEmail,
    sendDeadlinePassedEmail
};