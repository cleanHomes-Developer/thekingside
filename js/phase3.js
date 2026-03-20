/**
 * Meezan — Phase 3: Document Intelligence
 * Vault, Q&A, Risk Assessment, Smart Highlights
 */

/* ═══════════════════════════════════════════════
   VAULT DATA
═══════════════════════════════════════════════ */
const VAULT_DOCS = [
  {
    id: 'doc1', name: 'عقد إيجار تجاري — الفجر', type: 'عقود',
    icon: 'pdf', size: '٢.٤ MB', date: '٢٠ مارس ٢٠٢٦', risk: 'high',
    riskLabel: 'مخاطر عالية', riskClass: 'tag-red',
    content: `<h3>عقد إيجار تجاري</h3>
<p>إنه في يوم الأحد الموافق ١٥/٣/٢٠٢٦ تم الاتفاق بين كل من:</p>
<p><strong>الطرف الأول (المؤجر):</strong> شركة العقارات الذهبية المحدودة، المسجلة في المملكة الأردنية الهاشمية برقم (١٢٣٤٥٦).</p>
<p><strong>الطرف الثاني (المستأجر):</strong> شركة الفجر للتجارة والتوزيع، المسجلة برقم (٧٨٩٠١٢).</p>
<h3>المادة الأولى: موضوع العقد</h3>
<p>يقوم الطرف الأول بتأجير المحل التجاري الكائن في <span class="highlight-warn">عمّان، شارع الملكة نور، مجمع الأندلس التجاري، الطابق الأرضي، رقم (١٥)</span> للطرف الثاني.</p>
<h3>المادة الثانية: مدة الإيجار</h3>
<p>تبدأ مدة الإيجار اعتباراً من <span class="highlight-good">١/٤/٢٠٢٦</span> وتنتهي في <span class="highlight-good">٣١/٣/٢٠٢٩</span> أي لمدة ثلاث سنوات قابلة للتجديد.</p>
<h3>المادة الثالثة: بدل الإيجار</h3>
<p>يتفق الطرفان على أن يكون بدل الإيجار السنوي <strong>٢٤,٠٠٠ دينار أردني</strong> يُسدَّد شهرياً بمبلغ ٢,٠٠٠ دينار.</p>
<h3>المادة الرابعة: التزامات المستأجر</h3>
<p><span class="highlight-risk">يحق للمؤجر إنهاء العقد دون إشعار مسبق في حال تأخر المستأجر عن سداد بدل الإيجار لمدة تزيد عن ٧ أيام.</span></p>
<h3>المادة الخامسة: الضمانات</h3>
<p>يلتزم المستأجر بتقديم ضمان بنكي بقيمة ٣ أشهر من بدل الإيجار.</p>`
  },
  {
    id: 'doc2', name: 'عقد مرابحة — البنك الإسلامي', type: 'عقود',
    icon: 'doc', size: '١.١ MB', date: '١٨ مارس ٢٠٢٦', risk: 'low',
    riskLabel: 'مطابق', riskClass: 'tag-green',
    content: `<h3>عقد مرابحة</h3>
<p>تم إبرام هذا العقد بين البنك الإسلامي الأردني والعميل وفقاً لأحكام الشريعة الإسلامية.</p>
<h3>المادة الأولى: موضوع المرابحة</h3>
<p>يقوم البنك بشراء <span class="highlight-good">سيارة مرسيدس E200 موديل ٢٠٢٦</span> وبيعها للعميل بثمن مؤجل يشمل هامش ربح البنك.</p>
<h3>المادة الثانية: ثمن البيع</h3>
<p>ثمن الشراء: <strong>٣٥,٠٠٠ دينار أردني</strong>. هامش الربح: ٨٪. إجمالي ثمن البيع: <strong>٣٧,٨٠٠ دينار</strong> تُسدَّد على ٦٠ قسطاً شهرياً.</p>
<h3>المادة الثالثة: الضمانات</h3>
<p><span class="highlight-good">يُرهن المبيع لصالح البنك حتى سداد كامل الثمن.</span></p>`
  },
  {
    id: 'doc3', name: 'اتفاقية شراكة — مجموعة النور', type: 'عقود',
    icon: 'pdf', size: '٣.٨ MB', date: '١٥ مارس ٢٠٢٦', risk: 'medium',
    riskLabel: 'متوسط', riskClass: 'tag-amber',
    content: `<h3>اتفاقية شراكة تجارية</h3>
<p>تم إبرام هذه الاتفاقية بين الشركاء المؤسسين لمجموعة النور للاستثمار.</p>
<h3>المادة الأولى: تأسيس الشراكة</h3>
<p>يتفق الطرفان على تأسيس شراكة تجارية لمدة <span class="highlight-warn">٥ سنوات قابلة للتجديد</span> بالتراضي.</p>
<h3>المادة الثانية: رأس المال</h3>
<p>رأس مال الشراكة: <strong>٢٠٠,٠٠٠ دينار أردني</strong> يُوزَّع بالتساوي بين الشريكين.</p>
<h3>المادة الثالثة: توزيع الأرباح</h3>
<p><span class="highlight-warn">تُوزَّع الأرباح والخسائر بنسبة ٥٠٪ لكل شريك</span> بعد خصم المصاريف التشغيلية.</p>
<h3>المادة الرابعة: فض النزاعات</h3>
<p><span class="highlight-risk">لم يُحدَّد مرجع التحكيم في حال نشوء نزاع بين الشركاء.</span></p>`
  },
  {
    id: 'doc4', name: 'عقد توظيف — مدير تنفيذي', type: 'عقود',
    icon: 'doc', size: '٠.٩ MB', date: '١٢ مارس ٢٠٢٦', risk: 'low',
    riskLabel: 'منخفض', riskClass: 'tag-green',
    content: `<h3>عقد توظيف</h3>
<p>تم إبرام هذا العقد بين شركة الرواد للتكنولوجيا والمدير التنفيذي المعيَّن.</p>
<h3>المادة الأولى: المسمى الوظيفي</h3>
<p>يُعيَّن الطرف الثاني بمنصب <span class="highlight-good">المدير التنفيذي</span> اعتباراً من ١/٤/٢٠٢٦.</p>
<h3>المادة الثانية: الراتب والمزايا</h3>
<p>الراتب الأساسي: <strong>٤,٥٠٠ دينار شهرياً</strong> إضافة إلى بدل سيارة ومكافأة سنوية.</p>
<h3>المادة الثالثة: السرية</h3>
<p><span class="highlight-good">يلتزم الموظف بالحفاظ على سرية المعلومات التجارية لمدة ٣ سنوات بعد انتهاء العقد.</span></p>`
  },
  {
    id: 'doc5', name: 'حكم محكمة استئناف ٢٠٢٤', type: 'أحكام',
    icon: 'pdf', size: '١.٦ MB', date: '١٠ مارس ٢٠٢٦', risk: null,
    riskLabel: null, riskClass: null,
    content: `<h3>حكم محكمة الاستئناف</h3>
<p><strong>رقم الدعوى:</strong> ٢٠٢٤/٤٥٦ — <strong>المحكمة:</strong> محكمة استئناف عمّان</p>
<h3>الوقائع</h3>
<p>طعن المستأنف في حكم محكمة البداية الصادر بتاريخ ١٥/٦/٢٠٢٤ القاضي برفض دعواه بالمطالبة بالأجور المتأخرة.</p>
<h3>المنطوق</h3>
<p><span class="highlight-good">قررت المحكمة قبول الاستئناف شكلاً وموضوعاً وإلزام المستأنف عليه بدفع مبلغ ١٢,٠٠٠ دينار.</span></p>
<h3>الأسباب</h3>
<p>استندت المحكمة إلى المادة (٣٣) من قانون العمل الأردني وأكدت أن مدة التقادم تبدأ من تاريخ الاستحقاق.</p>`
  },
  {
    id: 'doc6', name: 'مذكرة قانونية — نزاع عقاري', type: 'مذكرات',
    icon: 'doc', size: '١.٢ MB', date: '٨ مارس ٢٠٢٦', risk: 'medium',
    riskLabel: 'متوسط', riskClass: 'tag-amber',
    content: `<h3>مذكرة قانونية</h3>
<p><strong>الموضوع:</strong> نزاع عقاري حول ملكية قطعة أرض في منطقة الجبيهة</p>
<h3>الوقائع</h3>
<p>يدّعي موكلنا ملكية قطعة الأرض رقم (٤٥٦/أ) المسجلة في دائرة تسجيل الأراضي بموجب سند تسجيل رقم (٧٨٩).</p>
<h3>الحجج القانونية</h3>
<p><span class="highlight-good">يستند موكلنا إلى قانون الأراضي الأردني المادة (٢٤) التي تكفل حماية حقوق الملكية المسجلة.</span></p>
<h3>الطلبات</h3>
<p>نطلب من المحكمة الموقرة إصدار حكم بتثبيت ملكية موكلنا وإزالة أي تعدٍّ على العقار.</p>`
  }
];

