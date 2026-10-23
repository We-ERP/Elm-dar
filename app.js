// Single Page Navigation Function
        function navigateTo(pageId) {
            // Hide all pages
            const pages = document.querySelectorAll('.page-content');
            pages.forEach(p => p.classList.add('hidden'));

            // Show selected page
            const targetPage = document.getElementById(`page-${pageId}`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
            }

            // Update Header Tab Highlight
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => link.classList.remove('active-tab'));
            const activeNav = document.getElementById(`nav-${pageId}`);
            if (activeNav) {
                activeNav.classList.add('active-tab');
            }

            // Scroll to top smooth
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Mobile Menu Toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }

        // PSYCHOMETRIC QUIZ SYSTEM DATA & LOGIC
        const assessmentsData = {
            bigfive: {
                title: 'مقياس العوامل الخمسة الكبرى للشخصية (Big Five)',
                badge: 'مقياس تفاعلي شامل',
                questions: [
                    '1. تميل عادةً للتخطيط المسبق والتنظيم الدقيق لمهماتك اليومية؟',
                    '2. تجد سهولة كبيرة في بدء الحوارات وتكوين صداقات جديدة باللقاءات؟',
                    '3. تشعر بالقلق أو الضغط النفسي بسهولة عند مواجهة العقبات؟',
                    '4. تهتم كثيراً بمشاعر الآخرين وتحرص على مساعدة من حولك؟',
                    '5. تحب تجربة الأفكار المبتكرة والأنشطة الإبداعية غير التقليدية؟'
                ],
                traits: ['التنظيم والضمير الحي', 'الانبساطية والاجتماعية', 'العصبية والاتزان العاطفي', 'المقبولية والتعاطف', 'الانفتاح على الخبرة']
            },
            ysq: {
                title: 'مقياس يونج للمخططات المعرفية (YSQ-L3)',
                badge: 'مقياس المخططات المبكرة',
                questions: [
                    '1. تشعر غالباً بوجود شعور داخلي بأن المقربين منك سيتخلون عنك؟',
                    '2. ترى دائماً أن الآخرين قد يستغلون نقاط ضعفك لصالحهم؟',
                    '3. تضع لنفسك معايير عالية جداً وتتألم بحدة إن لم تحقق الكمال؟',
                    '4. تشعر بأن احتياجات الآخرين أولى دائماً من احتياجاتك الشخصية؟',
                    '5. ينتابك إحساس متكرر بأنك مختلف ولا تنتمي للبيئة من حولك؟'
                ],
                traits: ['مخطط الهجر والفرار', 'مخطط عدم الثقة والاستغلال', 'مخطط المعايير الصارمة', 'مخط0 الإيثار والتضحية', 'مخطط العزلة الاجتماعية']
            },
            ypi: {
                title: 'مقياس يونج لأساليب الوالدية (YPI-R2)',
                badge: 'تقييم التنشئة الوالدية',
                questions: [
                    '1. كان والدك/والدتك يتوقعان منك الامتثال الصارم لأوامرهما دون نقاش؟',
                    '2. شعرت في صغرك بحماية زائدة منعتك من تجربة الحياة بنفسك؟',
                    '3. كان المديح والاهتمام مقترناً فقط بتحقيقك لنجاحات مبهرة؟',
                    '4. عانيت من الإهمال العاطفي وعدم التعبير عن مشاعرك في الأسرة؟',
                    '5. كانت العقوبات شديدة وغير متناسبة مع الأخطاء الصغيرة؟'
                ],
                traits: ['الوالدية التسلطية', 'الحماية الزائدة', 'اشتراط القبول والنجاح', 'الحرمان العاطفي', 'الأسلوب القاسي']
            },
            smi: {
                title: 'مقياس أوضاع المخططات (SMI - Schema Mode)',
                badge: 'مقياس الأنماط العاطفية',
                questions: [
                    '1. عندما تقع في المشاكل، تصبح قاسياً جداً وتجلد ذاتك بحدة؟',
                    '2. تصاب أحياناً بنوبات غضب مفاجئة وتصرفات كالأطفال عند الإحباط؟',
                    '3. تميل للانسحاب وتخدير مشاعرك تماماً بالانشغال الدائم لتجنب الألم؟',
                    '4. تساير الآخرين وتوافق على ما لا ترغب به خوفاً من المواجهة؟',
                    '5. تتمتع بالقدرة على تهدئة نفسك بأسلوب حكيم ومشجع وموضوعي؟'
                ],
                traits: ['وضع الناقد الداخلي القاسي', 'وضع الطفل الغاضب', 'وضع المدافع المنعزل', 'وضع الممتثل الخاضع', 'وضع البالغ الصحي']
            }
        };

        let currentAssessment = 'bigfive';
        let currentQuestionIdx = 0;
        let quizAnswers = [];

        function loadAssessment(type) {
            currentAssessment = type;
            currentQuestionIdx = 0;
            quizAnswers = [];

            // UI updates for buttons
            document.querySelectorAll('.assessment-card').forEach(card => {
                card.classList.remove('border-nait-teal', 'bg-sky-50/50');
            });
            document.getElementById(`assess-btn-${type}`).classList.add('border-nait-teal', 'bg-sky-50/50');

            const data = assessmentsData[type];
            document.getElementById('quiz-title').innerText = data.title;
            document.getElementById('quiz-badge').innerText = data.badge;
            document.getElementById('total-q-num').innerText = data.questions.length;
            
            document.getElementById('quiz-body').classList.remove('hidden');
            document.getElementById('quiz-results').classList.add('hidden');

            renderQuestion();
        }

        function renderQuestion() {
            const data = assessmentsData[currentAssessment];
            document.getElementById('current-q-num').innerText = currentQuestionIdx + 1;
            document.getElementById('question-text').innerText = data.questions[currentQuestionIdx];

            // Update Progress Bar
            const progressPct = ((currentQuestionIdx + 1) / data.questions.length) * 100;
            document.getElementById('quiz-progress').style.width = `${progressPct}%`;

            // Options radio HTML
            const options = ['أوافق بشدة (5)', 'أوافق غالباً (4)', 'محايد / أحياناً (3)', 'لا أوافق (2)', 'لا أوافق مطلقاً (1)'];
            let optionsHTML = '';
            
            options.forEach((opt, idx) => {
                const scoreVal = 5 - idx;
                const isChecked = quizAnswers[currentQuestionIdx] === scoreVal ? 'checked' : '';
                optionsHTML += `
                    <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-nait-teal cursor-pointer transition bg-slate-50/50 hover:bg-sky-50/20">
                        <input type="radio" name="quiz-opt" value="${scoreVal}" ${isChecked} class="w-4 h-4 text-nait-teal focus:ring-nait-teal" onchange="selectAnswer(${scoreVal})">
                        <span class="text-xs sm:text-sm font-semibold text-slate-700">${opt}</span>
                    </label>
                `;
            });
            document.getElementById('options-container').innerHTML = optionsHTML;

            // Buttons state
            document.getElementById('prev-btn').disabled = (currentQuestionIdx === 0);
            document.getElementById('next-btn').innerText = (currentQuestionIdx === data.questions.length - 1) ? 'عرض النتائج المبدئية' : 'التالي ←';
        }

        function selectAnswer(val) {
            quizAnswers[currentQuestionIdx] = val;
        }

        function prevQuestion() {
            if (currentQuestionIdx > 0) {
                currentQuestionIdx--;
                renderQuestion();
            }
        }

        function nextQuestion() {
            if (!quizAnswers[currentQuestionIdx]) {
                quizAnswers[currentQuestionIdx] = 4; // Default selection if skipped
            }

            const data = assessmentsData[currentAssessment];
            if (currentQuestionIdx < data.questions.length - 1) {
                currentQuestionIdx++;
                renderQuestion();
            } else {
                showQuizResults();
            }
        }

        function showQuizResults() {
            document.getElementById('quiz-body').classList.add('hidden');
            document.getElementById('quiz-results').classList.remove('hidden');

            const data = assessmentsData[currentAssessment];
            let resultsHTML = '';

            data.traits.forEach((trait, i) => {
                const val = quizAnswers[i] || 3;
                const pct = (val / 5) * 100;
                resultsHTML += `
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <div class="flex justify-between text-xs font-bold">
                            <span class="text-nait-navy">${trait}</span>
                            <span class="text-nait-teal">${pct}%</span>
                        </div>
                        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div class="bg-nait-teal h-full" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            });

            document.getElementById('results-breakdown').innerHTML = resultsHTML;
        }

        function restartQuiz() {
            loadAssessment(currentAssessment);
        }

        // COURSE FILTERING LOGIC
        function filterCourses(filterVal) {
            document.querySelectorAll('.course-filter-btn').forEach(btn => {
                btn.classList.remove('bg-nait-navy', 'text-white');
                btn.classList.add('bg-slate-100', 'text-slate-700');
            });
            event.target.classList.remove('bg-slate-100', 'text-slate-700');
            event.target.classList.add('bg-nait-navy', 'text-white');

            const courses = document.querySelectorAll('.course-card');
            courses.forEach(card => {
                const loc = card.getAttribute('data-location');
                if (filterVal === 'all' || loc.includes(filterVal)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }

        // DOCTORS FILTERING LOGIC
        function filterDoctors(category) {
            document.querySelectorAll('.doc-filter-btn').forEach(btn => {
                btn.classList.remove('bg-nait-navy', 'text-white');
                btn.classList.add('bg-white', 'text-slate-700');
            });
            event.target.classList.remove('bg-white', 'text-slate-700');
            event.target.classList.add('bg-nait-navy', 'text-white');

            const docs = document.querySelectorAll('.doc-card');
            docs.forEach(doc => {
                const cat = doc.getAttribute('data-category');
                if (category === 'all' || cat.includes(category)) {
                    doc.classList.remove('hidden');
                } else {
                    doc.classList.add('hidden');
                }
            });
        }

        // MODAL HANDLERS
        function openBookingModal(docName, docTitle) {
            document.getElementById('modal-doctor-name').innerText = `حجز موعد مع ${docName}`;
            document.getElementById('modal-doctor-title').innerText = docTitle;
            document.getElementById('booking-modal').classList.remove('hidden');
        }

        function closeBookingModal() {
            document.getElementById('booking-modal').classList.add('hidden');
        }

        function openCourseModal(courseName) {
            document.getElementById('modal-course-name').innerText = courseName;
            document.getElementById('course-modal').classList.remove('hidden');
        }

        function closeCourseModal() {
            document.getElementById('course-modal').classList.add('hidden');
        }

        function selectTimeSlot(btn) {
            document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('bg-nait-teal', 'text-white', 'border-nait-teal'));
            btn.classList.add('bg-nait-teal', 'text-white', 'border-nait-teal');
        }

        // FORM SUBMISSION HANDLERS
        function confirmBooking(e) {
            e.preventDefault();
            closeBookingModal();
            showToast('تم استلام طلب حجز الجلسة بنجاح! سيتواصل معك منسق المواعيد خلال دقائق.');
        }

        function confirmCourseReg(e) {
            e.preventDefault();
            closeCourseModal();
            showToast('تم تسجل كود الخصم 50% بنجاح! سيتم التواصل معك لإرسال رابط الحقيبة التدريبية.');
        }

        function handleConsultSubmit(e) {
            e.preventDefault();
            showToast('تم إرسال طلب الاستشارة المجانية بنجاح! سيتم الرد عليك في أقرب وقت عبر الواتساب.');
            e.target.reset();
        }

        function handleGeneralContact(e) {
            e.preventDefault();
            showToast('شكراً لتواصلك معنا! تم إرسال رسالتك لإدارة المركز بنجاح.');
            e.target.reset();
        }

        function showToast(message) {
            const toast = document.getElementById('toast-msg');
            document.getElementById('toast-text').innerText = message;
            toast.classList.remove('translate-y-24', 'opacity-0');
            
            setTimeout(() => {
                toast.classList.add('translate-y-24', 'opacity-0');
            }, 4500);
        }


        // SCALES FILTERING
        function filterScales(cat, btn) {
            document.querySelectorAll('.scale-filter-btn').forEach(b => {
                b.classList.remove('bg-nait-navy', 'text-white');
                b.classList.add('bg-slate-100', 'text-slate-700');
            });
            btn.classList.remove('bg-slate-100', 'text-slate-700');
            btn.classList.add('bg-nait-navy', 'text-white');
            document.querySelectorAll('.scale-card').forEach(c => {
                c.classList.toggle('hidden', !(cat === 'all' || c.dataset.cat === cat));
            });
        }

        // INITIALIZATION
        window.onload = function() {
            loadAssessment('bigfive');
        };
