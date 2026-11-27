/**
 * ==============================================================================
 * StudyFlow — Smart Study Planner & Task Manager
 * Language: Vanilla JavaScript (ES6+)
 * Description: Complete Single Page Application (SPA) logic including state
 * management, LocalStorage persistence, interactive calendar, task tracker,
 * study session planner, notes manager, analytics, and theme toggling.
 * ==============================================================================
 */

// Strict mode ensures cleaner code and avoids accidental global variables
'use strict';

/* ==============================================================================
   1. GLOBAL STATE & DATA STRUCTURES
   ============================================================================== */

/**
 * Default sample data preloaded for first-time students
 */
const DEMO_TASKS = [
  {
    id: 'task-1',
    title: 'Operating Systems: Implement Banker Algorithm',
    desc: 'Finish deadlock avoidance simulation in C++ and submit report on Canvas.',
    subject: 'Computer Science',
    priority: 'High',
    dueDate: getFormattedDateOffset(1), // Tomorrow
    estHours: 3.5,
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Linear Algebra: Eigenvalues Problem Set #5',
    desc: 'Complete problems 12 through 28 in chapter 5. Review matrix diagonalization.',
    subject: 'Mathematics',
    priority: 'High',
    dueDate: getFormattedDateOffset(0), // Today
    estHours: 2.0,
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Physics Mechanics: Wave Interference Lab Report',
    desc: 'Plot phase diagrams and draft conclusion section with error analysis.',
    subject: 'Physics',
    priority: 'Medium',
    dueDate: getFormattedDateOffset(3),
    estHours: 4.0,
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'Literature: Read Hamlet Act 3 & 4',
    desc: 'Annotate soliloquies and prepare notes for seminar discussion on Friday.',
    subject: 'Literature',
    priority: 'Low',
    dueDate: getFormattedDateOffset(4),
    estHours: 1.5,
    completed: false,
    createdAt: new Date().toISOString()
  }
];

const DEMO_SESSIONS = [
  {
    id: 'session-1',
    subject: 'Computer Science',
    topic: 'Algorithm Complexity & Graph Traversal (DFS/BFS)',
    date: getFormattedDateOffset(0), // Today
    startTime: '10:00',
    endTime: '11:30',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'session-2',
    subject: 'Mathematics',
    topic: 'Differential Equations: 2nd Order Non-Homogeneous',
    date: getFormattedDateOffset(0), // Today
    startTime: '14:00',
    endTime: '16:00',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'session-3',
    subject: 'Physics',
    topic: 'Thermodynamics: Carnot Engine & Entropy calculations',
    date: getFormattedDateOffset(1), // Tomorrow
    startTime: '09:00',
    endTime: '11:00',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

const DEMO_NOTES = [
  {
    id: 'note-1',
    title: 'Quick Sort vs Merge Sort Comparison',
    subject: 'Computer Science',
    content: '• Quick Sort: Average O(n log n), Worst O(n^2). In-place algorithm, cache friendly.\n• Merge Sort: Guaranteed O(n log n), requires O(n) auxiliary memory. Stable sorting.\n• Key takeaway for exams: Quick sort is preferred for internal memory sorting, Merge sort for external linked structures.',
    pinned: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'note-2',
    title: 'Calculus: Key Derivatives & Integrals',
    subject: 'Mathematics',
    content: '• d/dx [sin(x)] = cos(x)\n• d/dx [cos(x)] = -sin(x)\n• d/dx [e^x] = e^x\n• Integral of 1/x dx = ln|x| + C\n• Integration by parts formula: ∫ u dv = uv - ∫ v du',
    pinned: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'note-3',
    title: 'Thermodynamics Laws Summary',
    subject: 'Physics',
    content: '1. First Law: ΔU = Q - W (Conservation of Energy)\n2. Second Law: Total entropy of an isolated system always increases.\n3. Third Law: As T -> 0 K, entropy S approaches a constant minimum.',
    pinned: false,
    updatedAt: new Date().toISOString()
  }
];

const DEMO_PROFILE = {
  name: 'Alex Smith',
  school: 'Stanford University',
  major: 'Computer Science B.S.',
  streak: 5,
  soundEnabled: true,
  theme: 'dark'
};

/**
 * Core Application State
 */
const AppState = {
  tasks: [],
  sessions: [],
  notes: [],
  profile: { ...DEMO_PROFILE },
  activeView: 'dashboard',
  selectedCalendarDate: getTodayDateString(),
  currentCalendarMonth: new Date().getMonth(),
  currentCalendarYear: new Date().getFullYear(),
  taskFilter: {
    search: '',
    status: 'all',
    priority: 'all',
    subject: 'all',
    sort: 'due-asc'
  },
  noteFilter: {
    search: '',
    subject: 'all'
  }
};

/* ==============================================================================
   2. LOCAL STORAGE PERSISTENCE LAYER
   ============================================================================== */

const STORAGE_KEYS = {
  TASKS: 'studyflow_tasks_v1',
  SESSIONS: 'studyflow_sessions_v1',
  NOTES: 'studyflow_notes_v1',
  PROFILE: 'studyflow_profile_v1',
  THEME: 'studyflow_theme_v1'
};

/**
 * Initializes and loads data from LocalStorage.
 * Falls back to realistic demo data if user is visiting for the first time.
 */
function initStorage() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
    const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);

    if (storedTasks) {
      AppState.tasks = JSON.parse(storedTasks);
    } else {
      AppState.tasks = [...DEMO_TASKS];
      saveTasksToStorage();
    }

    if (storedSessions) {
      AppState.sessions = JSON.parse(storedSessions);
    } else {
      AppState.sessions = [...DEMO_SESSIONS];
      saveSessionsToStorage();
    }

    if (storedNotes) {
      AppState.notes = JSON.parse(storedNotes);
    } else {
      AppState.notes = [...DEMO_NOTES];
      saveNotesToStorage();
    }

    if (storedProfile) {
      AppState.profile = { ...DEMO_PROFILE, ...JSON.parse(storedProfile) };
    } else {
      AppState.profile = { ...DEMO_PROFILE };
      saveProfileToStorage();
    }

    if (storedTheme) {
      AppState.profile.theme = storedTheme;
    }
  } catch (error) {
    console.error('Error accessing LocalStorage:', error);
    showToast('Failed to load saved data. Using memory state.', 'danger');
  }
}

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(AppState.tasks));
}

function saveSessionsToStorage() {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(AppState.sessions));
}

function saveNotesToStorage() {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(AppState.notes));
}

