import { DUTIES, Duty } from "./Duty.js";
import { solve } from "./Solver.js";
import { Schedule } from "./Schedule.js";
import { RULES_MASK, ALL_RULES, NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule } from "./Rule.js";

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const container = document.getElementById('container');
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const monthSelect = document.getElementById('month-select');
  const memberCountSpan = document.getElementById('member-count');
  const memberListDiv = document.getElementById('member-list');
  const addMemberBtn = document.getElementById('btnAddMember');
  const scheduleGridContainer = document.getElementById('schedule-grid-container');
  const generateBtn = document.getElementById('btnGenerate');
  const ruleSettingsDiv = document.getElementById('rule-settings');
  const calendarContainer = document.getElementById('calendar-container');
  const dutySelect = document.getElementById('duty-select');
  const memberSelect = document.getElementById('member-select');
  const newScheduleBtn = document.getElementById('new_schedule_btn');

  // --- State ---
  let state = {
    members: ["상민", "정민", "현수", "영철"],
    schedule: null,
    savedSchedules: [],
    activeRules: {},
    fixedDuties: {} // YYYY-MM-DD -> [{member, duty}]
  };

  // --- Local Storage ---
  function loadState() {
    const saved = localStorage.getItem('autoSchedulerState');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.members = parsed.members || state.members;
      state.savedSchedules = parsed.savedSchedules || [];
      state.activeRules = { ...state.activeRules, ...parsed.activeRules }; // Load saved rules, keep defaults
      state.fixedDuties = parsed.fixedDuties || {};
    }
  }

  function saveState() {
    const toSave = {
      members: state.members,
      savedSchedules: state.savedSchedules,
      activeRules: state.activeRules,
      fixedDuties: state.fixedDuties
    };
    localStorage.setItem('autoSchedulerState', JSON.stringify(toSave));
  }

  // --- UI Rendering ---
  function renderAll() {
    renderMemberList();
    renderRuleSettings();
    renderFixedDutySelectors();
    renderCalendar();
    renderScheduleGrid();
  }

  function renderMemberList() {
    memberCountSpan.textContent = state.members.length;
    memberListDiv.innerHTML = '';
    state.members.forEach((member, index) => {
      const row = document.createElement('div');
      row.className = 'member-item';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = member;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-secondary';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.style.padding = '2px 8px';
      deleteBtn.onclick = () => {
        state.members.splice(index, 1);
        renderAll();
        saveState();
      };
      
      row.appendChild(nameSpan);
      row.appendChild(deleteBtn);
      memberListDiv.appendChild(row);
    });
  }

  function renderRuleSettings() {
    ruleSettingsDiv.innerHTML = '';
    console.log(ALL_RULES); 
    for (const key in ALL_RULES) {
        const rule = ALL_RULES[key];
        const isChecked = state.activeRules[key];

        const label = document.createElement('label');
        label.className = 'rule-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;
        checkbox.onchange = () => {
            state.activeRules[key] = checkbox.checked;
            saveState();
        };

        const description = document.createElement('span');
        description.textContent = rule.description();

        label.appendChild(checkbox);
        label.appendChild(description);
        ruleSettingsDiv.appendChild(label);
    }
  }

  function renderFixedDutySelectors() {
    dutySelect.innerHTML = '';
    // Add a 'Remove' option
    const removeOption = document.createElement('option');
    removeOption.value = 'REMOVE';
    removeOption.textContent = '삭제';
    dutySelect.appendChild(removeOption);

    DUTIES.forEach(duty => {
        const option = document.createElement('option');
        option.value = duty.id;
        option.textContent = duty.label;
        dutySelect.appendChild(option);
    });

    memberSelect.innerHTML = '';
    state.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        memberSelect.appendChild(option);
    });
  }

  // --- Calendar Rendering ---
  function renderCalendar() {
    const year = parseInt(monthSelect.value.substring(0, 4));
    const month = parseInt(monthSelect.value.substring(5, 7)) - 1;

    calendarContainer.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `<h3>${year}년 ${month + 1}월</h3>`;
    calendarContainer.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day weekday-header';
        dayEl.textContent = day;
        dayEl.style.textAlign = 'center';
        dayEl.style.fontWeight = 'bold';
        dayEl.style.minHeight = 'auto';
        grid.appendChild(dayEl);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // Days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        grid.appendChild(dayEl);
    }

    // Days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        dayEl.dataset.date = dateStr;

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = i;
        dayEl.appendChild(dayNumber);

        const fixedDutiesContainer = document.createElement('div');
        fixedDutiesContainer.className = 'fixed-duties';
        dayEl.appendChild(fixedDutiesContainer);

        // Render fixed duties for this day
        if (state.fixedDuties[dateStr]) {
            state.fixedDuties[dateStr].forEach(fd => {
                const dutyEl = document.createElement('div');
                dutyEl.className = 'fixed-duty-item';
                const dutyInfo = DUTIES.find(d => d.id === fd.duty);
                dutyEl.innerHTML = `
                    <span class="duty-label">${dutyInfo.label}</span>
                    <span class="member-name">${fd.member}</span>
                `;
                dutyEl.classList.add(`duty-${dutyInfo.id.toUpperCase()}`);
                fixedDutiesContainer.appendChild(dutyEl);
            });
        }
        
        grid.appendChild(dayEl);
    }

    calendarContainer.appendChild(grid);
  }


  function renderScheduleGrid() {
    if (!state.schedule) {
      scheduleGridContainer.style.display = 'none';
      return;
    }
    scheduleGridContainer.style.display = 'flex';
    scheduleGridContainer.innerHTML = ''; // Clear previous tables

    const { grid, people, days } = state.schedule;
    const year = parseInt(monthSelect.value.substring(0, 4));
    const month = parseInt(monthSelect.value.substring(5, 7)) - 1;
    const startDate = new Date(year, month, 1);

    // --- Create Date Table ---
    const dateTable = document.createElement('table');
    dateTable.className = 'date-table';
    const dateThead = document.createElement('thead');
    const dateHeaderRow = document.createElement('tr');
    const dateTh = document.createElement('th');
    dateTh.textContent = '날짜';
    dateHeaderRow.appendChild(dateTh);
    dateThead.appendChild(dateHeaderRow);
    dateTable.appendChild(dateThead);

    const dateTbody = document.createElement('tbody');
    for (let d = 0; d < days; d++) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const currDate = new Date(startDate);
        currDate.setDate(startDate.getDate() + d);
        td.textContent = `${currDate.getMonth() + 1}/${currDate.getDate()}`;
        tr.appendChild(td);
        dateTbody.appendChild(tr);
    }
    dateTable.appendChild(dateTbody);

    // --- Create Duty Table ---
    const dutyTable = document.createElement('table');
    dutyTable.className = 'duty-table';
    const dutyThead = document.createElement('thead');
    const dutyHeaderRow = document.createElement('tr');
    people.forEach(p => {
      const th = document.createElement('th');
      th.textContent = p;
      dutyHeaderRow.appendChild(th);
    });
    dutyThead.appendChild(dutyHeaderRow);
    dutyTable.appendChild(dutyThead);

    const dutyTbody = document.createElement('tbody');
    for (let d = 0; d < days; d++) {
      const tr = document.createElement('tr');
      for (let p = 0; p < people.length; p++) {
        const td = document.createElement('td');
        const duty = grid[d][p];
        if (duty) {
          td.textContent = duty.label;
          td.className = `duty-${duty.id}`;
        }
        tr.appendChild(td);
      }
      dutyTbody.appendChild(tr);
    }
    dutyTable.appendChild(dutyTbody);

    scheduleGridContainer.appendChild(dateTable);
    scheduleGridContainer.appendChild(dutyTable);
  }

  // --- Event Handlers ---
  toggleSidebarBtn.addEventListener('click', () => {
    container.classList.toggle('sidebar-collapsed')
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = `page-${item.dataset.page}`;
      
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      pages.forEach(p => p.style.display = p.id === pageId ? 'block' : 'none');

      if (item.dataset.page === 'new') {
        renderAll();
      }
    });
  });

  monthSelect.addEventListener('change', () => {
    renderCalendar();
  });

  addMemberBtn.addEventListener('click', () => {
    const name = prompt('새 근무자 이름:');
    if (name && !state.members.includes(name)) {
      state.members.push(name);
      renderAll();
      saveState();
    } else if (name) {
      alert('이미 존재하는 이름입니다.');
    }
  });

  generateBtn.addEventListener('click', async () => {
    const spinner = document.getElementById('spinner');
    const generateText = document.getElementById('generate-text');
    
    spinner.style.display = 'block';
    generateText.style.display = 'none';
    generateBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 100)); // UI update

    try {
      const year = parseInt(monthSelect.value.substring(0, 4));
      const month = parseInt(monthSelect.value.substring(5, 7)) - 1;
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      const days = endDate.getDate();

      if (!monthSelect.value || state.members.length === 0) {
        alert("날짜와 근무자를 확인해주세요.");
        return;
      }

      const schedule = new Schedule(days, state.members);

      // Apply fixed duties to the schedule before solving
      for (const dateStr in state.fixedDuties) {
        const date = new Date(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
            const dayIndex = date.getDate() - 1;
            state.fixedDuties[dateStr].forEach(fd => {
                const personIndex = state.members.indexOf(fd.member);
                const duty = DUTIES.find(d => d.id === fd.duty);
                if (personIndex !== -1 && duty) {
                    schedule.domain[dayIndex][personIndex] = new Set([duty]);
                }
            });
        }
      }
      
      // Build rules based on user selection in the UI
      const rules = [];
      for (const key in state.activeRules) {
          if (state.activeRules[key]) {
              rules.push(ALL_RULES[key]);
          }
      }
      console.log(state.activeRules);

      if (rules.length === 0) {
        alert("적어도 하나 이상의 규칙을 선택해야 합니다.");
        return;
      }

      const result = solve(schedule, rules);

      if (result.solved) {
        state.schedule = result.bestSched;
        renderScheduleGrid();
      } else {
        alert('스케줄 생성에 실패했습니다. 규칙을 완화하거나 근무자를 추가해보세요.');
        state.schedule = null;
        renderScheduleGrid();
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다. 콘솔을 확인해주세요.');
    } finally {
      spinner.style.display = 'none';
      generateText.style.display = 'block';
      generateBtn.disabled = false;
    }
  });

  function handleDayInteraction(dayElement) {
    if (!dayElement || dayElement.classList.contains('other-month')) return;

    const date = dayElement.dataset.date;
    const selectedDutyId = dutySelect.value;
    const selectedMember = memberSelect.value;

    if (selectedDutyId === 'REMOVE') {
        // Remove a specific duty for the member
        if (state.fixedDuties[date]) {
            state.fixedDuties[date] = state.fixedDuties[date].filter(fd => fd.member !== selectedMember);
            if (state.fixedDuties[date].length === 0) {
                delete state.fixedDuties[date];
            }
        }
    } else {
        // Add or update a duty
        if (!state.fixedDuties[date]) {
            state.fixedDuties[date] = [];
        }
        // Remove any existing duty for this member on this day before adding a new one
        state.fixedDuties[date] = state.fixedDuties[date].filter(fd => fd.member !== selectedMember);
        state.fixedDuties[date].push({ member: selectedMember, duty: selectedDutyId });
    }

    saveState();
    renderCalendar(); // Re-render to show changes
  }

  calendarContainer.addEventListener('click', (e) => {
    const dayElement = e.target.closest('.calendar-day');
    handleDayInteraction(dayElement);
    if (dayElement && !dayElement.classList.contains('other-month')) {
        dayElement.classList.add('paint-over');
    }
  });

  // --- Initial Load ---
  const today = new Date();
  monthSelect.value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;

  loadState();
});