let currentVaultDoc = VAULT_DOCS[0];
let vaultFilter = 'الكل';

/* ═══════════════════════════════════════════════
   VAULT FUNCTIONS
═══════════════════════════════════════════════ */
function renderVaultList(docs) {
  const container = document.querySelector('#panel-vault .vault-items');
  if (!container) return;
  container.innerHTML = docs.map(doc => `
    <div class="vault-item ${doc.id === currentVaultDoc.id ? 'selected' : ''}" onclick="selectVaultDoc('${doc.id}')">
      <div class="vi-icon ${doc.icon === 'pdf' ? 'pdf' : 'doc'}">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        </svg>
      </div>
      <div style="flex:1;min-width:0">
        <div class="vi-name">${doc.name}</div>
        <div class="vi-meta">${doc.icon.toUpperCase()} · ${doc.size} · ${doc.date}</div>
      </div>
      ${doc.riskLabel ? `<span class="tag ${doc.riskClass}" style="font-size:10px;white-space:nowrap">${doc.riskLabel}</span>` : ''}
    </div>
  `).join('');
}

function selectVaultDoc(docId) {
  const doc = VAULT_DOCS.find(d => d.id === docId);
  if (!doc) return;
  currentVaultDoc = doc;

  // Re-render list with updated selection highlight
  const filtered = vaultFilter === 'الكل' ? VAULT_DOCS : VAULT_DOCS.filter(d => d.type === vaultFilter);
  renderVaultList(filtered);

  // Update preview title
  const titleEl = document.querySelector('#panel-vault #vault-doc-title');
  if (titleEl) titleEl.textContent = doc.name;

  // Update preview body
  const bodyEl = document.querySelector('#panel-vault #vault-doc-body');
  if (bodyEl) {
    bodyEl.innerHTML = doc.content;
    bodyEl.scrollTop = 0;
  }
}

