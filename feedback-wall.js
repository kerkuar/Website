/* ============================================================
   Workshop feedback wall — fetches testimonials from Supabase,
   shows featured ones first, lets visitors submit new ones.
   ============================================================
   If Supabase isn't configured (URL/key still placeholders),
   we fall back to FEEDBACK_SEEDS from supabase-config.js and
   disable the submission form with a friendly note.
*/
(function () {
    const cfg = window.SUPABASE_CONFIG || {};
    const seeds = window.FEEDBACK_SEEDS || [];
    const isConfigured =
        cfg.url && cfg.anonKey &&
        !cfg.url.includes('YOUR_SUPABASE') &&
        !cfg.anonKey.includes('YOUR_SUPABASE');

    const featuredEl = document.getElementById('featuredTestimonials');
    const gridEl     = document.getElementById('allTestimonials');
    const moreBtn    = document.getElementById('showMoreBtn');
    const form       = document.getElementById('testimonialForm');
    const submitBtn  = document.getElementById('tSubmit');
    const statusEl   = document.getElementById('tStatus');
    const disabledNoteEl = document.getElementById('feedbackDisabledNote');

    /* ------- helpers ------- */
    const esc = s => String(s || '')
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');

    function metaLine(t) {
        const role = t.role_org ? `<span class="testimonial-role">, ${esc(t.role_org)}</span>` : '';
        const ws   = t.workshop ? `<span class="testimonial-workshop">${esc(t.workshop)}</span>` : '';
        return `<span class="testimonial-name">${esc(t.name)}</span>${role}${ws}`;
    }

    function renderTestimonial(t) {
        const featCls = t.featured ? ' featured' : '';
        return `
            <div class="testimonial${featCls}">
                <div class="testimonial-body">${esc(t.body)}</div>
                <div class="testimonial-meta">${metaLine(t)}</div>
            </div>`;
    }

    /* ------- render ------- */
    const VISIBLE_COUNT = 6;
    function renderAll(list) {
        const featured = list.filter(t => t.featured).slice(0, 2);
        const regular  = list.filter(t => !t.featured);

        if (featured.length) {
            featuredEl.hidden = false;
            featuredEl.innerHTML = featured.map(renderTestimonial).join('');
        } else {
            featuredEl.hidden = true;
            featuredEl.innerHTML = '';
        }

        if (!regular.length && !featured.length) {
            gridEl.innerHTML = `
                <div class="feedback-empty" style="grid-column:1/-1;">
                    No notes yet. If you've worked with me, you'd be the first.
                </div>`;
            moreBtn.hidden = true;
            return;
        }

        const initial = regular.slice(0, VISIBLE_COUNT);
        gridEl.innerHTML = initial.map(renderTestimonial).join('');

        if (regular.length > VISIBLE_COUNT) {
            moreBtn.hidden = false;
            moreBtn.onclick = () => {
                gridEl.innerHTML = regular.map(renderTestimonial).join('');
                moreBtn.hidden = true;
            };
        } else {
            moreBtn.hidden = true;
        }
    }

    /* ------- fetch live ------- */
    async function fetchLive() {
        const url = `${cfg.url}/rest/v1/testimonials?select=*&approved=eq.true&order=featured.desc,created_at.desc`;
        const res = await fetch(url, {
            headers: {
                'apikey': cfg.anonKey,
                'Authorization': `Bearer ${cfg.anonKey}`
            }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    }

    async function load() {
        if (!isConfigured) {
            // Hide everything testimonial-related; show "coming soon" only.
            if (featuredEl) { featuredEl.hidden = true; featuredEl.innerHTML = ''; }
            if (moreBtn)    { moreBtn.hidden = true; }
            if (gridEl) {
                gridEl.innerHTML = `
                    <div class="feedback-empty" style="grid-column:1/-1;">
                        Coming soon.
                    </div>`;
            }
            const leaveNote = document.querySelector('.leave-note');
            if (leaveNote) leaveNote.hidden = true;
            return;
        }
        try {
            const data = await fetchLive();
            renderAll(data);
        } catch (e) {
            console.warn('Feedback wall: live fetch failed', e);
            if (gridEl) {
                gridEl.innerHTML = `
                    <div class="feedback-empty" style="grid-column:1/-1;">
                        Coming soon.
                    </div>`;
            }
        }
    }

    /* ------- submit ------- */
    async function submit(e) {
        e.preventDefault();
        if (!isConfigured) return;

        const payload = {
            name:     (form.tName.value || '').trim().slice(0, 80),
            role_org: (form.tRole.value || '').trim().slice(0, 120) || null,
            workshop: (form.tWorkshop.value || '').trim().slice(0, 140) || null,
            body:     (form.tBody.value || '').trim().slice(0, 1200)
        };
        const honeypot = (form.tHp.value || '').trim();

        if (!payload.name || !payload.body) {
            statusEl.className = 'form-status err';
            statusEl.textContent = 'Name and the note itself are needed.';
            return;
        }
        if (honeypot) {
            // silent reject
            statusEl.className = 'form-status ok';
            statusEl.textContent = 'Thanks.';
            form.reset();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
        statusEl.className = 'form-status';
        statusEl.textContent = '';

        try {
            const res = await fetch(`${cfg.url}/rest/v1/testimonials`, {
                method: 'POST',
                headers: {
                    'apikey': cfg.anonKey,
                    'Authorization': `Bearer ${cfg.anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `HTTP ${res.status}`);
            }
            const inserted = await res.json();
            const newEntry = Array.isArray(inserted) ? inserted[0] : inserted;

            // prepend the new one to the live grid so the user sees their entry instantly
            const current = Array.from(gridEl.querySelectorAll('.testimonial')).length;
            if (newEntry && current < VISIBLE_COUNT) {
                gridEl.insertAdjacentHTML('afterbegin', renderTestimonial(newEntry));
            } else {
                // re-fetch to keep order honest
                await load();
            }

            form.reset();
            statusEl.className = 'form-status ok';
            statusEl.textContent = 'Posted. Thanks — it’s live above.';
            if (window.showToast) window.showToast('Your note is up. Thank you.');
        } catch (err) {
            console.error(err);
            statusEl.className = 'form-status err';
            statusEl.textContent = 'Something went wrong. Try again, or email andi.shehu@gmail.com directly.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send note →';
        }
    }

    if (form) form.addEventListener('submit', submit);
    load();
})();
