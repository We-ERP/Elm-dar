/* ==========================================================
   EL MADAR — ربط الواجهة بالـ Backend
   - بيجيب الإعدادات والمحاضرين والكورسات والفيديوهات
   - بيعرض الكورسات والمحاضرين تلقائياً
   - بيبعت الحجوزات والتسجيلات والاستشارات لـ Google Sheets
   لو الـ API مش متظبط، الموقع بيفضل شغال بالمحتوى الثابت
   ========================================================== */
(function () {
  const API = window.EL_MADAR_API;
  const configured = API && API.indexOf('PASTE_') === -1;
  let DATA = null;
  let currentCourseId = null;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const LOCATION_LABELS = { online: 'أونلاين (عن بُعد)', cairo: 'حضور: القاهرة', alex: 'حضور: الإسكندرية', dubai: 'حضور: دبي وجدة' };

  // ---------- Fetch ----------
  async function loadContent() {
    const res = await fetch(API + '?action=content');
    const json = await res.json();
    if (!json.ok) throw new Error('bad content');
    return json;
  }

  // ---------- Replace default texts with settings ----------
  function applySettingsText(s) {
    const pairs = [
      ['00201032265201', '00' + s.phone_intl],
      ['201032265201', s.phone_intl],
      ['01032265201', s.phone_local],
      ['د. سهر الفحام', s.doctor_name],
      ['dr.abdulazizsaad@nait-mh.com', s.email],
      ['خصم 50% لفترة محدودة على جميع البرامج التدريبية والدبلومات المعتمده!', s.announcement_text]
    ];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentNode && /SCRIPT|STYLE/.test(n.parentNode.nodeName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      let t = n.nodeValue;
      pairs.forEach(([from, to]) => { if (to && t.indexOf(from) !== -1) t = t.split(from).join(to); });
      if (t !== n.nodeValue) n.nodeValue = t;
    });
    document.querySelectorAll('a[href]').forEach(a => {
      let href = a.getAttribute('href');
      let changed = href;
      pairs.forEach(([from, to]) => { if (to && changed.indexOf(from) !== -1) changed = changed.split(from).join(to); });
      if (changed !== href) a.setAttribute('href', changed);
    });
  }

  // ---------- Render instructors (doctors page) ----------
  function renderInstructors(list) {
    const grid = document.getElementById('doctors-grid');
    if (!grid || !list.length) return;
    grid.innerHTML = list.map(d => `
      <div class="doc-card bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-xl transition" data-category="${esc(d.category)}">
        <div class="space-y-4 text-center">
          <div class="w-24 h-24 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-nait-navy text-4xl border-2 border-nait-teal shadow-inner overflow-hidden">
            ${d.photo ? `<img src="${esc(d.photo)}" alt="${esc(d.name)}" class="w-full h-full object-cover">` : '<i class="fa-solid fa-user-doctor"></i>'}
          </div>
          <div>
            <h3 class="font-extrabold text-lg text-nait-navy">${esc(d.name)}</h3>
            <p class="text-xs font-bold text-nait-teal mt-0.5">${esc(d.title)}</p>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">${esc(d.bio)}</p>
          ${d.price ? `<p class="text-sm font-black text-nait-navy">${esc(d.price)}</p>` : ''}
        </div>
        <button data-book-name="${esc(d.name)}" data-book-title="${esc(d.title)}" onclick="ELMADAR.book(this)" class="w-full mt-6 bg-nait-teal hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs shadow transition">احجز موعد مع ${esc(d.name)}</button>
      </div>`).join('');
  }

  // ---------- Render courses ----------
  function priceHTML(c) {
    const price = Number(c.price) || 0;
    const disc = Number(c.discount_percent) || 0;
    if (disc > 0) {
      const finalP = Math.round(price * (1 - disc / 100));
      return `<span class="text-xs text-slate-400 line-through">${price} $</span> <span class="text-xl font-black text-nait-navy">${finalP} $</span>`;
    }
    return `<span class="text-xl font-black text-nait-navy">${price} $</span>`;
  }

  function renderCourses(courses, videos) {
    const grid = document.getElementById('courses-grid');
    if (!grid || !courses.length) return;
    const instructorsById = {};
    (DATA.instructors || []).forEach(i => instructorsById[i.id] = i);
    grid.innerHTML = courses.map(c => {
      const ins = instructorsById[c.instructor_id];
      const vCount = videos.filter(v => String(v.course_id) === String(c.id)).length;
      const disc = Number(c.discount_percent) || 0;
      const locs = String(c.locations || '');
      return `
      <div class="course-card bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition" data-location="${esc(locs)}">
        ${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.title)}" class="w-full h-44 object-cover">` : ''}
        <div class="p-6 space-y-4">
          <div class="flex justify-between items-start">
            ${disc > 0 ? `<span class="bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full">خصم ${disc}%</span>` : '<span></span>'}
            <span class="text-xs font-semibold text-nait-teal bg-sky-50 px-2.5 py-1 rounded-full">${esc(c.type_label)}</span>
          </div>
          <h3 class="text-lg font-extrabold text-nait-navy leading-snug">${esc(c.title)}</h3>
          <p class="text-xs text-slate-600 leading-relaxed">${esc(c.description)}</p>
          <div class="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div class="flex items-center gap-2"><i class="fa-solid fa-clock text-nait-teal"></i> <span>المدة: ${esc(c.duration)}</span></div>
            <div class="flex items-center gap-2"><i class="fa-solid fa-user-tie text-nait-teal"></i> <span>المحاضر: ${esc(ins ? ins.name : '—')}</span></div>
            <div class="flex items-center gap-2"><i class="fa-solid fa-laptop text-nait-teal"></i> <span>${locs.split(',').map(l => LOCATION_LABELS[l.trim()] || l).join(' / ')}</span></div>
          </div>
        </div>
        <div class="p-6 pt-0 flex items-center justify-between gap-3">
          <div class="flex flex-col">${priceHTML(c)}</div>
          <div class="flex gap-2">
            ${vCount ? `<button onclick="ELMADAR.showVideos('${esc(c.id)}')" class="text-xs font-bold px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"><i class="fa-solid fa-play"></i> ${vCount} فيديو</button>` : ''}
            <button data-course-id="${esc(c.id)}" data-course-title="${esc(c.title)}" onclick="ELMADAR.selectCourse(this)" class="bg-nait-teal hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm">سجل بالدورة</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ---------- Videos modal ----------
  function showVideos(courseId) {
    const course = DATA.courses.find(c => String(c.id) === String(courseId));
    const vids = DATA.videos.filter(v => String(v.course_id) === String(courseId));
    let overlay = document.getElementById('el-videos-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'el-videos-modal';
      overlay.className = 'fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4';
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
        <div class="flex justify-between items-center">
          <h3 class="font-black text-nait-navy">${esc(course ? course.title : '')}</h3>
          <button onclick="document.getElementById('el-videos-modal').remove()" class="text-slate-500 text-xl">&times;</button>
        </div>
        ${vids.map(v => `
          <a href="${esc(v.url)}" target="_blank" class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-nait-teal">
            <i class="fa-solid fa-circle-play text-2xl text-nait-teal"></i>
            <span class="font-bold text-sm text-nait-navy">${esc(v.title)}</span>
          </a>`).join('') || '<p class="text-sm text-slate-500">لا توجد فيديوهات بعد.</p>'}
      </div>`;
  }

  // ---------- Submit to Sheets ----------
  async function submit(type, data) {
    if (!configured) return { ok: false };
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submit', type, data })
      });
      return await res.json();
    } catch (e) { return { ok: false }; }
  }

  function formData(form) {
    const o = {};
    new FormData(form).forEach((v, k) => { o[k] = v; });
    return o;
  }

  // ---------- Override form handlers (defined in app.js) ----------
  window.confirmBooking = function (e) {
    e.preventDefault();
    const d = formData(e.target);
    d.doctor = document.getElementById('modal-doctor-name').innerText;
    submit('booking', d);
    closeBookingModal();
    showToast('تم استلام طلب حجز الجلسة بنجاح! سيتواصل معك منسق المواعيد خلال دقائق.');
    e.target.reset();
  };

  window.confirmCourseReg = function (e) {
    e.preventDefault();
    const d = formData(e.target);
    d.course_id = currentCourseId;
    d.course = document.getElementById('modal-course-name').innerText;
    submit('registration', d);
    closeCourseModal();
    showToast('تم تسجيل طلبك بنجاح! سيتم التواصل معك لإرسال رابط الحقيبة التدريبية.');
    e.target.reset();
  };

  window.handleConsultSubmit = function (e) {
    e.preventDefault();
    submit('consultation', formData(e.target));
    showToast('تم إرسال طلب الاستشارة المجانية بنجاح! سيتم الرد عليك في أقرب وقت عبر الواتساب.');
    e.target.reset();
  };

  window.handleGeneralContact = function (e) {
    e.preventDefault();
    submit('contact', formData(e.target));
    showToast('شكراً لتواصلك معنا! تم إرسال رسالتك لإدارة المركز بنجاح.');
    e.target.reset();
  };

  // ---------- Public helpers used by rendered buttons ----------
  window.ELMADAR = {
    selectCourse(btn) { currentCourseId = btn.dataset.courseId; openCourseModal(btn.dataset.courseTitle); },
    book(btn) { openBookingModal(btn.dataset.bookName, btn.dataset.bookTitle); },
    showVideos
  };

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', async () => {
    if (!configured) return;
    try {
      DATA = await loadContent();
      applySettingsText(DATA.settings);
      renderInstructors(DATA.instructors);
      renderCourses(DATA.courses, DATA.videos);
      applySettingsText(DATA.settings); // catch any text rendered above
    } catch (err) {
      console.warn('EL MADAR: could not load content, showing defaults.', err);
    }
  });
})();