function saveProfileToStorage() {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(AppState.profile));
}

/* ==============================================================================
   3. AUDIO SYNTHESIS FEEDBACK (Web Audio API)
   ============================================================================== */

let audioCtx = null;

function playAudioChime(type = 'success') {
  if (!AppState.profile.soundEnabled) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
      // Pleasant high double chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'click') {
      // Soft low click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'delete') {
      // Gentle downward note
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (err) {
    // Audio is optional and non-blocking
  }
}

/* ==============================================================================
   4. UI ROUTING & NAVIGATION
   ============================================================================== */

/**
 * Sets the active view, updates sidebar active state, page title, and re-renders view
 */
function navigateTo(viewId) {
  const views = ['dashboard', 'tasks', 'planner', 'calendar', 'notes', 'analytics', 'settings'];
  if (!views.includes(viewId)) viewId = 'dashboard';

  AppState.activeView = viewId;

  // Toggle view visibility
  document.querySelectorAll('.app-view').forEach(viewEl => {
    viewEl.classList.remove('active');
  });
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) targetView.classList.add('active');

  // Update navigation link states
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update topbar title
  const titleMap = {
    dashboard: 'Dashboard Overview',
    tasks: 'Tasks & Deadlines',
    planner: 'Study Planner & Timetable',
    calendar: 'Academic Calendar',
    notes: 'Study Notes & Summaries',
    analytics: 'Productivity Analytics',
    settings: 'System Settings'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titleMap[viewId] || 'Dashboard';

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Render specific view
  renderCurrentView(viewId);
  updatePendingNavBadge();
  playAudioChime('click');
}

function renderCurrentView(viewId) {
  switch (viewId) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'tasks':
      renderTasksList();
      break;
    case 'planner':
      renderPlannerView();
      break;
    case 'calendar':
      renderCalendar();
      break;
    case 'notes':
      renderNotesList();
      break;
    case 'analytics':
      renderAnalyticsView();
      break;
    case 'settings':
      populateSettingsForm();
      break;
  }
}

function updatePendingNavBadge() {
  const pendingCount = AppState.tasks.filter(t => !t.completed).length;
  const badge = document.getElementById('nav-pending-badge');
  if (badge) {
    badge.textContent = pendingCount;
    badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  }
}

/* ==============================================================================
   5. VIEW 1: DASHBOARD LOGIC
   ============================================================================== */

function renderDashboard() {
  // Update student name and avatar
  const studentNameEl = document.getElementById('welcome-student-name');
  const sidebarNameEl = document.getElementById('sidebar-user-name');
  const sidebarAvatarEl = document.getElementById('sidebar-avatar');

  if (studentNameEl) studentNameEl.textContent = AppState.profile.name;
  if (sidebarNameEl) sidebarNameEl.textContent = AppState.profile.name;
  if (sidebarAvatarEl) {
    sidebarAvatarEl.textContent = getInitials(AppState.profile.name);
  }

  // Calculate task counts
  const totalTasks = AppState.tasks.length;
  const completedTasks = AppState.tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // High priority count
  const highPriorityPending = AppState.tasks.filter(t => !t.completed && t.priority === 'High').length;

  // Update Stat Cards
  document.getElementById('dash-total-tasks').textContent = totalTasks;
  document.getElementById('dash-completed-tasks').textContent = completedTasks;
  document.getElementById('dash-pending-tasks').textContent = pendingTasks;
  document.getElementById('dash-completion-rate-text').textContent = `${completionRate}% done`;
  document.getElementById('dash-high-priority-sub').textContent = `${highPriorityPending} high priority pending`;

  // Progress Bar
  const progressFill = document.getElementById('dash-progress-fill');
  const progressPercent = document.getElementById('dash-progress-percent');
  if (progressFill) progressFill.style.width = `${completionRate}%`;
  if (progressPercent) progressPercent.textContent = `${completionRate}%`;

  // Calculate Today's Planned Study Hours
  const todayStr = getTodayDateString();
  const todaySessions = AppState.sessions.filter(s => s.date === todayStr);
  let totalMinutes = 0;
  todaySessions.forEach(s => {
    totalMinutes += calculateDurationMinutes(s.startTime, s.endTime);
  });
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  document.getElementById('dash-study-hours').textContent = `${hours}h ${mins}m`;
  document.getElementById('dash-sessions-count').textContent = `${todaySessions.length} sessions scheduled`;
  document.getElementById('dash-today-sessions-count').textContent = todaySessions.length;

  // Render Urgent Tasks (top 3 high/medium priority tasks)
  const urgentTasksContainer = document.getElementById('dash-urgent-task-list');
  const urgentTasks = AppState.tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 3);

  document.getElementById('dash-urgent-tasks-count').textContent = urgentTasks.length;

  if (urgentTasks.length === 0) {
    urgentTasksContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <h4 class="empty-title">All caught up!</h4>
        <p class="empty-desc">No urgent pending assignments. Great job staying on top of your studies.</p>
        <button class="btn btn-outline btn-sm" onclick="openTaskModal()">+ Add New Task</button>
      </div>
    `;
  } else {
    urgentTasksContainer.innerHTML = urgentTasks.map(task => renderTaskCardHTML(task)).join('');
  }

  // Render Today's Study Sessions on Dashboard
  const dashSessionsContainer = document.getElementById('dash-today-sessions-list');
  if (todaySessions.length === 0) {
    dashSessionsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⏱️</div>
        <h4 class="empty-title">No sessions today</h4>
        <p class="empty-desc">You haven't scheduled any study blocks for today.</p>
        <button class="btn btn-outline btn-sm" onclick="openSessionModal()">+ Plan a Session</button>
      </div>
    `;
  } else {
    dashSessionsContainer.innerHTML = todaySessions.map(session => renderSessionCardHTML(session)).join('');
  }
}

/* ==============================================================================
   6. VIEW 2: TASK MANAGEMENT LOGIC
   ============================================================================== */

