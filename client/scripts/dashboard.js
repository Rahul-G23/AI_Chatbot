// Dashboard Script

checkAuthentication();

// Initialize dashboard
let currentUser = getUser();
let chatHistory = [];
let typingIndicatorElement = null;
let isSendingMessage = false;
let syllabusEntries = [];
let notesCache = [];
let studyPlansCache = [];
let studyTimerInterval = null;
let studySessionStart = null;
let savedStudySeconds = 0;
let studyTimeSaveInProgress = false;
let studySessionEnded = false;
const CHAT_HISTORY_STORAGE_KEY = 'examverse_chat_history';

function stopStudyTimer(resetState = true) {
    if (studyTimerInterval) {
        clearInterval(studyTimerInterval);
        studyTimerInterval = null;
    }

    if (resetState) {
        studySessionStart = null;
        studySessionEnded = false;
    }
}

function startStudyTimer(initialTotalSeconds = 0) {
    stopStudyTimer(false);

    savedStudySeconds = Number(initialTotalSeconds) || 0;
    studySessionStart = Date.now();
    studySessionEnded = false;

    updateStudyTimeDisplay();

    studyTimerInterval = setInterval(() => {
        updateStudyTimeDisplay();
    }, 1000);
}

function getCurrentSessionSeconds() {
    if (!studySessionStart) return 0;

    return Math.max(
        0,
        Math.floor((Date.now() - studySessionStart) / 1000)
    );
}

function getSelectedExamName() {
    const user = getUser();
    return user?.targetExam || 'NEET';
}

function renderSelectedExamSyllabus(items = []) {
    const list = document.getElementById('selectedExamSyllabusList');
    const count = document.getElementById('selectedExamSyllabusCount');

    if (!list) return;

    const uniqueSubjects = Array.from(new Set((items || []).map(item => item.subject).filter(Boolean)));
    if (count) {
        count.textContent = `${uniqueSubjects.length || 0} subjects`;
    }

    if (!uniqueSubjects.length) {
        list.innerHTML = '<p class="mini-subject-empty">No syllabus available.</p>';
        return;
    }

    list.innerHTML = uniqueSubjects.slice(0, 8).map(subject => `
        <button type="button" class="subject-overview-btn" data-subject="${escapeHtml(subject)}" aria-label="Open ${escapeHtml(subject)} syllabus">
            ${escapeHtml(subject)}
        </button>
    `).join('');
}

function updateStudyStreakDisplay(streakDays = 0) {
    const studyStreakElement = document.getElementById('studyStreak');
    if (!studyStreakElement) return;

    const safeDays = Math.max(0, Math.floor(Number(streakDays) || 0));
    studyStreakElement.textContent = `${safeDays} day${safeDays === 1 ? '' : 's'}`;
}

function setupSelectedExamSyllabusActions() {
    const list = document.getElementById('selectedExamSyllabusList');
    if (!list) return;

    list.addEventListener('click', (event) => {
        const button = event.target.closest('.subject-overview-btn');
        if (!button) return;

        const selectedSubject = button.getAttribute('data-subject') || '';
        if (!selectedSubject) return;

        const examName = getSelectedExamName();
        const examFilter = document.getElementById('examFilter');
        const syllabusSearch = document.getElementById('syllabusSearch');

        if (examFilter) {
            examFilter.value = examName;
        }

        if (syllabusSearch) {
            syllabusSearch.value = selectedSubject;
        }

        renderSyllabusSection();

        const syllabusMenuItem = document.querySelector('.menu-item[href="#syllabus"]');
        if (syllabusMenuItem) {
            syllabusMenuItem.click();
        }
    });
}