function vaultSearch(val) {
  const query = val.trim();
  const base = vaultFilter === 'الكل' ? VAULT_DOCS : VAULT_DOCS.filter(d => d.type === vaultFilter);
  const filtered = query ? base.filter(d => d.name.includes(query) || d.type.includes(query)) : base;
  renderVaultList(filtered);
  // Update count
  const countEl = document.getElementById('vault-count');
  if (countEl) countEl.textContent = `المستندات (${filtered.length})`;
}

function vaultFilterByType(type) {
  vaultFilter = type;
  const filtered = type === 'الكل' ? VAULT_DOCS : VAULT_DOCS.filter(d => d.type === type);
  renderVaultList(filtered);
  const countEl = document.getElementById('vault-count');
  if (countEl) countEl.textContent = `المستندات (${filtered.length})`;
}

function showUploadModal() {
  const modal = document.getElementById('upload-modal');
  if (modal) { modal.style.display = 'flex'; return; }
  // Create modal
  const m = document.createElement('div');
  m.id = 'upload-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9000;display:flex;align-items:center;justify-content:center';
  m.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;width:480px;max-width:90vw;direction:rtl">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
        <h3 style="margin:0;font-size:18px;color:var(--navy)">رفع مستند جديد</h3>
        <button onclick="document.getElementById('upload-modal').style.display='none'" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--gray-4)">✕</button>
      </div>
      <div id="upload-drop-zone" style="border:2px dashed var(--gray-3);border-radius:12px;padding:40px;text-align:center;cursor:pointer;transition:all .2s"
        ondragover="event.preventDefault();this.style.borderColor='var(--cyan)';this.style.background='rgba(89,189,230,.05)'"
        ondragleave="this.style.borderColor='var(--gray-3)';this.style.background=''"
        ondrop="handleVaultDrop(event)">
        <svg width="40" height="40" fill="none" stroke="var(--cyan)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <div style="font-size:15px;font-weight:600;color:var(--navy);margin-bottom:6px">اسحب الملف هنا أو انقر للاختيار</div>
        <div style="font-size:13px;color:var(--gray-4)">PDF, DOCX, DOC — حتى ٥٠ MB</div>
        <input type="file" accept=".pdf,.docx,.doc" style="display:none" id="vault-file-input" onchange="handleVaultFileSelect(this)">
      </div>
      <div style="margin-top:16px">
        <label style="font-size:13px;font-weight:600;color:var(--navy);display:block;margin-bottom:6px">تصنيف المستند</label>
        <select class="form-select" id="upload-category">
          <option>عقود</option><option>مذكرات</option><option>أحكام</option><option>مراسلات</option>
        </select>
      </div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-primary" style="flex:1" onclick="simulateUpload()">رفع المستند</button>
        <button class="btn btn-ghost" onclick="document.getElementById('upload-modal').style.display='none'">إلغاء</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  // Click drop zone to open file picker
  m.querySelector('#upload-drop-zone').addEventListener('click', () => m.querySelector('#vault-file-input').click());
}

function handleVaultDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) simulateUploadFile(file.name);
}

function handleVaultFileSelect(input) {
  if (input.files[0]) simulateUploadFile(input.files[0].name);
}

function simulateUpload() {
  simulateUploadFile('مستند_جديد.pdf');
}