function renderTasksList() {
  const container = document.getElementById('tasks-list');
  if (!container) return;

  // Apply filters
  let filtered = AppState.tasks.filter(task => {
    // Search query
    const query = AppState.taskFilter.search.toLowerCase().trim();
    const matchesSearch = !query || 
      task.title.toLowerCase().includes(query) || 
      (task.desc && task.desc.toLowerCase().includes(query)) ||
      task.subject.toLowerCase().includes(query);

    // Status filter
    const matchesStatus = 
      AppState.taskFilter.status === 'all' ? true :
      AppState.taskFilter.status === 'completed' ? task.completed : !task.completed;

    // Priority filter
    const matchesPriority = 
      AppState.taskFilter.priority === 'all' || task.priority === AppState.taskFilter.priority;

    // Subject filter
    const matchesSubject = 
      AppState.taskFilter.subject === 'all' || task.subject === AppState.taskFilter.subject;

    return matchesSearch && matchesStatus && matchesPriority && matchesSubject;
  });

  // Apply sorting
  filtered.sort((a, b) => {
    switch (AppState.taskFilter.sort) {
      case 'due-asc':
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'due-desc':
        return new Date(b.dueDate) - new Date(a.dueDate);
      case 'priority-desc': {
        const pOrder = { High: 3, Medium: 2, Low: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state glass-card">
        <div class="empty-icon">📝</div>
        <h4 class="empty-title">No tasks found</h4>
        <p class="empty-desc">Try clearing filters or add a new task to your study board.</p>
        <button class="btn btn-primary" onclick="openTaskModal()">+ Add New Task</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(task => renderTaskCardHTML(task)).join('');
}

/**
 * Returns HTML string for an individual task card
 */
function renderTaskCardHTML(task) {
  const isCompleted = task.completed ? 'completed' : '';
  const isChecked = task.completed ? 'checked' : '';
  
  // Format due date badge
  const todayStr = getTodayDateString();
  let dueBadgeClass = '';
  let dueText = formatDisplayDate(task.dueDate);

  if (task.dueDate < todayStr && !task.completed) {
    dueBadgeClass = 'overdue';
    dueText = `Overdue (${dueText})`;
  } else if (task.dueDate === todayStr) {
    dueBadgeClass = 'today';
    dueText = `Due Today`;
  }

  return `
    <div class="task-card ${isCompleted}" data-task-id="${task.id}">
      <label class="task-checkbox-wrap" title="Mark as ${task.completed ? 'pending' : 'completed'}">
        <input type="checkbox" ${isChecked} onchange="toggleTaskComplete('${task.id}')">
        <span class="task-custom-checkbox">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      </label>

      <div class="task-card-body">
        <div class="task-card-header">
          <span class="task-card-title">${escapeHTML(task.title)}</span>
          <span class="badge-priority ${task.priority.toLowerCase()}">${task.priority}</span>
          <span class="badge-subject">${escapeHTML(task.subject)}</span>
        </div>

        ${task.desc ? `<p class="task-card-desc">${escapeHTML(task.desc)}</p>` : ''}

        <div class="task-card-meta">
          <span class="badge-due-date ${dueBadgeClass}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${dueText}
          </span>
          ${task.estHours ? `<span class="stat-sub">⏱️ ~${task.estHours} hrs</span>` : ''}
        </div>
      </div>

      <div class="task-actions">
        <button class="icon-btn" onclick="openTaskModal('${task.id}')" title="Edit Task">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button class="icon-btn" onclick="confirmDeleteTask('${task.id}')" title="Delete Task">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Toggle task complete state
 */
function toggleTaskComplete(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  saveTasksToStorage();
  updatePendingNavBadge();

  if (task.completed) {
    playAudioChime('success');
    showToast(`Task completed! "${task.title}"`, 'success');
  } else {
    playAudioChime('click');
    showToast(`Task reopened: "${task.title}"`, 'info');
  }

  // Re-render appropriate view
  if (AppState.activeView === 'tasks') {
    renderTasksList();
  } else if (AppState.activeView === 'dashboard') {
    renderDashboard();
  }
}

/**
 * Open task modal for Create or Edit
 */
function openTaskModal(taskId = null) {
  const modal = document.getElementById('modal-task');
  const form = document.getElementById('form-task');
  const modalTitle = document.getElementById('modal-task-title');
  const taskIdInput = document.getElementById('task-id');
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const subjectInput = document.getElementById('task-subject');
  const priorityInput = document.getElementById('task-priority');
  const dueDateInput = document.getElementById('task-due-date');
  const estTimeInput = document.getElementById('task-est-time');

  form.reset();
  clearFormErrors();

  if (taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (!task) return;
    modalTitle.textContent = 'Edit Task';
    taskIdInput.value = task.id;
    titleInput.value = task.title;
    descInput.value = task.desc || '';
    subjectInput.value = task.subject;
    priorityInput.value = task.priority;
    dueDateInput.value = task.dueDate;
    estTimeInput.value = task.estHours || '';
  } else {
    modalTitle.textContent = 'Add New Task';
    taskIdInput.value = '';
    dueDateInput.value = getTodayDateString();
  }

  modal.classList.add('active');
  titleInput.focus();
}

/**
 * Save Task Handler
 */
function handleTaskFormSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const id = document.getElementById('task-id').value;
  const title = document.getElementById('task-title').value.trim();
  const desc = document.getElementById('task-desc').value.trim();
  const subject = document.getElementById('task-subject').value.trim();
  const priority = document.getElementById('task-priority').value;
  const dueDate = document.getElementById('task-due-date').value;
  const estHours = parseFloat(document.getElementById('task-est-time').value) || null;

  // Validation
  if (!title) {
    document.getElementById('error-task-title').textContent = 'Please enter a task title.';
    return;
  }
  if (!dueDate) {
    document.getElementById('error-task-date').textContent = 'Please pick a due date.';
    return;
  }

  if (id) {
    // Edit existing task
    const task = AppState.tasks.find(t => t.id === id);
    if (task) {
      task.title = title;
      task.desc = desc;
      task.subject = subject || 'General';
      task.priority = priority;
      task.dueDate = dueDate;
      task.estHours = estHours;
      showToast('Task updated successfully!', 'success');
    }
  } else {
    // Add new task
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      desc,
      subject: subject || 'General',
      priority,
      dueDate,
      estHours,
      completed: false,
      createdAt: new Date().toISOString()
    };
    AppState.tasks.unshift(newTask);
    showToast('New task added!', 'success');
  }

  saveTasksToStorage();
  updatePendingNavBadge();
  closeModal('modal-task');
  playAudioChime('success');

  if (AppState.activeView === 'tasks') renderTasksList();
  if (AppState.activeView === 'dashboard') renderDashboard();
  if (AppState.activeView === 'calendar') renderCalendar();
}

/**
 * Confirm and Delete Task
 */
function confirmDeleteTask(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  openConfirmModal(
    'Delete Task',
    `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
    () => {
      AppState.tasks = AppState.tasks.filter(t => t.id !== taskId);
      saveTasksToStorage();
      updatePendingNavBadge();
      playAudioChime('delete');
      showToast('Task deleted.', 'info');
      if (AppState.activeView === 'tasks') renderTasksList();
      if (AppState.activeView === 'dashboard') renderDashboard();
      if (AppState.activeView === 'calendar') renderCalendar();
    }
  );
}

/* ==============================================================================
   7. VIEW 3: STUDY PLANNER & TIMETABLE LOGIC
   ============================================================================== */

function renderPlannerView() {
  const datePicker = document.getElementById('planner-date-picker');
  if (datePicker && !datePicker.value) {
    datePicker.value = getTodayDateString();
  }

  const selectedDate = datePicker.value || getTodayDateString();
  const daySessions = AppState.sessions
    .filter(s => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Compute metrics for selected day
  let totalMins = 0;
  let completedCount = 0;
  daySessions.forEach(s => {
    totalMins += calculateDurationMinutes(s.startTime, s.endTime);
    if (s.completed) completedCount++;
  });

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const compRate = daySessions.length > 0 ? Math.round((completedCount / daySessions.length) * 100) : 0;

  document.getElementById('planner-metric-sessions').textContent = daySessions.length;
  document.getElementById('planner-metric-hours').textContent = `${hours}h ${mins}m`;
  document.getElementById('planner-metric-completed').textContent = `${compRate}%`;

  const container = document.getElementById('planner-sessions-list');
  if (daySessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state glass-card">
        <div class="empty-icon">📅</div>
        <h4 class="empty-title">No study sessions scheduled for ${formatDisplayDate(selectedDate)}</h4>
        <p class="empty-desc">Plan focused blocks for assignments, exam prep, or reading.</p>
        <button class="btn btn-primary" onclick="openSessionModal('${selectedDate}')">+ Schedule a Session</button>
      </div>
    `;
    return;
  }

  container.innerHTML = daySessions.map(session => renderSessionCardHTML(session)).join('');
}

function renderSessionCardHTML(session) {
  const durationMins = calculateDurationMinutes(session.startTime, session.endTime);
  const durH = Math.floor(durationMins / 60);
  const durM = durationMins % 60;
  const durationText = `${durH > 0 ? durH + 'h ' : ''}${durM}m`;

  // Status computation
  let statusBadge = '';
  let cardClass = '';

  if (session.completed) {
    cardClass = 'completed';
    statusBadge = `<span class="session-status-badge done">✓ Done</span>`;
  } else {
    statusBadge = `<span class="session-status-badge upcoming">Upcoming</span>`;
  }

  return `
    <div class="session-card ${cardClass}" data-session-id="${session.id}">
      <div class="session-time-block">
        <span class="session-time-range">${formatTime12Hour(session.startTime)} – ${formatTime12Hour(session.endTime)}</span>
        <span class="session-duration">⏱️ ${durationText} study block</span>
      </div>

      <div class="session-info">
        <span class="session-subject-tag">${escapeHTML(session.subject)}</span>
        <div class="session-topic">
          ${escapeHTML(session.topic)}
          ${statusBadge}
        </div>
      </div>

      <div class="task-actions">
        <button class="btn ${session.completed ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="toggleSessionComplete('${session.id}')">
          ${session.completed ? 'Reopen' : 'Mark Done'}
        </button>
        <button class="icon-btn" onclick="openSessionModal(null, '${session.id}')" title="Edit Session">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button class="icon-btn" onclick="confirmDeleteSession('${session.id}')" title="Delete Session">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function toggleSessionComplete(sessionId) {
  const session = AppState.sessions.find(s => s.id === sessionId);
  if (!session) return;

  session.completed = !session.completed;
  saveSessionsToStorage();
  playAudioChime(session.completed ? 'success' : 'click');
  showToast(session.completed ? 'Study session marked as completed!' : 'Session reopened.', 'info');

  if (AppState.activeView === 'planner') renderPlannerView();
  if (AppState.activeView === 'dashboard') renderDashboard();
  if (AppState.activeView === 'calendar') renderCalendar();
}

function openSessionModal(initialDate = null, sessionId = null) {
  const modal = document.getElementById('modal-session');
  const form = document.getElementById('form-session');
  const modalTitle = document.getElementById('modal-session-title');
  const idInput = document.getElementById('session-id');
  const subjectInput = document.getElementById('session-subject');
  const topicInput = document.getElementById('session-topic');
  const dateInput = document.getElementById('session-date');
  const startTimeInput = document.getElementById('session-start-time');
  const endTimeInput = document.getElementById('session-end-time');

  form.reset();
  clearFormErrors();

  if (sessionId) {
    const session = AppState.sessions.find(s => s.id === sessionId);
    if (!session) return;
    modalTitle.textContent = 'Edit Study Session';
    idInput.value = session.id;
    subjectInput.value = session.subject;
    topicInput.value = session.topic;
    dateInput.value = session.date;
    startTimeInput.value = session.startTime;
    endTimeInput.value = session.endTime;
  } else {
    modalTitle.textContent = 'Schedule Study Session';
    idInput.value = '';
    dateInput.value = initialDate || getTodayDateString();
    startTimeInput.value = '10:00';
    endTimeInput.value = '11:30';
  }

  modal.classList.add('active');
  subjectInput.focus();
}

function handleSessionFormSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const id = document.getElementById('session-id').value;
  const subject = document.getElementById('session-subject').value.trim();
  const topic = document.getElementById('session-topic').value.trim();
  const date = document.getElementById('session-date').value;
  const startTime = document.getElementById('session-start-time').value;
  const endTime = document.getElementById('session-end-time').value;

  if (startTime >= endTime) {
    document.getElementById('error-session-time').textContent = 'End time must be after start time.';
    return;
  }

  if (id) {
    const session = AppState.sessions.find(s => s.id === id);
    if (session) {
      session.subject = subject || 'General';
      session.topic = topic;
      session.date = date;
      session.startTime = startTime;
      session.endTime = endTime;
      showToast('Session updated successfully!', 'success');
    }
  } else {
    const newSession = {
      id: `session-${Date.now()}`,
      subject: subject || 'General',
      topic,
      date,
      startTime,
      endTime,
      completed: false,
      createdAt: new Date().toISOString()
    };
    AppState.sessions.push(newSession);
    showToast('Study session scheduled!', 'success');
  }

  saveSessionsToStorage();
  closeModal('modal-session');
  playAudioChime('success');

  if (AppState.activeView === 'planner') renderPlannerView();
  if (AppState.activeView === 'dashboard') renderDashboard();
  if (AppState.activeView === 'calendar') renderCalendar();
}

function confirmDeleteSession(sessionId) {
  const session = AppState.sessions.find(s => s.id === sessionId);
  if (!session) return;

  openConfirmModal(
    'Delete Session',
    `Delete study session for "${session.topic}"?`,
    () => {
      AppState.sessions = AppState.sessions.filter(s => s.id !== sessionId);
      saveSessionsToStorage();
      playAudioChime('delete');
      showToast('Study session deleted.', 'info');
      if (AppState.activeView === 'planner') renderPlannerView();
      if (AppState.activeView === 'dashboard') renderDashboard();
      if (AppState.activeView === 'calendar') renderCalendar();
    }
  );
}

/* ==============================================================================
   8. VIEW 4: MONTHLY INTERACTIVE CALENDAR
   ============================================================================== */

function renderCalendar() {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = AppState.currentCalendarYear;
  const month = AppState.currentCalendarMonth;

  document.getElementById('cal-month-year').textContent = `${monthNames[month]} ${year}`;

  const grid = document.getElementById('calendar-days-grid');
  grid.innerHTML = '';

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const todayStr = getTodayDateString();

  // Previous month trailing days
  for (let x = firstDayIndex; x > 0; x--) {
    const prevDayNum = prevLastDate - x + 1;
    const prevDateMonth = month === 0 ? 11 : month - 1;
    const prevDateYear = month === 0 ? year - 1 : year;
    const dateStr = formatDateComponents(prevDateYear, prevDateMonth, prevDayNum);
    grid.appendChild(createCalendarDayCell(prevDayNum, dateStr, true));
  }

  // Current month days
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = formatDateComponents(year, month, d);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === AppState.selectedCalendarDate;
    grid.appendChild(createCalendarDayCell(d, dateStr, false, isToday, isSelected));
  }

  // Next month leading days to complete 35 or 42 cells grid
  const totalRendered = firstDayIndex + lastDate;
  const nextDays = totalRendered <= 35 ? 35 - totalRendered : 42 - totalRendered;
  for (let n = 1; n <= nextDays; n++) {
    const nextDateMonth = month === 11 ? 0 : month + 1;
    const nextDateYear = month === 11 ? year + 1 : year;
    const dateStr = formatDateComponents(nextDateYear, nextDateMonth, n);
    grid.appendChild(createCalendarDayCell(n, dateStr, true));
  }

  // Render agenda for the selected date
  renderCalendarAgenda(AppState.selectedCalendarDate);
}

function createCalendarDayCell(dayNumber, dateString, isOtherMonth, isToday = false, isSelected = false) {
  const cell = document.createElement('div');
  cell.className = `cal-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`;
  cell.setAttribute('data-date', dateString);

  // Match tasks and sessions on this date
  const dayTasks = AppState.tasks.filter(t => t.dueDate === dateString);
  const daySessions = AppState.sessions.filter(s => s.date === dateString);

  let badgesHTML = '';
  if (dayTasks.length > 0) {
    badgesHTML += `<span class="cal-task-dot-tag">📝 ${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}</span>`;
  }
  if (daySessions.length > 0) {
    badgesHTML += `<span class="cal-session-dot-tag">⏱️ ${daySessions.length} session${daySessions.length > 1 ? 's' : ''}</span>`;
  }

  cell.innerHTML = `
    <span class="cal-day-num">${dayNumber}</span>
    <div class="cal-day-badges">${badgesHTML}</div>
  `;

  cell.addEventListener('click', () => {
    AppState.selectedCalendarDate = dateString;
    document.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('is-selected'));
    cell.classList.add('is-selected');
    renderCalendarAgenda(dateString);
    playAudioChime('click');
  });

  return cell;
}

function renderCalendarAgenda(dateString) {
  const titleEl = document.getElementById('agenda-date-title');
  const countBadge = document.getElementById('agenda-count-badge');
  const listContainer = document.getElementById('agenda-items-list');

  titleEl.textContent = `Schedule & Deadlines for ${formatDisplayDate(dateString)}`;

  const dayTasks = AppState.tasks.filter(t => t.dueDate === dateString);
  const daySessions = AppState.sessions.filter(s => s.date === dateString);
  const totalItems = dayTasks.length + daySessions.length;

  countBadge.textContent = `${totalItems} scheduled`;

  if (totalItems === 0) {
    listContainer.innerHTML = `
      <div class="empty-state" style="padding: 24px 0;">
        <p class="empty-desc">No tasks due or study sessions scheduled on this date.</p>
        <div style="display:flex; gap: 8px;">
          <button class="btn btn-outline btn-sm" onclick="openTaskModalForDate('${dateString}')">+ Add Task</button>
          <button class="btn btn-primary btn-sm" onclick="openSessionModal('${dateString}')">+ Schedule Session</button>
        </div>
      </div>
    `;
    return;
  }

  let html = '';

  if (dayTasks.length > 0) {
    html += `<div style="font-size:0.8rem; font-weight:700; color:var(--primary); margin-top:4px;">TASKS DUE (${dayTasks.length})</div>`;
    html += dayTasks.map(task => renderTaskCardHTML(task)).join('');
  }

  if (daySessions.length > 0) {
    html += `<div style="font-size:0.8rem; font-weight:700; color:var(--secondary); margin-top:12px;">STUDY SESSIONS (${daySessions.length})</div>`;
    html += daySessions.map(session => renderSessionCardHTML(session)).join('');
  }

  listContainer.innerHTML = html;
}

function openTaskModalForDate(dateStr) {
  openTaskModal();
  document.getElementById('task-due-date').value = dateStr;
}

/* ==============================================================================
   9. VIEW 5: STUDY NOTES LOGIC
   ============================================================================== */

function renderNotesList() {
  const container = document.getElementById('notes-list');
  if (!container) return;

  const query = AppState.noteFilter.search.toLowerCase().trim();
  const subject = AppState.noteFilter.subject;

  let filtered = AppState.notes.filter(note => {
    const matchesSearch = !query || 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query) ||
      note.subject.toLowerCase().includes(query);

    const matchesSubject = subject === 'all' || note.subject === subject;

    return matchesSearch && matchesSubject;
  });

  // Sort pinned first, then newest
  filtered.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state glass-card" style="grid-column: 1 / -1;">
        <div class="empty-icon">📓</div>
        <h4 class="empty-title">No notes found</h4>
        <p class="empty-desc">Create your first study note to summarize key lectures and formulas.</p>
        <button class="btn btn-primary" onclick="openNoteModal()">+ New Note</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(note => `
    <div class="note-card ${note.pinned ? 'pinned' : ''}" onclick="openNoteModal('${note.id}')">
      ${note.pinned ? '<span class="note-pin-badge" title="Pinned note">📌</span>' : ''}
      <div class="note-card-header">
        <span class="note-subject-pill">${escapeHTML(note.subject)}</span>
        <h4 class="note-card-title">${escapeHTML(note.title)}</h4>
      </div>
      <div class="note-card-excerpt">${escapeHTML(note.content)}</div>
      <div class="note-card-footer" onclick="event.stopPropagation();">
        <span>Updated ${formatDisplayDate(note.updatedAt.split('T')[0])}</span>
        <div class="task-actions">
          <button class="icon-btn" onclick="toggleNotePin('${note.id}')" title="${note.pinned ? 'Unpin' : 'Pin to top'}">
            ${note.pinned ? '📍' : '📌'}
          </button>
          <button class="icon-btn" onclick="confirmDeleteNote('${note.id}')" title="Delete Note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function openNoteModal(noteId = null) {
  const modal = document.getElementById('modal-note');
  const form = document.getElementById('form-note');
  const modalTitle = document.getElementById('modal-note-title');
  const idInput = document.getElementById('note-id');
  const titleInput = document.getElementById('note-title');
  const subjectInput = document.getElementById('note-subject');
  const contentInput = document.getElementById('note-content');
  const pinnedInput = document.getElementById('note-pinned');

  form.reset();

  if (noteId) {
    const note = AppState.notes.find(n => n.id === noteId);
    if (!note) return;
    modalTitle.textContent = 'Edit Study Note';
    idInput.value = note.id;
    titleInput.value = note.title;
    subjectInput.value = note.subject;
    contentInput.value = note.content;
    pinnedInput.checked = Boolean(note.pinned);
  } else {
    modalTitle.textContent = 'New Study Note';
    idInput.value = '';
    pinnedInput.checked = false;
  }

  modal.classList.add('active');
  titleInput.focus();
}

function handleNoteFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('note-id').value;
  const title = document.getElementById('note-title').value.trim();
  const subject = document.getElementById('note-subject').value.trim();
  const content = document.getElementById('note-content').value.trim();
  const pinned = document.getElementById('note-pinned').checked;

  if (!title || !content) return;

  if (id) {
    const note = AppState.notes.find(n => n.id === id);
    if (note) {
      note.title = title;
      note.subject = subject || 'General';
      note.content = content;
      note.pinned = pinned;
      note.updatedAt = new Date().toISOString();
      showToast('Note updated!', 'success');
    }
  } else {
    const newNote = {
      id: `note-${Date.now()}`,
      title,
      subject: subject || 'General',
      content,
      pinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    AppState.notes.unshift(newNote);
    showToast('Note saved!', 'success');
  }

  saveNotesToStorage();
  closeModal('modal-note');
  playAudioChime('success');
  if (AppState.activeView === 'notes') renderNotesList();
}

function toggleNotePin(noteId) {
  const note = AppState.notes.find(n => n.id === noteId);
  if (!note) return;

  note.pinned = !note.pinned;
  saveNotesToStorage();
  playAudioChime('click');
  showToast(note.pinned ? 'Note pinned to top!' : 'Note unpinned.', 'info');
  if (AppState.activeView === 'notes') renderNotesList();
}

function confirmDeleteNote(noteId) {
  const note = AppState.notes.find(n => n.id === noteId);
  if (!note) return;

  openConfirmModal(
    'Delete Study Note',
    `Are you sure you want to delete "${note.title}"?`,
    () => {
      AppState.notes = AppState.notes.filter(n => n.id !== noteId);
      saveNotesToStorage();
      playAudioChime('delete');
      showToast('Note deleted.', 'info');
      if (AppState.activeView === 'notes') renderNotesList();
    }
  );
}

/* ==============================================================================
   10. VIEW 6: PRODUCTIVITY & HABIT ANALYTICS
   ============================================================================== */

function renderAnalyticsView() {
  const totalTasks = AppState.tasks.length;
  const completedTasks = AppState.tasks.filter(t => t.completed).length;
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Update Radial Circle
  const radialCircle = document.getElementById('analytics-radial-circle');
  const efficiencyVal = document.getElementById('analytics-efficiency-val');
  const efficiencyCaption = document.getElementById('analytics-efficiency-caption');

  if (radialCircle && efficiencyVal) {
    const circumference = 2 * Math.PI * 66; // approx 414.69
    const offset = circumference - (rate / 100) * circumference;
    radialCircle.style.strokeDashoffset = offset;
    efficiencyVal.textContent = `${rate}%`;

    if (rate >= 80) {
      efficiencyCaption.textContent = '🌟 Outstanding! You are crushing your academic goals.';
    } else if (rate >= 50) {
      efficiencyCaption.textContent = '🚀 Solid momentum! Keep finishing pending assignments.';
    } else {
      efficiencyCaption.textContent = '🎯 Focus mode activated! Complete your priority tasks.';
    }
  }

  // Priority Breakdown
  const highCount = AppState.tasks.filter(t => t.priority === 'High').length;
  const medCount = AppState.tasks.filter(t => t.priority === 'Medium').length;
  const lowCount = AppState.tasks.filter(t => t.priority === 'Low').length;

  document.getElementById('analytics-count-high').textContent = highCount;
  document.getElementById('analytics-count-med').textContent = medCount;
  document.getElementById('analytics-count-low').textContent = lowCount;

  // Total Study Hours logged
  let totalStudyMinutes = 0;
  AppState.sessions.forEach(s => {
    totalStudyMinutes += calculateDurationMinutes(s.startTime, s.endTime);
  });
  const totalStudyHrs = (totalStudyMinutes / 60).toFixed(1);
  document.getElementById('analytics-total-study-hours').textContent = `${totalStudyHrs} hrs`;

  // Tasks by Subject Breakdown
  const subjectMap = {};
  AppState.tasks.forEach(t => {
    if (!subjectMap[t.subject]) {
      subjectMap[t.subject] = { total: 0, completed: 0 };
    }
    subjectMap[t.subject].total++;
    if (t.completed) subjectMap[t.subject].completed++;
  });

  const subjectContainer = document.getElementById('analytics-subject-breakdown');
  const subjects = Object.keys(subjectMap);

  if (subjects.length === 0) {
    subjectContainer.innerHTML = `<p class="stat-sub">No subject data recorded yet.</p>`;
  } else {
    subjectContainer.innerHTML = subjects.map(sub => {
      const data = subjectMap[sub];
      const subRate = Math.round((data.completed / data.total) * 100);
      return `
        <div class="subject-bar-row">
          <div class="subject-bar-labels">
            <span>${escapeHTML(sub)}</span>
            <span>${data.completed}/${data.total} tasks (${subRate}%)</span>
          </div>
          <div class="subject-bar-track">
            <div class="subject-bar-fill" style="width: ${subRate}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

/* ==============================================================================
   11. VIEW 7: SETTINGS & DATA CONTROLS
   ============================================================================== */

function populateSettingsForm() {
  document.getElementById('settings-student-name').value = AppState.profile.name || '';
  document.getElementById('settings-institution').value = AppState.profile.school || '';
  document.getElementById('settings-major').value = AppState.profile.major || '';
  document.getElementById('settings-sound-toggle').checked = Boolean(AppState.profile.soundEnabled);
}

function handleProfileFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('settings-student-name').value.trim();
  const school = document.getElementById('settings-institution').value.trim();
  const major = document.getElementById('settings-major').value.trim();

  if (!name) return;

  AppState.profile.name = name;
  AppState.profile.school = school;
  AppState.profile.major = major;

  saveProfileToStorage();
  playAudioChime('success');
  showToast('Profile updated successfully!', 'success');

  // Update headers
  document.getElementById('sidebar-user-name').textContent = name;
  document.getElementById('sidebar-avatar').textContent = getInitials(name);
  document.getElementById('welcome-student-name').textContent = name;
}

/**
 * Toggle Dark & Light Mode Theme
 */
function setTheme(theme) {
  AppState.profile.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  saveProfileToStorage();
  playAudioChime('click');
  showToast(`Switched to ${theme === 'dark' ? 'Dark Navy' : 'Light Slate'} mode`, 'info');
}

/**
 * Export all workspace data as a downloadable JSON file
 */
function exportDataAsJSON() {
  const exportPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: AppState.profile,
    tasks: AppState.tasks,
    sessions: AppState.sessions,
    notes: AppState.notes
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `studyflow_backup_${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('StudyFlow backup downloaded successfully!', 'success');
}

/**
 * Import backup from a JSON file
 */
function handleImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported.tasks) && Array.isArray(imported.sessions)) {
        AppState.tasks = imported.tasks;
        AppState.sessions = imported.sessions;
        AppState.notes = Array.isArray(imported.notes) ? imported.notes : [];
        if (imported.profile) {
          AppState.profile = { ...AppState.profile, ...imported.profile };
        }

        saveTasksToStorage();
        saveSessionsToStorage();
        saveNotesToStorage();
        saveProfileToStorage();

        showToast('Backup restored successfully!', 'success');
        navigateTo(AppState.activeView);
      } else {
        showToast('Invalid backup file format.', 'danger');
      }
    } catch (err) {
      showToast('Failed to parse JSON file.', 'danger');
    }
  };
  reader.readAsText(file);
  // Reset input
  e.target.value = '';
}

/**
 * Reset to rich demo sample dataset
 */
function resetToDemoData() {
  openConfirmModal(
    'Reload Demo Data',
    'This will replace your current workspace items with the sample course dataset. Proceed?',
    () => {
      AppState.tasks = [...DEMO_TASKS];
      AppState.sessions = [...DEMO_SESSIONS];
      AppState.notes = [...DEMO_NOTES];
      AppState.profile = { ...DEMO_PROFILE };

      saveTasksToStorage();
      saveSessionsToStorage();
      saveNotesToStorage();
      saveProfileToStorage();

      playAudioChime('success');
      showToast('Sample student data restored!', 'success');
      navigateTo('dashboard');
    }
  );
}

/**
 * Clear All Workspace Data
 */
function clearAllWorkspaceData() {
  openConfirmModal(
    'Clear All Data',
    '⚠️ Are you absolutely sure? This will remove all your tasks, notes, and study sessions from browser storage.',
    () => {
      AppState.tasks = [];
      AppState.sessions = [];
      AppState.notes = [];

      saveTasksToStorage();
      saveSessionsToStorage();
      saveNotesToStorage();

      playAudioChime('delete');
      showToast('All workspace data has been cleared.', 'info');
      navigateTo('dashboard');
    }
  );
}

/* ==============================================================================
   12. MODAL & TOAST DIALOG HELPERS
   ============================================================================== */

let confirmCallback = null;

function openConfirmModal(title, message, onConfirm) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  confirmCallback = onConfirm;
  document.getElementById('modal-confirm').classList.add('active');
}

function closeConfirmModal() {
  document.getElementById('modal-confirm').classList.remove('active');
  confirmCallback = null;
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    info: 'ℹ',
    danger: '✕'
  };

  toast.innerHTML = `
    <span style="font-weight: 800; font-size: 1.1rem;">${iconMap[type] || '•'}</span>
    <span style="flex:1;">${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

/* ==============================================================================
   13. HELPER & UTILITY FUNCTIONS
   ============================================================================== */

function getTodayDateString() {
  const d = new Date();
  return formatDateComponents(d.getFullYear(), d.getMonth(), d.getDate());
}

function getFormattedDateOffset(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return formatDateComponents(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDateComponents(year, monthZeroIndexed, day) {
  const mm = String(monthZeroIndexed + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parseInt(parts[1], 10) - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime12Hour(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

function calculateDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  return Math.max(diff, 0);
}

function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  sidebar.classList.toggle('open');
  backdrop.classList.toggle('active');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
}

/* ==============================================================================
   14. INITIALIZATION & EVENT LISTENERS
   ============================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize persistent storage
  initStorage();

  // 2. Set theme from profile
  if (AppState.profile.theme) {
    document.documentElement.setAttribute('data-theme', AppState.profile.theme);
  }

  // 3. Format header date badge
  const headerDateEl = document.getElementById('header-date');
  if (headerDateEl) {
    const today = new Date();
    headerDateEl.textContent = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // 4. Navigation Links Click Handling
  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      window.location.hash = view;
      navigateTo(view);
    });
  });

  document.querySelectorAll('[data-nav-to]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = btn.getAttribute('data-nav-to');
      window.location.hash = view;
      navigateTo(view);
    });
  });

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== AppState.activeView) {
      navigateTo(hash);
    }
  });

  // 5. Mobile Navigation Listeners
  document.getElementById('mobile-menu-btn')?.addEventListener('click', toggleMobileSidebar);
  document.getElementById('sidebar-backdrop')?.addEventListener('click', closeMobileSidebar);

  // 6. Theme Toggle Buttons
  const toggleTheme = () => {
    const nextTheme = AppState.profile.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };
  document.getElementById('mobile-theme-btn')?.addEventListener('click', toggleTheme);
  document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
  document.getElementById('header-theme-btn')?.addEventListener('click', toggleTheme);
  document.getElementById('set-theme-dark-btn')?.addEventListener('click', () => setTheme('dark'));
  document.getElementById('set-theme-light-btn')?.addEventListener('click', () => setTheme('light'));

  // Sound toggle in settings
  document.getElementById('settings-sound-toggle')?.addEventListener('change', (e) => {
    AppState.profile.soundEnabled = e.target.checked;
    saveProfileToStorage();
    playAudioChime('click');
  });

  // 7. Quick Action Dropdown Menu
  const quickBtn = document.getElementById('quick-action-btn');
  const quickMenu = document.getElementById('quick-action-menu');
  if (quickBtn && quickMenu) {
    quickBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      quickMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      quickMenu.classList.remove('show');
    });

    document.getElementById('quick-add-task')?.addEventListener('click', () => {
      quickMenu.classList.remove('show');
      openTaskModal();
    });
    document.getElementById('quick-add-session')?.addEventListener('click', () => {
      quickMenu.classList.remove('show');
      openSessionModal();
    });
    document.getElementById('quick-add-note')?.addEventListener('click', () => {
      quickMenu.classList.remove('show');
      openNoteModal();
    });
  }

  // 8. Task Buttons & Forms
  document.getElementById('add-task-btn')?.addEventListener('click', () => openTaskModal());
  document.getElementById('form-task')?.addEventListener('submit', handleTaskFormSubmit);

  // Task Filter Toolbar Listeners
  const taskSearchInput = document.getElementById('task-search-input');
  const taskSearchClear = document.getElementById('task-search-clear');
  taskSearchInput?.addEventListener('input', (e) => {
    AppState.taskFilter.search = e.target.value;
    taskSearchClear.classList.toggle('visible', Boolean(e.target.value));
    renderTasksList();
  });
  taskSearchClear?.addEventListener('click', () => {
    taskSearchInput.value = '';
    AppState.taskFilter.search = '';
    taskSearchClear.classList.remove('visible');
    renderTasksList();
  });

  document.getElementById('filter-task-status')?.addEventListener('change', (e) => {
    AppState.taskFilter.status = e.target.value;
    renderTasksList();
  });
  document.getElementById('filter-task-priority')?.addEventListener('change', (e) => {
    AppState.taskFilter.priority = e.target.value;
    renderTasksList();
  });
  document.getElementById('filter-task-subject')?.addEventListener('change', (e) => {
    AppState.taskFilter.subject = e.target.value;
    renderTasksList();
  });
  document.getElementById('sort-tasks-by')?.addEventListener('change', (e) => {
    AppState.taskFilter.sort = e.target.value;
    renderTasksList();
  });

  // 9. Planner Buttons & Forms
  document.getElementById('add-session-btn')?.addEventListener('click', () => openSessionModal());
  document.getElementById('form-session')?.addEventListener('submit', handleSessionFormSubmit);
  document.getElementById('planner-date-picker')?.addEventListener('change', renderPlannerView);
  document.getElementById('planner-today-btn')?.addEventListener('click', () => {
    document.getElementById('planner-date-picker').value = getTodayDateString();
    renderPlannerView();
  });

  // 10. Calendar Month Navigation
  document.getElementById('cal-prev-month')?.addEventListener('click', () => {
    AppState.currentCalendarMonth--;
    if (AppState.currentCalendarMonth < 0) {
      AppState.currentCalendarMonth = 11;
      AppState.currentCalendarYear--;
    }
    renderCalendar();
  });
  document.getElementById('cal-next-month')?.addEventListener('click', () => {
    AppState.currentCalendarMonth++;
    if (AppState.currentCalendarMonth > 11) {
      AppState.currentCalendarMonth = 0;
      AppState.currentCalendarYear++;
    }
    renderCalendar();
  });
  document.getElementById('cal-today-btn')?.addEventListener('click', () => {
    const now = new Date();
    AppState.currentCalendarMonth = now.getMonth();
    AppState.currentCalendarYear = now.getFullYear();
    AppState.selectedCalendarDate = getTodayDateString();
    renderCalendar();
  });

  // 11. Notes Buttons & Forms
  document.getElementById('add-note-btn')?.addEventListener('click', () => openNoteModal());
  document.getElementById('form-note')?.addEventListener('submit', handleNoteFormSubmit);

  const noteSearchInput = document.getElementById('note-search-input');
  const noteSearchClear = document.getElementById('note-search-clear');
  noteSearchInput?.addEventListener('input', (e) => {
    AppState.noteFilter.search = e.target.value;
    noteSearchClear.classList.toggle('visible', Boolean(e.target.value));
    renderNotesList();
  });
  noteSearchClear?.addEventListener('click', () => {
    noteSearchInput.value = '';
    AppState.noteFilter.search = '';
    noteSearchClear.classList.remove('visible');
    renderNotesList();
  });

  document.getElementById('filter-note-subject')?.addEventListener('change', (e) => {
    AppState.noteFilter.subject = e.target.value;
    renderNotesList();
  });

  // 12. Settings Form & Actions
  document.getElementById('profile-form')?.addEventListener('submit', handleProfileFormSubmit);
  document.getElementById('export-data-btn')?.addEventListener('click', exportDataAsJSON);
  document.getElementById('import-data-input')?.addEventListener('change', handleImportJSON);
  document.getElementById('reset-demo-data-btn')?.addEventListener('click', resetToDemoData);
  document.getElementById('clear-all-data-btn')?.addEventListener('click', clearAllWorkspaceData);

  // 13. Modal Close Triggers
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) modal.classList.remove('active');
    });
  });

  // Close modals when clicking the backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });

  // Confirmation modal triggers
  document.getElementById('confirm-cancel-btn')?.addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-ok-btn')?.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirmModal();
  });

  // 14. Initial View Render based on URL hash or default
  const initialHash = window.location.hash.replace('#', '') || 'dashboard';
  navigateTo(initialHash);
});