function renderUpcomingExamCountdown(countdown) {
    const countdownEl = document.getElementById('upcomingExamCountdown');
    const dateEl = document.getElementById('examDateLabel');

    if (!countdownEl) return;

    if (!countdown) {
        countdownEl.textContent = '—';
        if (dateEl) dateEl.textContent = 'No upcoming exam';
        return;
    }

    const days = Math.max(0, Number(countdown.daysRemaining) || 0);
    const hours = Math.max(0, Number(countdown.hoursRemaining) || 0);
    const examDate = countdown.examDate ? new Date(countdown.examDate) : null;

    countdownEl.textContent = `${days} days • ${hours} hours`;
    if (dateEl) {
        dateEl.textContent = examDate ? `Exam: ${examDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Exam date unavailable';
    }
}

function getTotalStudySeconds() {
    return savedStudySeconds + getCurrentSessionSeconds();
}

function formatStudyDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function updateStudyTimeDisplay() {
    const studyTimeElement = document.getElementById('studyTime');

    if (!studyTimeElement) return;

    studyTimeElement.textContent = formatStudyDuration(getTotalStudySeconds());
}

async function saveStudyTime() {
    if (!studySessionStart || studyTimeSaveInProgress || studySessionEnded) {
        return;
    }

    const sessionSeconds = getCurrentSessionSeconds();

    if (sessionSeconds <= 0) return;

    studyTimeSaveInProgress = true;
    studySessionEnded = true;

    if (studyTimerInterval) {
        clearInterval(studyTimerInterval);
        studyTimerInterval = null;
    }

    const token = getToken();

    if (!token) {
        studyTimeSaveInProgress = false;
        return;
    }

    try {
        await apiCall('/analytics/study-time', 'POST', {
            durationSeconds: sessionSeconds
        });

        savedStudySeconds += sessionSeconds;
        studySessionStart = null;

        updateStudyTimeDisplay();
    } catch (error) {
        console.error('Failed to save study time:', error);
    } finally {
        studyTimeSaveInProgress = false;
    }
}

function saveStudyTimeBeforeClose() {
    if (!studySessionStart || studySessionEnded) return;

    const sessionSeconds = getCurrentSessionSeconds();

    if (sessionSeconds <= 0) return;

    const token = getToken();

    if (!token) return;

    const payload = JSON.stringify({
        durationSeconds: sessionSeconds
    });

    // Keep the request alive while the page is closing.
    fetch('/api/analytics/study-time', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: payload,
        keepalive: true
    }).catch(error => {
        console.error('Failed to save study time before close:', error);
    });

    studySessionEnded = true;
}

window.saveStudyTimeBeforeClose = saveStudyTimeBeforeClose;
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupNavigation();
    setupLogout();
    setupSelectedExamSyllabusActions();
    await loadDashboardData();
    setupChatbot();
    await setupSyllabus();
    await setupStudyPlanning();
    setupThemeToggle();
    setupNotes();
    restoreChatHistory();

    window.addEventListener('beforeunload', saveStudyTimeBeforeClose);
    window.addEventListener('pagehide', saveStudyTimeBeforeClose);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveStudyTimeBeforeClose();
        }
    });
});

function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (prefersDark && !savedTheme)) {
        document.body.classList.add('dark-mode');
    }
}

function setupThemeToggle() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        });
    }
}

// Navigation
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');

    function showSectionBySelector(selector) {
        if (!selector) return;
        // Hide all sections
        sections.forEach(s => s.style.display = 'none');

        // Remove active from all items
        menuItems.forEach(m => m.classList.remove('active'));

        const section = document.querySelector(selector);
        if (section) {
            section.style.display = 'block';

            // If opening notes, refresh list
            if (selector === '#notes') {
                fetchAndRenderNotes();
            }

            // Find corresponding menu item and mark active
            const corresponding = Array.from(menuItems).find(mi => mi.getAttribute('href') === selector);
            if (corresponding) corresponding.classList.add('active');
        }
    }

    menuItems.forEach(item => {
        // Skip logout here; it has its own handler
        if (item.id === 'logoutBtn') return;

        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href') || '';

            // If this is an in-page anchor (hash), handle SPA navigation
            if (href.startsWith('#')) {
                e.preventDefault();
                showSectionBySelector(href);
                // update URL hash without scrolling
                history.replaceState(null, '', href);
                return;
            }

            // If it's a full route (e.g., /dashboard), let the browser navigate
        });
    });

    // If page opened with a hash, show that section; otherwise default to dashboard
    if (location.hash) {
        showSectionBySelector(location.hash);
    } else {
        showSectionBySelector('#dashboard');
    }
}

async function setupSyllabus() {
    const examFilter = document.getElementById('examFilter');
    const syllabusSearch = document.getElementById('syllabusSearch');
    const clearSyllabusFiltersBtn = document.getElementById('clearSyllabusFiltersBtn');

    if (examFilter) {
        examFilter.addEventListener('change', renderSyllabusSection);
    }

    if (syllabusSearch) {
        syllabusSearch.addEventListener('input', renderSyllabusSection);
    }

    if (clearSyllabusFiltersBtn) {
        clearSyllabusFiltersBtn.addEventListener('click', () => {
            if (examFilter) {
                examFilter.value = '';
            }

            if (syllabusSearch) {
                syllabusSearch.value = '';
            }

            renderSyllabusSection();
        });
    }

    try {
        const response = await apiCall('/syllabus');
        if (response.success) {
            syllabusEntries = response.syllabuses || [];
            renderSyllabusSection();
        }
    } catch (error) {
        console.error('Failed to load syllabuses:', error);
        syllabusEntries = [];
        renderSyllabusSection();
    }
}

async function setupStudyPlanning() {
    const studyPlanForm = document.getElementById('studyPlanForm');
    const studyPlanExam = document.getElementById('studyPlanExam');
    const studyPlanTargetDate = document.getElementById('studyPlanTargetDate');
    const studyPlanWeakSubjects = document.getElementById('studyPlanWeakSubjects');
    const studyPlanHours = document.getElementById('studyPlanHours');

    if (studyPlanExam && !studyPlanExam.value) {
        studyPlanExam.value = getSelectedExamName();
    }

    if (studyPlanTargetDate) {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        studyPlanTargetDate.value = defaultDate.toISOString().split('T')[0];
    }

    if (studyPlanForm) {
        studyPlanForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const examName = studyPlanExam?.value || getSelectedExamName();
            const targetDate = studyPlanTargetDate?.value;
            const weakSubjects = (studyPlanWeakSubjects?.value || '')
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
            const dailyStudyHours = Number(studyPlanHours?.value || 0);
            const status = document.getElementById('studyPlanStatus');

            if (!targetDate || !Number.isFinite(dailyStudyHours) || dailyStudyHours <= 0) {
                if (status) status.textContent = 'Please choose a valid target date and daily study hours.';
                return;
            }

            try {
                if (status) status.textContent = 'Generating your study plan...';

                const response = await apiCall('/studyPlan', 'POST', {
                    examName,
                    targetDate,
                    weakSubjects,
                    dailyStudyHours
                });

                if (response.success) {
                    if (status) status.textContent = 'Study plan created successfully.';
                    studyPlanForm.reset();
                    if (studyPlanExam) studyPlanExam.value = examName;
                    if (studyPlanHours) studyPlanHours.value = 4;
                    if (studyPlanTargetDate) {
                        const nextDate = new Date();
                        nextDate.setDate(nextDate.getDate() + 30);
                        studyPlanTargetDate.value = nextDate.toISOString().split('T')[0];
                    }
                    await loadStudyPlans();
                }
            } catch (error) {
                console.error('Failed to create study plan:', error);
                if (status) status.textContent = 'Could not create study plan. Please try again.';
            }
        });
    }

    await loadStudyPlans();
}

async function loadStudyPlans() {
    const studyPlanList = document.getElementById('studyPlanList');
    const status = document.getElementById('studyPlanStatus');

    try {
        const response = await apiCall('/studyPlan');
        if (response.success) {
            studyPlansCache = Array.isArray(response.studyPlans) ? response.studyPlans : [];
            renderStudyPlans();
            if (status) status.textContent = studyPlansCache.length ? 'Loaded your study plans.' : 'Create a plan to see your weekly targets and milestones.';
            return;
        }
    } catch (error) {
        console.error('Failed to fetch study plans:', error);
    }

    studyPlansCache = [];
    if (studyPlanList) {
        studyPlanList.innerHTML = '<p class="study-plan-empty">No study plans yet.</p>';
    }
    if (status) status.textContent = 'Could not load study plans.';
}

function renderStudyPlans() {
    const studyPlanList = document.getElementById('studyPlanList');
    if (!studyPlanList) return;

    if (!studyPlansCache.length) {
        studyPlanList.innerHTML = '<p class="study-plan-empty">No study plans yet.</p>';
        return;
    }

    studyPlanList.innerHTML = studyPlansCache.map((plan, index) => {
        const milestones = Array.isArray(plan.milestones) ? plan.milestones : [];
        const completedMilestones = milestones.filter(milestone => milestone.completed).length;
        const schedule = Array.isArray(plan.schedule) ? plan.schedule.slice(0, 3) : [];
        const weakSubjects = Array.isArray(plan.weakSubjects) ? plan.weakSubjects.join(', ') : 'None';

        return `
            <article class="study-plan-item" data-plan-id="${plan._id || ''}">
                <div class="study-plan-item-header">
                    <h3>${escapeHtml(plan.examName || 'Study Plan')}</h3>
                    <span class="study-plan-badge">${completedMilestones}/${milestones.length || 0} milestones</span>
                </div>
                <p class="study-plan-meta">Target date: ${plan.targetDate ? new Date(plan.targetDate).toLocaleDateString() : 'Not set'} · Daily hours: ${plan.dailyStudyHours ?? '-'} · Remaining days: ${plan.remainingDays ?? '-'}</p>
                <p class="study-plan-summary"><strong>Weak subjects:</strong> ${escapeHtml(weakSubjects)}</p>
                <p class="study-plan-schedule"><strong>Schedule preview:</strong> ${schedule.length ? schedule.map(day => `${escapeHtml(day.subject || 'Study')}${day.topics?.length ? ` (${escapeHtml(day.topics.join(', '))})` : ''}`).join(' • ') : 'No schedule available'}</p>
                <p class="study-plan-milestones"><strong>Milestones:</strong> ${milestones.length ? milestones.map(milestone => `${escapeHtml(milestone.name || 'Milestone')}${milestone.completed ? ' ✓' : ''}`).join(' • ') : 'No milestones available'}</p>
                <div class="study-plan-item-actions">
                    <button type="button" class="btn study-plan-delete-btn" data-plan-id="${plan._id || ''}">Remove Plan</button>
                    ${milestones.map((milestone, milestoneIndex) => `
                        <button type="button" class="btn milestone-toggle-btn" data-plan-id="${plan._id || ''}" data-milestone-index="${milestoneIndex}" data-completed="${milestone.completed ? 'true' : 'false'}">
                            ${milestone.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                    `).join('')}
                </div>
            </article>
        `;
    }).join('');

    studyPlanList.querySelectorAll('.milestone-toggle-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const planId = button.getAttribute('data-plan-id');
            const milestoneIndex = button.getAttribute('data-milestone-index');
            const isCompleted = button.getAttribute('data-completed') === 'true';

            if (!planId || milestoneIndex === null) return;

            try {
                await apiCall(`/studyPlan/${planId}/milestone/${milestoneIndex}`, 'PUT', {
                    completed: !isCompleted
                });
                await loadStudyPlans();
            } catch (error) {
                console.error('Failed to update milestone:', error);
            }
        });
    });

    studyPlanList.querySelectorAll('.study-plan-delete-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const planId = button.getAttribute('data-plan-id');

            if (!planId) return;

            if (!confirm('Delete this study plan? This cannot be undone.')) {
                return;
            }

            try {
                await apiCall(`/studyPlan/${planId}`, 'DELETE');
                await loadStudyPlans();
            } catch (error) {
                console.error('Failed to delete study plan:', error);
                alert('Could not delete the study plan. Please try again.');
            }
        });
    });
}

function renderSyllabusSection() {
    const syllabusContent = document.getElementById('syllabusContent');
    const examFilter = document.getElementById('examFilter')?.value || '';
    const syllabusSearch = document.getElementById('syllabusSearch')?.value.trim().toLowerCase() || '';

    if (!syllabusContent) return;

    const filtered = syllabusEntries.filter(entry => {
        const matchesExam = !examFilter || entry.examName === examFilter;
        const searchable = [entry.examName, entry.subject, entry.unit, entry.chapter, ...(entry.topics || []).map(topic => `${topic.name} ${(topic.subtopics || []).join(' ')}`)].join(' ').toLowerCase();
        const matchesSearch = !syllabusSearch || searchable.includes(syllabusSearch);
        return matchesExam && matchesSearch;
    });

    if (!filtered.length) {
        syllabusContent.innerHTML = `
            <div class="syllabus-empty-state">
                <h3>No syllabus entries found</h3>
                <p>Try a different exam or search term.</p>
            </div>
        `;
        return;
    }

    syllabusContent.innerHTML = filtered.map(entry => {
        const topicCount = Array.isArray(entry.topics) ? entry.topics.length : 0;
        const topTopics = (entry.topics || []).slice(0, 3).map(topic => topic.name).join(', ');
        return `
            <article class="syllabus-card">
                <div class="syllabus-card-header">
                    <span class="syllabus-exam">${escapeHtml(entry.examName || 'General')}</span>
                    <span class="syllabus-badge">${escapeHtml(entry.sourceLabel || 'Updated')}</span>
                </div>
                <h3>${escapeHtml(entry.subject || 'Subject')}</h3>
                <p class="syllabus-chapter">${escapeHtml(entry.chapter || '')}</p>
                <p class="syllabus-meta">${escapeHtml(entry.unit || 'Recent syllabus')} · ${entry.revisionYear || ''}</p>
                <p class="syllabus-topics"><strong>Top topics:</strong> ${escapeHtml(topTopics || 'See syllabus details')}</p>
                <p class="syllabus-topics-count">${topicCount} topics available</p>
            </article>
        `;
    }).join('');
}

// Logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const response = await apiCall('/analytics/dashboard');

        if (response.success) {
            const analytics = response.analytics;
            const totalSavedSeconds = Number((analytics.user.totalStudySeconds ?? (Number(analytics.user.totalStudyMinutes || 0) * 60)) || 0);
            const streakDays = Number(analytics.user.streakDays || 0);

            const selectedExamName = getSelectedExamName();
            const selectedExam = document.getElementById('selectedExamName');
            if (selectedExam) selectedExam.textContent = selectedExamName;

            savedStudySeconds = totalSavedSeconds;
            startStudyTimer(totalSavedSeconds);
            updateStudyTimeDisplay();
            updateStudyStreakDisplay(streakDays);

            const syllabusResponse = await apiCall(`/syllabus?examName=${encodeURIComponent(selectedExamName)}`);
            const syllabusItems = Array.isArray(syllabusResponse.syllabuses) ? syllabusResponse.syllabuses : [];
            renderSelectedExamSyllabus(syllabusItems);

            const countdownResponse = await apiCall(`/countdown?examName=${encodeURIComponent(selectedExamName)}`);
            const countdown = Array.isArray(countdownResponse.countdowns) ? countdownResponse.countdowns[0] : null;
            renderUpcomingExamCountdown(countdown || null);
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        const selectedExam = document.getElementById('selectedExamName');
        if (selectedExam) selectedExam.textContent = getSelectedExamName();
        renderSelectedExamSyllabus([]);
        updateStudyStreakDisplay(0);
        startStudyTimer(0);
        renderUpcomingExamCountdown(null);
    }
}

// Charts removed

// Chatbot Setup
function setupChatbot() {
    const sendBtn = document.getElementById('sendBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatInput = document.getElementById('chatInput');

    if (sendBtn) {
        sendBtn.addEventListener('click', sendChatMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    if (voiceBtn) {
        voiceBtn.addEventListener('click', startVoiceInput);
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', resetChatHistory);
    }

    updateProviderBadge('unknown');
}

function updateProviderBadge(provider) {
    const badge = document.getElementById('chatProviderBadge');
    if (!badge) return;

    const value = (provider || 'unknown').toLowerCase();
    badge.classList.remove('provider-gemini', 'provider-huggingface', 'provider-offline', 'provider-unknown');

    if (value === 'gemini') {
        badge.classList.add('provider-gemini');
        badge.textContent = 'Provider: Gemini (Live)';
        return;
    }

    if (value === 'huggingface') {
        badge.classList.add('provider-huggingface');
        badge.textContent = 'Provider: Hugging Face (Live)';
        return;
    }

    if (value === 'offline') {
        badge.classList.add('provider-offline');
        badge.textContent = 'Provider: Offline Fallback';
        return;
    }

    badge.classList.add('provider-unknown');
    badge.textContent = 'Provider: Unknown';
}

async function sendChatMessage() {
    if (isSendingMessage) return;

    const chatInput = document.getElementById('chatInput');
    const message = chatInput?.value || '';
    const userMessage = message.trim();

    if (!userMessage) {
        alert('Please enter a message');
        return;
    }

    isSendingMessage = true;

    try {
        // Clear any previously stored chat history so responses come from live AI
        chatHistory = [];
        try { sessionStorage.removeItem(CHAT_HISTORY_STORAGE_KEY); } catch (e) {}
        const chatBox = document.getElementById('chatBox');
        if (chatBox) chatBox.innerHTML = '';

        // Add user message to chat
        addChatMessage(userMessage, 'user');
        chatInput.value = '';
        showTypingIndicator();

        // Choose endpoint: authenticated users use /api/chat, anonymous use /api/test-chat
        const endpoint = getToken() ? '/chat' : '/test-chat';
        const response = await apiCall(endpoint, 'POST', {
            message: userMessage
        });

        if (response.success) {
            const botResponse = response.reply || response.response || response.message || 'No response returned.';
            updateProviderBadge(response.provider || 'unknown');
            addChatMessage(botResponse, 'ai');
            
            // Speak response (optional)
            if ('speechSynthesis' in window) {
                speakText(botResponse);
            }
        }
    } catch (error) {
        addChatMessage('Sorry, I couldn\'t process your question. Please try again.', 'ai');
    } finally {
        hideTypingIndicator();
        isSendingMessage = false;
    }
}

function addChatMessage(content, type) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    const message = {
        type,
        content,
        timestamp: Date.now()
    };

    chatHistory.push(message);
    persistChatHistory();
    renderChatMessage(message, chatBox);
    scrollChatToBottom();
}

function renderChatMessage(message, chatBox) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.type}-message`;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'chat-message-content';
    contentWrapper.innerHTML = renderMarkdown(message.content);
    messageDiv.appendChild(contentWrapper);

    if (message.type === 'ai') {
        const actions = document.createElement('div');
        actions.className = 'chat-message-actions';

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'chat-copy-btn';
        copyButton.textContent = 'Copy';
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(message.content);
                copyButton.textContent = 'Copied';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 1200);
            } catch (error) {
                console.error('Copy failed:', error);
            }
        });

        actions.appendChild(copyButton);
        messageDiv.appendChild(actions);
    }

    chatBox.appendChild(messageDiv);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    // escape then preserve line breaks for step-by-step solutions
    const escaped = String(text || '').replace(/[&<>"']/g, m => map[m]);
    return escaped.replace(/\n/g, '<br>');
}

function renderMarkdown(text) {
    const escaped = escapeHtml(text);
    const withCode = escaped
        .replace(/```([\s\S]*?)```/g, '<pre class="chat-code"><code>$1</code></pre>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');

    const lines = withCode.split('<br>');
    const output = [];
    let currentListType = null;

    const closeList = () => {
        if (currentListType) {
            output.push(`</${currentListType}>`);
            currentListType = null;
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            closeList();
            continue;
        }

        const orderedMatch = line.match(/^\d+[\.)]\s+(.*)$/);
        const bulletMatch = line.match(/^[-*]\s+(.*)$/);

        if (orderedMatch) {
            if (currentListType !== 'ol') {
                closeList();
                currentListType = 'ol';
                output.push('<ol>');
            }
            output.push(`<li>${orderedMatch[1]}</li>`);
            continue;
        }

        if (bulletMatch) {
            if (currentListType !== 'ul') {
                closeList();
                currentListType = 'ul';
                output.push('<ul>');
            }
            output.push(`<li>${bulletMatch[1]}</li>`);
            continue;
        }

        closeList();
        output.push(`<p>${line}</p>`);
    }

    closeList();
    return output.join('');
}