function simulateUploadFile(filename) {
  const modal = document.getElementById('upload-modal');
  const dz = document.getElementById('upload-drop-zone');
  if (dz) {
    dz.innerHTML = `
      <div style="font-size:15px;font-weight:600;color:var(--navy);margin-bottom:12px">جارٍ رفع ${filename}...</div>
      <div style="background:var(--gray-2);border-radius:100px;height:6px;overflow:hidden">
        <div id="upload-progress" style="background:var(--cyan);height:100%;width:0%;transition:width .1s;border-radius:100px"></div>
      </div>`;
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 15;
      if (pct >= 100) { pct = 100; clearInterval(iv);
        setTimeout(() => {
          if (modal) modal.style.display = 'none';
          // Clear search box
          const searchInput = document.getElementById('vault-search');
          if (searchInput) { searchInput.value = ''; vaultFilter = 'الكل'; }
          // Reset filter dropdown
          const filterSel = document.querySelector('#panel-vault select');
          if (filterSel) filterSel.value = 'الكل';
          // Add new doc to vault
          const docId = 'doc_new_' + Date.now();
          const baseName = filename.replace(/\.[^.]+$/, '');
          const docType = document.getElementById('upload-category')?.value || 'عقود';
          const newDoc = {
            id: docId,
            name: baseName + ' — جديد',
            type: docType,
            icon: filename.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc',
            size: '١.٠ MB', date: 'الآن', risk: null, riskLabel: null, riskClass: null,
            content: `<div style="text-align:center;padding:40px 20px">
              <div style="width:48px;height:48px;border:3px solid var(--cyan);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px"></div>
              <div style="font-size:15px;font-weight:600;color:var(--navy);margin-bottom:8px">${filename}</div>
              <div style="font-size:13px;color:var(--gray-4)">جارٍ تحليله بالذكاء الاصطناعي...</div>
            </div>`
          };
          // Add spin animation
          if (!document.getElementById('spin-style')) {
            const s = document.createElement('style');
            s.id = 'spin-style';
            s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
            document.head.appendChild(s);
          }
          VAULT_DOCS.unshift(newDoc);
          vaultFilter = 'الكل';
          renderVaultList(VAULT_DOCS);
          // Update count
          const countEl = document.getElementById('vault-count');
          if (countEl) countEl.textContent = `المستندات (${VAULT_DOCS.length})`;
          // Auto-select the new doc
          currentVaultDoc = newDoc;
          const titleEl = document.getElementById('vault-doc-title');
          const bodyEl = document.getElementById('vault-doc-body');
          if (titleEl) titleEl.textContent = newDoc.name;
          if (bodyEl) bodyEl.innerHTML = newDoc.content;
          renderVaultList(VAULT_DOCS);
          showToast('تم رفع المستند بنجاح ✓', 'green');
          // After 2.5s simulate AI analysis complete
          setTimeout(() => {
            const analysisContent = `<div style="padding:4px 0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:10px 14px;background:rgba(89,189,230,.08);border-radius:8px;border-inline-start:3px solid var(--cyan)">
                <span style="font-size:16px">✓</span>
                <div><div style="font-size:13px;font-weight:700;color:var(--navy)">اكتمل التحليل بالذكاء الاصطناعي</div><div style="font-size:12px;color:var(--gray-4)">تم فحص المستند وتصنيف بنوده</div></div>
              </div>
              <h3 style="font-size:15px;margin-bottom:10px">${baseName}</h3>
              <p>تم رفع المستند وتحليله بنجاح. فيما يلي ملخص أولي:</p>
              <ul style="padding-right:20px;line-height:2">
                <li><strong>نوع المستند:</strong> ${docType}</li>
                <li><strong>عدد الصفحات المقدّر:</strong> ٣–٥ صفحات</li>
                <li><strong>اللغة:</strong> عربية</li>
                <li><strong>الحالة:</strong> <span class="tag tag-green">جاهز للمراجعة</span></li>
              </ul>
              <p style="margin-top:12px;font-size:13px;color:var(--gray-4)">لتقييم المخاطر أو طرح أسئلة على هذا المستند، استخدم الأزرار أعلاه.</p>
            </div>`;
            newDoc.content = analysisContent;
            if (currentVaultDoc.id === docId) {
              if (bodyEl) bodyEl.innerHTML = analysisContent;
            }
            showToast('اكتمل تحليل الذكاء الاصطناعي ✓', 'green');
          }, 2500);
        }, 400);
      }
      const bar = document.getElementById('upload-progress');
      if (bar) bar.style.width = pct + '%';
    }, 80);
  }
}

function deleteVaultDoc(docId) {
  const idx = VAULT_DOCS.findIndex(d => d.id === docId);
  if (idx !== -1) {
    VAULT_DOCS.splice(idx, 1);
    if (currentVaultDoc.id === docId) currentVaultDoc = VAULT_DOCS[0];
    renderVaultList(VAULT_DOCS);
    showToast('تم حذف المستند', 'red');
  }
}

function vaultGoToRisk() {
  if (typeof showPanel === 'function') showPanel('risk');
  showToast('تم فتح تقييم المخاطر لـ: ' + currentVaultDoc.name, 'blue');
}

function vaultGoToQA() {
  if (typeof showPanel === 'function') showPanel('qa');
  // Pre-fill the chat with context about the current document
  setTimeout(() => {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = 'حلل المستند: ' + currentVaultDoc.name;
      input.focus();
    }
  }, 300);
}

function vaultDownload() {
  showToast('جارٍ تحميل: ' + currentVaultDoc.name + ' (' + currentVaultDoc.size + ')', 'green');
}

