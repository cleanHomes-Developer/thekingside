/* ═══════════════════════════════════════════════════════════
   MEEZAN — Comprehensive Panel Interactions v2
   Every panel, card, tab, and button wired up
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════════════
     VAULT PANEL
  ══════════════════════════════════════════════ */
  // Filter button
  const vaultFilterBtn = document.querySelector('#panel-vault .btn-ghost');
  if (vaultFilterBtn && vaultFilterBtn.textContent.trim() === 'فلترة') {
    const types = ['الكل', 'عقود', 'مراسلات', 'تقارير', 'صكوك'];
    let idx = 0;
    vaultFilterBtn.addEventListener('click', function () {
      idx = (idx + 1) % types.length;
      this.textContent = idx === 0 ? 'فلترة' : 'فلترة: ' + types[idx];
      showToast('تصفية: ' + types[idx], 'blue');
    });
  }
  // Download button
  document.querySelectorAll('#panel-vault .btn-primary').forEach(btn => {
    if (btn.textContent.trim() === 'تحميل') {
      btn.addEventListener('click', () => showToast('جارٍ تحميل المستند...', 'blue'));
    }
  });
  // Vault item double-click to open
  document.querySelectorAll('.vault-item').forEach(item => {
    item.addEventListener('dblclick', function () {
      const name = this.querySelector('.vi-name')?.textContent || 'المستند';
      showToast('فتح: ' + name, 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     Q&A PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-qa .btn-ghost').forEach(btn => {
    if (btn.textContent.includes('محادثة جديدة')) {
      btn.addEventListener('click', function () {
        const msgs = document.getElementById('chat-msgs');
        if (msgs) {
          msgs.innerHTML = `<div class="msg ai"><div class="msg-bubble">مرحباً! أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك اليوم؟</div></div>`;
          showToast('تم بدء محادثة جديدة', 'blue');
        }
      });
    }
  });

  /* ══════════════════════════════════════════════
     RISK PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-risk .btn-ghost').forEach(btn => {
    if (btn.textContent.includes('اقتراح تعديل')) {
      btn.addEventListener('click', function () {
        showToast('جارٍ توليد اقتراح التعديل...', 'blue');
        setTimeout(() => showToast('تم توليد ٣ اقتراحات تعديل ✓', 'green'), 1400);
      });
    }
    if (btn.textContent.includes('عرض القانون')) {
      btn.addEventListener('click', () => showToast('فتح نص القانون المرجعي...', 'blue'));
    }
  });

  /* ══════════════════════════════════════════════
     CLAUSE LIBRARY PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-clauses .btn-ghost').forEach(btn => {
    if (btn.textContent.trim() === 'نسخ') {
      btn.addEventListener('click', function () {
        showToast('تم نسخ البند ✓', 'green');
      });
    }
  });
  document.querySelectorAll('#panel-clauses .btn-primary').forEach(btn => {
    if (btn.textContent.includes('إضافة للعقد')) {
      btn.addEventListener('click', () => showToast('تمت إضافة البند إلى العقد ✓', 'green'));
    }
  });

  /* ══════════════════════════════════════════════
     PLAYBOOKS PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-playbooks .btn-primary').forEach(btn => {
    if (btn.textContent.includes('إنشاء Playbook')) {
      btn.addEventListener('click', function () {
        showToast('جارٍ إنشاء Playbook جديد...', 'blue');
        setTimeout(() => showToast('تم إنشاء Playbook بنجاح ✓', 'green'), 1200);
      });
    }
    if (btn.textContent.trim() === 'تطبيق') {
      btn.addEventListener('click', function () {
        const step = this.closest('div')?.querySelector('div:first-child')?.textContent || 'الخطوة';
        showToast('تم تطبيق الخطوة ✓', 'green');
      });
    }
  });
  document.querySelectorAll('#panel-playbooks .btn-ghost').forEach(btn => {
    if (btn.textContent.trim() === 'معاينة') {
      btn.addEventListener('click', () => showToast('عرض معاينة الخطوة...', 'blue'));
    }
  });

  /* ══════════════════════════════════════════════
     COURTS PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-courts .btn-primary').forEach(btn => {
    if (btn.textContent.trim() === 'بحث') {
      btn.addEventListener('click', function () {
        const input = document.querySelector('#panel-courts .form-input');
        const q = input ? input.value.trim() : '';
        if (!q) { showToast('يرجى إدخال كلمة بحث', 'red'); return; }
        showToast('جارٍ البحث في أحكام المحاكم...', 'blue');
        setTimeout(() => showToast('تم العثور على ٥ أحكام مطابقة ✓', 'green'), 1000);
      });
    }
  });
  document.querySelectorAll('#panel-courts .btn-ghost').forEach(btn => {
    if (btn.textContent.includes('عرض كامل')) {
      btn.addEventListener('click', () => showToast('جارٍ تحميل نص الحكم الكامل...', 'blue'));
    }
  });
  // Court cards — click to select
  document.querySelectorAll('.court-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      document.querySelectorAll('.court-card').forEach(c => c.style.borderColor = 'var(--gray-3)');
      this.style.borderColor = 'var(--cyan)';
      const title = this.querySelector('div')?.textContent || 'الحكم';
      showToast('تم تحديد: ' + title.substring(0, 30) + '...', 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     SOL CALCULATOR PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-sol .btn-ghost').forEach(btn => {
    if (btn.textContent.includes('حفظ في المواعيد')) {
      btn.addEventListener('click', function () {
        const dateEl = document.getElementById('sol-date');
        if (dateEl && dateEl.textContent !== '—') {
          showToast('تم حفظ موعد التقادم في لوحة المواعيد ✓', 'green');
        } else {
          showToast('يرجى احتساب التقادم أولاً', 'red');
        }
      });
    }
  });

  /* ══════════════════════════════════════════════
     SHARIA PANEL
  ══════════════════════════════════════════════ */
  const shariaDrop = document.querySelector('#panel-sharia .drop-zone');
  if (shariaDrop) {
    shariaDrop.removeAttribute('onclick');
    shariaDrop.style.cursor = 'pointer';
    shariaDrop.addEventListener('click', function () {
      showToast('جارٍ رفع المستند للفحص الشرعي...', 'blue');
      setTimeout(() => showToast('اكتمل الفحص الشرعي: متوافق ✓', 'green'), 1800);
    });
    ['dragover', 'dragenter'].forEach(e =>
      shariaDrop.addEventListener(e, ev => { ev.preventDefault(); shariaDrop.classList.add('drag-over'); })
    );
    ['dragleave', 'drop'].forEach(e =>
      shariaDrop.addEventListener(e, ev => {
        ev.preventDefault();
        shariaDrop.classList.remove('drag-over');
        if (e === 'drop' && ev.dataTransfer.files.length) {
          showToast('جارٍ فحص المستند شرعياً...', 'blue');
          setTimeout(() => showToast('اكتمل الفحص الشرعي: متوافق ✓', 'green'), 1800);
        }
      })
    );
  }

  /* ══════════════════════════════════════════════
     ISLAMIC FINANCE PANEL
  ══════════════════════════════════════════════ */
  // Product cards — click to select
  const islamicProducts = {
    'المرابحة': 'المرابحة: بيع بالتكلفة الأصلية مضافاً إليها هامش ربح محدد ومتفق عليه. يُستخدم في تمويل الأصول والسلع.',
    'المضاربة': 'المضاربة: شراكة بين صاحب رأس المال ورب المال والعامل. الأرباح تُوزع وفق نسبة متفق عليها، والخسارة على رأس المال.',
    'الإجارة المنتهية بالتمليك': 'الإجارة المنتهية بالتمليك: تأجير الأصل مع وعد بنقل الملكية عند انتهاء مدة الإجارة وسداد جميع الأقساط.'
  };
  document.querySelectorAll('#panel-islamic .card').forEach(card => {
    const title = card.querySelector('[style*="font-weight:700"]')?.textContent?.trim();
    if (islamicProducts[title]) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () {
        document.querySelectorAll('#panel-islamic .card').forEach(c => {
          c.style.borderColor = 'var(--gray-3)';
          c.style.background = 'var(--white)';
        });
        this.style.borderColor = 'var(--gold)';
        this.style.background = 'rgba(245,181,68,.04)';
        const descEl = document.getElementById('islamic-product-desc');
        if (descEl) {
          descEl.textContent = islamicProducts[title];
          descEl.style.display = 'block';
        } else {
          showToast(title + ' — تم التحديد', 'blue');
        }
      });
    }
  });
  // Generate Islamic contract
  document.querySelectorAll('#panel-islamic .btn-primary').forEach(btn => {
    if (btn.textContent.includes('توليد العقد الإسلامي')) {
      btn.addEventListener('click', function () {
        btn.disabled = true;
        btn.textContent = 'جارٍ التوليد...';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = 'توليد العقد الإسلامي';
          showToast('تم توليد عقد التمويل الإسلامي بنجاح ✓', 'green');
        }, 1600);
      });
    }
  });

  /* ══════════════════════════════════════════════
     WRITING QUALITY PANEL
  ══════════════════════════════════════════════ */
  const writingActions = {
    'تصحيح إملائي': 'جارٍ التصحيح الإملائي...',
    'تحسين الأسلوب': 'جارٍ تحسين الأسلوب...',
    'توحيد المصطلحات': 'جارٍ توحيد المصطلحات القانونية...',
    'فحص النحو': 'جارٍ فحص النحو والصرف...',
    'تبسيط اللغة': 'جارٍ تبسيط اللغة...'
  };
  document.querySelectorAll('#panel-writing .we-btn').forEach(btn => {
    const action = writingActions[btn.textContent.trim()];
    if (action) {
      btn.addEventListener('click', function () {
        showToast(action, 'blue');
        setTimeout(() => showToast('اكتملت العملية ✓', 'green'), 1200);
      });
    }
  });
  // Wire analyze button (in case id not set)
  document.querySelectorAll('#panel-writing .btn-primary').forEach(btn => {
    if (btn.textContent.includes('تحليل النص') && !btn.id) {
      btn.id = 'analyze-btn-writing';
      btn.addEventListener('click', function () {
        const area = document.querySelector('.we-area');
        const scoreEl = document.getElementById('writing-score-num');
        if (!area || !scoreEl) return;
        const text = area.innerText || '';
        if (text.trim().length < 10) { showToast('يرجى كتابة نص أطول للتحليل', 'red'); return; }
        btn.disabled = true; btn.textContent = 'جارٍ التحليل...';
        setTimeout(() => {
          const score = Math.floor(Math.random() * 20) + 75;
          scoreEl.textContent = score;
          document.querySelectorAll('.writing-progress').forEach(b => {
            b.style.width = (Math.floor(Math.random() * 25) + 70) + '%';
          });
          btn.disabled = false; btn.textContent = 'تحليل النص';
          showToast('تم تحليل النص: الدرجة ' + score + '/١٠٠', 'green');
        }, 1200);
      });
    }
  });

  /* ══════════════════════════════════════════════
     GAZETTE PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-gazette .btn-primary').forEach(btn => {
    if (btn.textContent.includes('إعداد تنبيهات')) {
      btn.addEventListener('click', () => showToast('تم إعداد تنبيهات الجريدة الرسمية ✓', 'green'));
    }
  });
  // Gazette items — click to read
  document.querySelectorAll('.gazette-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function () {
      const title = this.querySelector('.gi-title')?.textContent || 'التشريع';
      showToast('فتح: ' + title.substring(0, 40) + '...', 'blue');
    });
  });
  // Country selector
  const gazetteSelect = document.querySelector('#panel-gazette .form-select');
  if (gazetteSelect) {
    gazetteSelect.addEventListener('change', function () {
      showToast('تم تغيير الجريدة الرسمية: ' + this.value, 'blue');
    });
  }

  /* ══════════════════════════════════════════════
     HIJRI CALENDAR PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-hijri .btn-primary').forEach(btn => {
    if (btn.textContent.includes('إضافة موعد')) {
      btn.addEventListener('click', () => showToast('تمت إضافة الموعد إلى لوحة المواعيد ✓', 'green'));
    }
  });
  document.querySelectorAll('#panel-hijri .cal-nav button').forEach((btn, i) => {
    btn.addEventListener('click', () => navHijri(i === 0 ? 1 : -1));
  });
  // Hijri calendar day click
  document.querySelectorAll('.cal-day:not(.empty)').forEach(day => {
    day.style.cursor = 'pointer';
    day.addEventListener('click', function () {
      document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
      this.classList.add('selected');
      showToast('تم تحديد: ' + this.textContent + ' رمضان ١٤٤٧', 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     MATTERS PANEL
  ══════════════════════════════════════════════ */
  // Filter tabs
  document.querySelectorAll('#panel-matters .btn-ghost, #panel-matters .btn-primary').forEach(btn => {
    const txt = btn.textContent.trim();
    if (txt.includes('نشطة') || txt.includes('معلقة') || txt.includes('مغلقة') || txt.includes('الكل')) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#panel-matters .btn-ghost, #panel-matters .btn-primary').forEach(b => {
          if (b.textContent.includes('نشطة') || b.textContent.includes('معلقة') || b.textContent.includes('مغلقة') || b.textContent.includes('الكل')) {
            b.className = 'btn btn-ghost btn-sm';
          }
        });
        this.className = 'btn btn-primary btn-sm';
        showToast('تصفية: ' + txt, 'blue');
      });
    }
  });
  // Matter cards — click to open
  document.querySelectorAll('.matter-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      const title = this.querySelector('.mc-title')?.textContent || 'القضية';
      showToast('فتح ملف: ' + title, 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     DEADLINES PANEL
  ══════════════════════════════════════════════ */
  // Reminder and details buttons
  document.querySelectorAll('#panel-deadlines .btn-ghost').forEach(btn => {
    if (btn.textContent.trim() === 'تذكير') {
      btn.addEventListener('click', function () {
        showToast('تم ضبط التذكير ✓', 'green');
      });
    }
    if (btn.textContent.trim() === 'تفاصيل') {
      btn.addEventListener('click', function () {
        showToast('فتح تفاصيل الموعد...', 'blue');
      });
    }
  });

  /* ══════════════════════════════════════════════
     BILLING PANEL
  ══════════════════════════════════════════════ */
  // Create invoice (if not already wired)
  document.querySelectorAll('#panel-billing .btn-ghost').forEach(btn => {
    if (btn.textContent.includes('إنشاء فاتورة') && !btn.getAttribute('onclick')) {
      btn.addEventListener('click', function () {
        showToast('جارٍ إنشاء الفاتورة...', 'blue');
        setTimeout(() => showToast('تم إنشاء الفاتورة بنجاح ✓', 'green'), 800);
      });
    }
  });
  // Invoice items — click to view
  document.querySelectorAll('.billing-invoice').forEach(inv => {
    inv.style.cursor = 'pointer';
    inv.addEventListener('click', function () {
      const num = this.querySelector('.inv-num')?.textContent || 'الفاتورة';
      showToast('فتح: ' + num, 'blue');
    });
  });
  // Time entries — click to edit
  document.querySelectorAll('.time-entry').forEach(entry => {
    entry.style.cursor = 'pointer';
    entry.addEventListener('click', function () {
      showToast('تعديل سجل الوقت...', 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     DATA ROOM PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-dataroom .btn-primary').forEach(btn => {
    if (btn.textContent.includes('رفع ملفات')) {
      btn.addEventListener('click', function () {
        showToast('جارٍ رفع الملفات...', 'blue');
        setTimeout(() => showToast('تم رفع الملفات بنجاح ✓', 'green'), 1200);
      });
    }
  });
  document.querySelectorAll('#panel-dataroom .btn-ghost').forEach(btn => {
    if (btn.textContent.includes('إدارة الصلاحيات')) {
      btn.addEventListener('click', () => showToast('فتح لوحة إدارة الصلاحيات...', 'blue'));
    }
    if (btn.textContent.trim() === 'قائمة') {
      btn.addEventListener('click', function () {
        const grid = document.querySelector('#panel-dataroom .dr-file-grid');
        if (grid) grid.style.gridTemplateColumns = '1fr';
        showToast('عرض القائمة', 'blue');
      });
    }
    if (btn.textContent.trim() === 'شبكة') {
      btn.addEventListener('click', function () {
        const grid = document.querySelector('#panel-dataroom .dr-file-grid');
        if (grid) grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(140px,1fr))';
        showToast('عرض الشبكة', 'blue');
      });
    }
  });
  // File cards — click to open
  document.querySelectorAll('.dr-file').forEach(file => {
    if (!file.style.border?.includes('dashed')) {
      file.style.cursor = 'pointer';
      file.addEventListener('click', function () {
        document.querySelectorAll('.dr-file').forEach(f => f.style.borderColor = 'var(--gray-3)');
        this.style.borderColor = 'var(--cyan)';
        const name = this.querySelector('.dr-file-name')?.textContent || 'الملف';
        showToast('فتح: ' + name, 'blue');
      });
    } else {
      // Upload placeholder
      file.addEventListener('click', function () {
        showToast('جارٍ رفع ملف جديد...', 'blue');
        setTimeout(() => showToast('تم رفع الملف بنجاح ✓', 'green'), 1000);
      });
    }
  });
  // Folder tree — click to navigate
  document.querySelectorAll('.dr-folder').forEach(folder => {
    folder.style.cursor = 'pointer';
    folder.addEventListener('click', function () {
      document.querySelectorAll('.dr-folder').forEach(f => f.classList.remove('active'));
      this.classList.add('active');
      const name = this.textContent.trim();
      const header = document.getElementById('dr-folder-name');
      if (header) header.textContent = name;
      showToast('فتح مجلد: ' + name, 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     CLIENT PORTAL PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-portal .btn-primary').forEach(btn => {
    if (btn.textContent.includes('إضافة عميل')) {
      btn.addEventListener('click', function () {
        showToast('جارٍ إنشاء بوابة عميل جديدة...', 'blue');
        setTimeout(() => {
          const grid = document.querySelector('.portal-grid');
          if (grid) {
            const names = ['شركة الأمل للاستثمار', 'مؤسسة الرواد', 'مجموعة الخليج التجارية'];
            const letters = ['أ', 'ر', 'خ'];
            const colors = ['rgba(89,189,230,.15)', 'rgba(245,181,68,.15)', 'rgba(220,53,69,.1)'];
            const textColors = ['var(--cyan-vivid)', 'var(--gold)', 'var(--red)'];
            const idx = Math.floor(Math.random() * 3);
            const card = document.createElement('div');
            card.className = 'portal-client';
            card.style.cursor = 'pointer';
            card.innerHTML = `
              <div class="pc-av" style="background:${colors[idx]};color:${textColors[idx]}">${letters[idx]}</div>
              <div class="pc-name">${names[idx]}</div>
              <div class="pc-type">عميل جديد · نشط</div>
              <div class="pc-stats">
                <div class="pc-stat"><div class="pc-stat-n">٠</div><div class="pc-stat-l">قضايا</div></div>
                <div class="pc-stat"><div class="pc-stat-n">٠</div><div class="pc-stat-l">وثائق</div></div>
                <div class="pc-stat"><div class="pc-stat-n">٠ د.أ.</div><div class="pc-stat-l">مستحق</div></div>
              </div>`;
            card.addEventListener('click', () => showToast('فتح ملف: ' + names[idx], 'blue'));
            grid.appendChild(card);
          }
          showToast('تم إنشاء بوابة العميل ✓', 'green');
        }, 1000);
      });
    }
  });
  // Existing client cards — click to open
  document.querySelectorAll('.portal-client').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      const name = this.querySelector('.pc-name')?.textContent || 'العميل';
      showToast('فتح ملف: ' + name, 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     API PANEL
  ══════════════════════════════════════════════ */
  // Generate API key
  document.querySelectorAll('#panel-api .btn-primary').forEach(btn => {
    if (btn.textContent.includes('إنشاء مفتاح API')) {
      btn.addEventListener('click', function () {
        const key = 'mk_live_' + Math.random().toString(36).substr(2, 32);
        showToast('تم إنشاء مفتاح API: ' + key.substr(0, 20) + '...', 'green');
      });
    }
  });
  // API nav items — click to switch section
  document.querySelectorAll('.api-nav-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function () {
      document.querySelectorAll('.api-nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      showToast('القسم: ' + this.textContent, 'blue');
    });
  });
  // Copy code buttons
  document.querySelectorAll('.api-endpoint').forEach(endpoint => {
    const header = endpoint.querySelector('.api-path');
    if (header) {
      header.style.cursor = 'pointer';
      header.title = 'انقر لنسخ الكود';
      header.addEventListener('click', function () {
        const block = endpoint.querySelector('.code-block');
        if (block) {
          navigator.clipboard?.writeText(block.innerText).catch(() => {});
          showToast('تم نسخ الكود ✓', 'green');
        }
      });
    }
  });

  /* ══════════════════════════════════════════════
     WHITE-LABEL PANEL
  ══════════════════════════════════════════════ */
  // Apply customization
  document.querySelectorAll('#panel-whitelabel .btn-primary').forEach(btn => {
    if (btn.textContent.includes('تطبيق التخصيص')) {
      btn.addEventListener('click', function () {
        btn.disabled = true;
        btn.textContent = 'جارٍ التطبيق...';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = 'تطبيق التخصيص';
          showToast('تم تطبيق تخصيصات العلامة التجارية ✓', 'green');
        }, 1400);
      });
    }
  });
  // Color picker — live preview
  const colorPicker = document.querySelector('#panel-whitelabel input[type="color"]');
  if (colorPicker) {
    colorPicker.addEventListener('input', function () {
      showToast('معاينة اللون: ' + this.value, 'blue');
    });
  }
  // White-label drop zone
  const wlDrop = document.querySelector('#panel-whitelabel .drop-zone');
  if (wlDrop) {
    wlDrop.style.cursor = 'pointer';
    wlDrop.addEventListener('click', () => showToast('جارٍ رفع الشعار...', 'blue'));
  }

  /* ══════════════════════════════════════════════
     SETTINGS PANEL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('#panel-settings .btn-ghost').forEach(btn => {
    if (btn.textContent.includes('إلغاء')) {
      btn.addEventListener('click', () => showToast('تم إلغاء التغييرات', 'amber'));
    }
  });
  // Settings nav items — click to switch tab
  document.querySelectorAll('.settings-nav-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function () {
      document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      showToast('القسم: ' + this.textContent, 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     NOTIFICATIONS PANEL
  ══════════════════════════════════════════════ */
  // Notification items — click to mark read
  document.querySelectorAll('.notif-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function () {
      this.classList.remove('unread');
      const dot = this.querySelector('.notif-dot');
      if (dot) dot.remove();
    });
  });

  /* ══════════════════════════════════════════════
     DASHBOARD PANEL
  ══════════════════════════════════════════════ */
  // Stat cards — hover effect already in CSS, add click
  document.querySelectorAll('.stat-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      const label = this.querySelector('.sc-lbl')?.textContent || '';
      showToast('عرض تفاصيل: ' + label, 'blue');
    });
  });

  /* ══════════════════════════════════════════════
     GLOBAL: form inputs — Enter key navigation
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const form = this.closest('.card, .panel');
        const btn = form?.querySelector('.btn-primary');
        if (btn && !btn.disabled) btn.click();
      }
    });
  });

  /* ══════════════════════════════════════════════
     GLOBAL: table rows — click to select
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.data-table tbody tr').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function () {
      document.querySelectorAll('.data-table tbody tr').forEach(r => r.style.background = '');
      this.style.background = 'rgba(89,189,230,.06)';
    });
  });

  console.log('[Meezan] All interactions v2 initialized ✓');
});