function showTypingIndicator() {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox || typingIndicatorElement) return;

    typingIndicatorElement = document.createElement('div');
    typingIndicatorElement.className = 'chat-message ai-message typing-message';
    typingIndicatorElement.innerHTML = `
        <div class="typing-dots" aria-label="Bot is typing">
            <span></span><span></span><span></span>
        </div>
    `;
    chatBox.appendChild(typingIndicatorElement);
    scrollChatToBottom();
}

function hideTypingIndicator() {
    if (typingIndicatorElement && typingIndicatorElement.parentNode) {
        typingIndicatorElement.parentNode.removeChild(typingIndicatorElement);
    }
    typingIndicatorElement = null;
}

function scrollChatToBottom() {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function persistChatHistory() {
    try {
        sessionStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistory));
    } catch (error) {
        console.error('Failed to store chat history:', error);
    }
}

function resetChatHistory() {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    chatHistory = [];
    sessionStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    hideTypingIndicator();

    chatBox.innerHTML = `
        <div class="chat-message ai-message">
            <p>Hi! I'm your ExamVerse AI Assistant. Ask me anything and I’ll answer step by step.</p>
        </div>
    `;
    scrollChatToBottom();
}

function restoreChatHistory() {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    try {
        const stored = sessionStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
        chatHistory = stored ? JSON.parse(stored) : [];
        chatHistory.forEach(message => renderChatMessage(message, chatBox));
        scrollChatToBottom();
    } catch (error) {
        console.error('Failed to restore chat history:', error);
        chatHistory = [];
    }
}