/* ═══════════════════════════════════════════════
   Q&A CHAT DATA & FUNCTIONS
═══════════════════════════════════════════════ */
const QA_RESPONSES = {
  'تقادم': 'وفقاً لقانون العمل الأردني رقم (٨) لسنة ١٩٩٦، مدة التقادم في دعاوى المطالبة بالأجور هي <strong>سنتان</strong> من تاريخ الاستحقاق (المادة ٣٣). أما دعاوى إصابات العمل فتتقادم بـ<strong>ثلاث سنوات</strong> (المادة ٨٦).',
  'إيجار': 'في عقود الإيجار التجاري، يشترط القانون المدني الأردني (المادة ٥٦٢) إشعاراً مسبقاً لا يقل عن <strong>٣٠ يوماً</strong> قبل إنهاء العقد. أي بند يمنح حق الإنهاء الفوري دون إشعار يُعدّ باطلاً ومخالفاً للنظام العام.',
  'تحكيم': 'يُنظَّم التحكيم في الأردن بموجب <strong>قانون التحكيم رقم (٣١) لسنة ٢٠٠١</strong>. يُنصح بإدراج بند تحكيم صريح في العقود التجارية يحدد: مركز التحكيم، عدد المحكمين، اللغة، ومكان التحكيم.',
  'شريعة': 'في عقود المرابحة الإسلامية، يُشترط: (١) أن يمتلك البنك السلعة فعلياً قبل بيعها، (٢) الإفصاح عن سعر الشراء وهامش الربح، (٣) خلو العقد من الغرر والجهالة. المرجع: معايير هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية (AAOIFI).',
  'default': 'شكراً على سؤالك. بناءً على التشريعات الأردنية المعمول بها، يمكنني تقديم تحليل مفصل لهذه المسألة. هل تودّ أن أبحث في قاعدة البيانات القانونية للحصول على أحكام قضائية ذات صلة؟'
};

const SUGGESTED_QUESTIONS = [
  'ما هي مدة التقادم في دعاوى الأجور؟',
  'هل بند الإنهاء الفوري قانوني؟',
  'ما شروط عقد المرابحة الإسلامية؟',
  'كيف أضيف بند تحكيم للعقد؟',
  'ما التزامات المؤجر في القانون الأردني؟',
  'اشرح المادة الرابعة من العقد'
];

