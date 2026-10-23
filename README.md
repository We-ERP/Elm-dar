# المدار Elmadar — الموقع + لوحة التحكم

## الملفات
- index.html — الموقع
- dashboard.html — لوحة التحكم (ادخل من /dashboard.html)
- config.js — رابط الـ API (حطه هنا)
- api.js — ربط الموقع بالشيتات (الكورسات، المحاضرين، الفيديوهات، الحجوزات)
- app.js — منطق التنقل والصفحات
- style.css — التنسيقات
- logo.png — الشعار
- backend/Code.gs — كود Google Apps Script (بيتحط في Apps Script، مش على الموقع)

## خطوات التشغيل (مرة واحدة)
1. اعمل Google Sheet جديدة اسمها "EL MADAR DB". انسخ الـ ID من الرابط (الجزء بين /d/ و /edit).
2. من الشيت: Extensions → Apps Script. امسح الكود القديم والصق محتوى backend/Code.gs.
3. في أول سطر حط SHEET_ID = الـ ID اللي نسختـه.
4. شغّل الدالة setup() مرة واحدة واقبل الصلاحيات (Sheets + Drive).
   - ده بيعمل كل الشيتات (Instructors, Courses, Videos, Bookings, Settings) تلقائياً.
   - كلمة السر الافتراضية: ChangeMe123 — غيرها من Project Settings → Script properties → ADMIN_PASSWORD.
5. Deploy → New deployment → Type: Web app → Execute as: Me → Who has access: Anyone → Deploy.
   - لو عدلت الكود بعدين: Deploy → Manage deployments → Edit → New version.
6. انسخ رابط الـ /exec وحطه في config.js:
   window.EL_MADAR_API = 'https://script.google.com/macros/s/.../exec';
7. ارفع كل الملفات (ماعدا backend/ لو مش عايزه) على GitHub Pages.
8. ادخل https://USERNAME.github.io/REPO/dashboard.html بكلمة السر.

## ملاحظات
- كل تعديل من لوحة التحكم بيتسجل في الشيت فوراً، وأي حجز/رسالة من الموقع بيظهر في تبويب "الحجوزات والرسائل" وفي شيت Bookings.
- رفع الصور لحد 5MB، والفيديوهات لحد 25MB. للفيديوهات الكبيرة الأفضل تحط رابط YouTube.
- لو الـ API مش متظبط، الموقع بيفضل يعرض المحتوى الثابت.
- كلمة السر بتتحفظ في الـ browser session بس (بتتمسح لما تقفل المتصفح أو تضغط خروج).