// Notes: list, edit, delete, and editor
async function fetchAndRenderNotes() {
    const notesContent = document.getElementById('notesContent');
    if (!notesContent) return;

    try {
        const res = await apiCall('/notes');
        if (res.success) {
            notesCache = res.notes || [];
            renderNotesList();
        } else {
            notesCache = [];
            renderNotesList();
        }
    } catch (err) {
        console.error('Failed to fetch notes', err);
        notesCache = [];
        renderNotesList();
    }
}

function renderNotesList() {
    const notesContent = document.getElementById('notesContent');
    if (!notesContent) return;

    if (!notesCache.length) {
        notesContent.innerHTML = `
            <div class="notes-list-empty">
                <p>No notes yet. Click <strong>+ New Note</strong> to create one.</p>
            </div>
        `;
        return;
    }

    notesContent.innerHTML = notesCache.map(note => `
        <article class="note-card" data-id="${note._id}">
            <div class="note-card-header">
                <h3 class="note-card-title">${escapeHtml(note.title || 'Untitled')}</h3>
                <div class="note-card-actions">
                    <button class="btn edit-note" data-id="${note._id}">Edit</button>
                    <button class="btn delete-note" data-id="${note._id}">Delete</button>
                </div>
            </div>
            <div class="note-card-body">${note.content || ''}</div>
        </article>
    `).join('');

    // Attach handlers
    notesContent.querySelectorAll('.edit-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const note = notesCache.find(n => String(n._id) === String(id));
            openNoteEditor(note);
        });
    });

    notesContent.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-id');
            if (!confirm('Delete this note?')) return;
            try {
                await apiCall(`/notes/${id}`, 'DELETE');
                await fetchAndRenderNotes();
            } catch (err) {
                console.error('Failed to delete', err);
                alert('Failed to delete note');
            }
        });
    });
}