function insertQuestion(btn) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = btn.textContent.trim();
    input.focus();
    // Auto-resize
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
  }
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const msgs = document.getElementById('chat-msgs');
  if (!input || !msgs || !input.value.trim()) return;

  const question = input.value.trim();
  input.value = '';
  input.style.height = 'auto';

  // Add user message (use textContent to prevent XSS)
  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  const userBubble = document.createElement('div');
  userBubble.className = 'msg-bubble';
  userBubble.textContent = question; // safe: no innerHTML injection
  userMsg.appendChild(userBubble);
  msgs.appendChild(userMsg);

  // Add typing indicator
  const typing = document.createElement('div');
  typing.className = 'msg ai';
  typing.id = 'typing-indicator';
  typing.innerHTML = `<div class="msg-bubble" style="padding:12px 16px">
    <span style="display:inline-flex;gap:4px;align-items:center">
      <span style="width:7px;height:7px;border-radius:50%;background:var(--gray-4);animation:bounce .8s infinite"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:var(--gray-4);animation:bounce .8s .15s infinite"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:var(--gray-4);animation:bounce .8s .3s infinite"></span>
    </span>
  </div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  // Add bounce animation if not already added
  if (!document.getElementById('bounce-style')) {
    const s = document.createElement('style');
    s.id = 'bounce-style';
    s.textContent = '@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}';
    document.head.appendChild(s);
  }

  // Build conversation history for context
  if (!window._chatHistory) window._chatHistory = [];
  window._chatHistory.push({ role: 'user', content: question });

  // Get selected jurisdiction
  const jurisdictionEl = document.querySelector('#panel-qa .jurisdiction-select, #panel-qa select');
  const jurisdiction = jurisdictionEl ? jurisdictionEl.value || jurisdictionEl.textContent.trim() : 'الأردن';

  // Call real AI API
  fetch('http://localhost:5050/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: window._chatHistory.slice(-10), // last 10 messages for context
      jurisdiction: jurisdiction
    })
  })
  .then(r => r.json())
  .then(data => {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();

    const answer = data.content || 'عذراً، لم أتمكن من الإجابة. يرجى المحاولة مجدداً.';

    // Store assistant reply in history
    window._chatHistory.push({ role: 'assistant', content: answer });

    // Extract [المصدر: ...] citations from the answer text
    const sourceMatches = [...answer.matchAll(/\[(?:المصدر|المرجع|Source)[:\s]+([^\]]+)\]/g)];
    const sources = sourceMatches.map(m => m[1].trim());
    // Remove citation lines from displayed text
    const cleanAnswer = answer.replace(/\[(?:المصدر|المرجع|Source)[:\s]+[^\]]+\]/g, '').trim();
    // Convert newlines to <br> and bold **text**
    const htmlAnswer = cleanAnswer
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    const aiMsg = document.createElement('div');
    aiMsg.className = 'msg ai';
    aiMsg.innerHTML = `
      <div class="msg-bubble">${htmlAnswer}</div>
      ${sources.length ? `<div class="msg-srcs">${sources.map(s => `<span class="msg-src">${s}</span>`).join('')}</div>` : ''}`;
    msgs.appendChild(aiMsg);
    msgs.scrollTop = msgs.scrollHeight;
  })
  .catch(err => {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    console.error('AI chat error:', err);
    const aiMsg = document.createElement('div');
    aiMsg.className = 'msg ai';
    aiMsg.innerHTML = `<div class="msg-bubble">عذراً، حدث خطأ في الاتصال. يرجى التحقق من الاتصال بالإنترنت والمحاولة مجدداً.</div>`;
    msgs.appendChild(aiMsg);
    msgs.scrollTop = msgs.scrollHeight;
  });
}

function newChat() {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  msgs.innerHTML = `
    <div class="msg ai">
      <div class="msg-bubble">مرحباً! أنا ميزان، مساعدك القانوني الذكي. يمكنني مساعدتك في تحليل العقود، البحث في القوانين، وتقديم إجابات قانونية موثقة بالمصادر. كيف يمكنني مساعدتك اليوم؟</div>
    </div>`;
  // Reset conversation history so new chat has no memory of previous session
  window._chatHistory = [];
  showToast('تم بدء محادثة جديدة', 'blue');
}

/* ═══════════════════════════════════════════════
   RISK ASSESSMENT FUNCTIONS
═══════════════════════════════════════════════ */
function suggestEdit(clauseTitle, currentText, suggestedText) {
  // Remove existing modal
  const existing = document.getElementById('suggest-edit-modal');
  if (existing) existing.remove();

  const title = clauseTitle || 'إنهاء العقد دون إشعار — المادة الرابعة';
  const current = currentText || 'يحق للمؤجر إنهاء العقد دون إشعار مسبق في حال تأخر المستأجر عن سداد بدل الإيجار لمدة تزيد عن ٧ أيام.';
  const suggested = suggestedText || 'يحق للمؤجر إنهاء العقد بعد إرسال إشعار كتابي للمستأجر لا يقل عن ٣٠ يوماً، وذلك في حال تأخر المستأجر عن سداد بدل الإيجار لمدة تزيد عن ١٥ يوماً، وفقاً للمادة (٥٦٢) من القانون المدني الأردني.';

  const m = document.createElement('div');
  m.id = 'suggest-edit-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9000;display:flex;align-items:center;justify-content:center';
  m.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;width:580px;max-width:90vw;direction:rtl;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="margin:0;font-size:17px;color:var(--navy)">اقتراح تعديل — ${title}</h3>
        <button onclick="document.getElementById('suggest-edit-modal').remove()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--gray-4)">✕</button>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--red);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">النص الحالي (مخاطر عالية)</div>
        <div style="background:#fff5f5;border:1px solid #ffcccc;border-radius:8px;padding:14px;font-size:14px;line-height:1.8;color:var(--text-body)">${current}</div>
      </div>
      <div style="margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">النص المقترح (متوافق قانونياً)</div>
        <div style="background:#f0fff4;border:1px solid #b2dfdb;border-radius:8px;padding:14px;font-size:14px;line-height:1.8;color:var(--text-body)">${suggested}</div>
      </div>
      <div style="background:rgba(89,189,230,.08);border-radius:8px;padding:12px;margin-bottom:20px;font-size:13px;color:var(--navy)">
        <strong>المرجع القانوني:</strong> المادة (٥٦٢) من القانون المدني الأردني — تشترط إشعاراً مسبقاً لا يقل عن ٣٠ يوماً في عقود الإيجار التجاري.
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-primary" style="flex:1" onclick="applyRiskEdit('${title}')">تطبيق التعديل</button>
        <button class="btn btn-ghost" onclick="copyToClipboard('${suggested}')">نسخ النص</button>
        <button class="btn btn-ghost" onclick="document.getElementById('suggest-edit-modal').remove()">إغلاق</button>
      </div>
    </div>`;
  document.body.appendChild(m);
}

function applyRiskEdit(title) {
  document.getElementById('suggest-edit-modal')?.remove();
  showToast('تم تطبيق التعديل على المستند ✓', 'green');
  // Mark risk item as resolved
  const riskItems = document.querySelectorAll('#panel-risk .risk-item');
  riskItems.forEach(item => {
    const titleEl = item.querySelector('.ri-title');
    if (titleEl && titleEl.textContent.includes(title.substring(0, 8))) {
      item.style.opacity = '0.6';
      item.querySelector('.ri-dot').style.background = 'var(--green)';
      titleEl.textContent = '✓ تم تعديل: ' + title.substring(0, 20);
      // Hide action buttons after resolution
      const btnContainer = item.querySelector('div[style*="margin-top:8px"]');
      if (btnContainer) btnContainer.style.display = 'none';
    }
  });
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => showToast('تم نسخ النص ✓', 'green'));
}