function setupNotes() {
    const newNoteBtn = document.getElementById('newNoteBtn');
    if (newNoteBtn) newNoteBtn.addEventListener('click', () => openNoteEditor(null));
    // initial render if notes section visible
    if (location.hash === '#notes') fetchAndRenderNotes();
}

function openNoteEditor(existingNote) {
    const notesContent = document.getElementById('notesContent');
    if (!notesContent) return;

    notesContent.innerHTML = `
        <div class="note-editor">
            <div class="note-editor-toolbar">
                <input type="text" id="noteTitle" placeholder="Title" class="note-title" />
                <div class="toolbar-controls">
                    <button type="button" data-cmd="bold" title="Bold">B</button>
                    <button type="button" data-cmd="italic" title="Italic">I</button>
                    <button type="button" data-cmd="underline" title="Underline">U</button>
                    <select id="fontSizeSelect" title="Font size">
                        <option value="3">12px</option>
                        <option value="4" selected>14px</option>
                        <option value="5">18px</option>
                        <option value="6">24px</option>
                        <option value="7">32px</option>
                    </select>
                    <input type="color" id="fontColor" title="Font color" value="#000000" />
                    <input type="file" id="noteImage" accept="image/*" title="Insert image" />
                </div>
                <div class="note-actions">
                    <button id="saveNoteBtn" class="btn btn-primary">Save</button>
                    <button id="cancelNoteBtn" class="btn">Cancel</button>
                </div>
            </div>
            <div id="noteEditor" class="note-editor-area" contenteditable="true" aria-label="Note editor"></div>
        </div>
    `;

    if (existingNote) {
        document.getElementById('noteTitle').value = existingNote.title || '';
        document.getElementById('noteEditor').innerHTML = existingNote.content || '';
    }

    // Toolbar actions
    const toolbar = notesContent.querySelector('.note-editor-toolbar');
    toolbar.querySelectorAll('[data-cmd]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            document.execCommand(cmd, false, null);
            document.getElementById('noteEditor').focus();
        });
    });

    const fontSizeSelect = document.getElementById('fontSizeSelect');
    fontSizeSelect.addEventListener('change', () => {
        const val = fontSizeSelect.value;
        document.execCommand('fontSize', false, val);
        document.getElementById('noteEditor').focus();
    });

    const fontColor = document.getElementById('fontColor');
    fontColor.addEventListener('input', () => {
        document.execCommand('foreColor', false, fontColor.value);
        document.getElementById('noteEditor').focus();
    });

    const noteImage = document.getElementById('noteImage');
    noteImage.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            document.execCommand('insertImage', false, reader.result);
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('cancelNoteBtn').addEventListener('click', () => {
        fetchAndRenderNotes();
    });

    document.getElementById('saveNoteBtn').addEventListener('click', async () => {
        const title = document.getElementById('noteTitle').value.trim() || 'Untitled';
        const content = document.getElementById('noteEditor').innerHTML.trim();

        // if existingNote was passed, save as update; otherwise always create new
        const isEdit = !!(existingNote && existingNote._id);

        try {
            if (isEdit) {
                await apiCall(`/notes/${existingNote._id}`, 'PUT', { title, content });
            } else {
                await apiCall('/notes', 'POST', { title, content });
            }
            await fetchAndRenderNotes();
            alert('Note saved');
        } catch (err) {
            console.error('Failed to save note', err);
            alert('Failed to save note');
        }
    });

    document.getElementById('noteEditor').focus();
}

function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech Recognition not supported in your browser');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => {
        document.getElementById('voiceBtn').textContent = '🎤 Listening...';
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        
        document.getElementById('chatInput').value = transcript;
        document.getElementById('voiceBtn').textContent = '🎤';
    };

    recognition.start();
}

function speakText(text) {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}