function showLawReference(law) {
  const existing = document.getElementById('law-ref-modal');
  if (existing) existing.remove();

  const lawData = {
    'م.٥٦٢': { title: 'المادة (٥٦٢) — القانون المدني الأردني', text: 'لا يجوز فسخ عقد الإيجار إلا بعد إنذار المستأجر بالإخلاء قبل الموعد المحدد بمدة لا تقل عن ثلاثين يوماً في الإيجار الشهري، وستة أشهر في الإيجار السنوي.', source: 'القانون المدني الأردني رقم (43) لسنة 1976 وتعديلاته' },
    'default': { title: 'نص القانون المرجعي', text: 'يُعرض النص الكامل للمادة القانونية المرجعية مع شرح تفصيلي وأحكام قضائية ذات صلة.', source: 'قاعدة البيانات القانونية — ميزان' }
  };

  const data = lawData[law] || lawData.default;
  const m = document.createElement('div');
  m.id = 'law-ref-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9000;display:flex;align-items:center;justify-content:center';
  m.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;width:520px;max-width:90vw;direction:rtl">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="margin:0;font-size:16px;color:var(--navy)">${data.title}</h3>
        <button onclick="document.getElementById('law-ref-modal').remove()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--gray-4)">✕</button>
      </div>
      <div style="background:var(--gray-1);border-radius:10px;padding:20px;font-size:14px;line-height:2;color:var(--text-body);margin-bottom:16px;border-right:3px solid var(--cyan)">${data.text}</div>
      <div style="font-size:12px;color:var(--gray-4);margin-bottom:20px">المصدر: ${data.source}</div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-primary" onclick="document.getElementById('law-ref-modal').remove()">حسناً</button>
        <button class="btn btn-ghost" onclick="copyToClipboard('${data.text}')">نسخ النص</button>
      </div>
    </div>`;
  document.body.appendChild(m);
}

/* ═══════════════════════════════════════════════
   SMART HIGHLIGHTS FUNCTIONS
═══════════════════════════════════════════════ */
const HIGHLIGHT_DETAILS = {
  'إنهاء دون إشعار': { type: 'risk', color: 'var(--red)', icon: '⚠', title: 'إنهاء دون إشعار', desc: 'مخالف للمادة (٥٦٢) من القانون المدني. يُنصح بتعديل المدة إلى ٣٠ يوماً على الأقل.', action: 'اقتراح تعديل', actionFn: "suggestEdit()" },
  'ضمان بنكي': { type: 'good', color: 'var(--green)', icon: '✓', title: 'ضمان بنكي محدد', desc: 'تحديد الضمان البنكي بـ٣ أشهر يتوافق مع أفضل الممارسات في عقود الإيجار التجاري.', action: null },
  'صيانة غامضة': { type: 'warn', color: 'var(--amber)', icon: '⚡', title: 'صيانة غير محددة', desc: 'يجب تحديد نوع الصيانة (دورية / طارئة) والحد المالي الذي يتجاوزه الالتزام إلى المؤجر.', action: 'اقتراح تعديل', actionFn: "suggestEdit('صيانة غير محددة')" },
  'تأمين مفقود': { type: 'risk', color: 'var(--red)', icon: '⚠', title: 'غياب بند التأمين', desc: 'يُنصح بإضافة بند يُلزم المستأجر بالتأمين على المحل ضد الحريق والسرقة.', action: 'إضافة من المكتبة', actionFn: "showPanel('clauses')" },
  'تجديد تلقائي': { type: 'good', color: 'var(--green)', icon: '✓', title: 'تجديد تلقائي واضح', desc: 'مدة الإشعار ٩٠ يوماً معقولة وتتوافق مع المعيار التجاري المعمول به.', action: null }
};

function showHighlightDetail(key) {
  const detail = HIGHLIGHT_DETAILS[key];
  if (!detail) return;

  // Update detail panel
  const panel = document.getElementById('highlight-detail-panel');
  if (!panel) return;

  // Highlight the active card
  panel.querySelectorAll('.card').forEach(c => c.style.transform = '');
  const cards = panel.querySelectorAll('.card');
  cards.forEach(card => {
    const titleEl = card.querySelector('div[style*="font-weight:700"]');
    if (titleEl && titleEl.textContent.includes(detail.title.substring(0, 5))) {
      card.style.transform = 'scale(1.02)';
      card.style.boxShadow = '0 4px 20px rgba(0,0,0,.12)';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  showToast(`${detail.icon} ${detail.title}`, detail.type === 'risk' ? 'red' : detail.type === 'warn' ? 'amber' : 'green');
}

function filterHighlights(type) {
  // Update filter button states
  document.querySelectorAll('#panel-highlights .filter-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type || type === 'all');
  });

  // Show/hide highlight spans in doc
  const docPage = document.querySelector('#panel-highlights .doc-page');
  if (!docPage) return;

  docPage.querySelectorAll('.highlight-risk, .highlight-warn, .highlight-good').forEach(span => {
    if (type === 'all') { span.style.opacity = '1'; return; }
    const isRisk = span.classList.contains('highlight-risk');
    const isWarn = span.classList.contains('highlight-warn');
    const isGood = span.classList.contains('highlight-good');
    span.style.opacity = (type === 'risk' && isRisk) || (type === 'warn' && isWarn) || (type === 'good' && isGood) ? '1' : '0.2';
  });

  // Show/hide detail cards
  const detailPanel = document.getElementById('highlight-detail-panel');
  if (!detailPanel) return;
  detailPanel.querySelectorAll('.card').forEach(card => {
    if (type === 'all') { card.style.display = ''; return; }
    const borderColor = card.style.borderInlineStart || card.style.borderLeft || '';
    const isRisk = borderColor.includes('red');
    const isWarn = borderColor.includes('amber') || borderColor.includes('gold');
    const isGood = borderColor.includes('green');
    card.style.display = (type === 'risk' && isRisk) || (type === 'warn' && isWarn) || (type === 'good' && isGood) ? '' : 'none';
  });
}

function exportHighlights() {
  showToast('جارٍ تصدير التقرير...', 'blue');
  setTimeout(() => showToast('تم تصدير تقرير التمييز الذكي ✓', 'green'), 1500);
}

/* ═══════════════════════════════════════════════
   INIT: Wire up all Phase 3 interactions
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── VAULT: Wire search input ──
  const vaultPanel = document.getElementById('panel-vault');
  if (vaultPanel) {
    // Wire search
    const searchInput = vaultPanel.querySelector('input[placeholder*="ابحث"]');
    if (searchInput) {
      searchInput.id = 'vault-search';
      searchInput.addEventListener('input', e => vaultSearch(e.target.value));
    }

    // Wire filter select
    const filterSelect = vaultPanel.querySelector('select');
    if (filterSelect) {
      filterSelect.addEventListener('change', e => vaultFilterByType(e.target.value));
    }

    // Wire upload button
    const uploadBtn = vaultPanel.querySelector('button[onclick*="vault-upload"]');
    if (uploadBtn) {
      uploadBtn.setAttribute('onclick', 'showUploadModal()');
    }

    // Wire action buttons in preview toolbar
    const riskBtn = vaultPanel.querySelector('button[onclick*="risk"]');
    // Already wired

    // Render list and populate preview with first document
    renderVaultList(VAULT_DOCS);
    // Populate preview with first document on load
    const firstDoc = VAULT_DOCS[0];
    const titleEl = document.getElementById('vault-doc-title');
    const bodyEl = document.getElementById('vault-doc-body');
    if (titleEl) titleEl.textContent = firstDoc.name;
    if (bodyEl) bodyEl.innerHTML = firstDoc.content;
  }

  // ── Q&A: Wire suggested questions ──
  const qaPanel = document.getElementById('panel-qa');
  if (qaPanel) {
    // Replace static suggested questions with dynamic ones
    const suggestedWrap = qaPanel.querySelector('.chat-input-wrap > div');
    if (suggestedWrap) {
      suggestedWrap.innerHTML = SUGGESTED_QUESTIONS.map(q =>
        `<button class="btn btn-ghost btn-sm" onclick="insertQuestion(this)">${q}</button>`
      ).join('');
    }
    // Auto-resize textarea
    const textarea = document.getElementById('chat-input');
    if (textarea) {
      textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });
    }
  }

  // ── RISK: ESC key closes any open modal ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('suggest-edit-modal')?.remove();
      document.getElementById('law-ref-modal')?.remove();
    }
  });

  // ── HIGHLIGHTS: Add filter toolbar and export button ──
  const highlightsPanel = document.getElementById('panel-highlights');
  if (highlightsPanel) {
    const secRow = highlightsPanel.querySelector('.sec-row');
    if (secRow) {
      // Add filter buttons and export
      const filterBar = document.createElement('div');
      filterBar.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:16px';
      filterBar.innerHTML = `
        <button class="btn btn-ghost btn-sm filter-tab active" data-type="all" onclick="filterHighlights('all')">الكل</button>
        <button class="btn btn-ghost btn-sm filter-tab" data-type="risk" onclick="filterHighlights('risk')" style="color:var(--red)">⚠ مخاطر</button>
        <button class="btn btn-ghost btn-sm filter-tab" data-type="warn" onclick="filterHighlights('warn')" style="color:var(--amber)">⚡ تحذيرات</button>
        <button class="btn btn-ghost btn-sm filter-tab" data-type="good" onclick="filterHighlights('good')" style="color:var(--green)">✓ إيجابيات</button>
        <button class="btn btn-primary btn-sm" style="margin-inline-start:auto" onclick="exportHighlights()">تصدير التقرير</button>`;
      secRow.insertAdjacentElement('afterend', filterBar);
    }

    // Wire highlight spans
    highlightsPanel.querySelectorAll('.highlight-risk, .highlight-warn, .highlight-good').forEach(span => {
      span.style.cursor = 'pointer';
      span.style.transition = 'opacity .2s';
    });

    // Wire "اقتراح تعديل" buttons in detail panel
    const detailPanel = document.getElementById('highlight-detail-panel');
    if (detailPanel) {
      detailPanel.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('اقتراح تعديل')) {
          btn.setAttribute('onclick', 'suggestEdit()');
        }
      });
    }
  }
});
