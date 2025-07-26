// privateScheduleList.js (스타일 제거)
import { extractScheduleData, createScheduleFromData } from "./Integration.js";

export function setupScheduleListTab(scheduleTableMgr, today, p) {
  const container = document.getElementById("privateTab-0");
  container.innerHTML = "";

  const dateKey = today.toString();

  if (!scheduleTableMgr.scheduleTables[dateKey] || scheduleTableMgr.scheduleTables[dateKey].length === 0) {
    const defaultSchedule = new ScheduleTable(p, today);
    scheduleTableMgr.add(defaultSchedule, today, true);
  }

  const list = scheduleTableMgr.scheduleTables[dateKey];
  const wrap = document.createElement("div");
  wrap.className = "scheduleCardContainer";

  list.forEach((schedule, index) => {
    const card = new ScheduleCard("plan", index, index === scheduleTableMgr.mainScheduleTable[dateKey], {
      select: (id) => {
        scheduleTableMgr.mainScheduleTable[dateKey] = id;
        scheduleTableMgr.update(document.getElementById("privateTable"));
      },
      copy: (id) => {
        const origin = scheduleTableMgr.scheduleTables[dateKey][id];
        const newSchedule = createScheduleFromData(extractScheduleData(origin), p, today);
        scheduleTableMgr.add(newSchedule, today);
        setupScheduleListTab(scheduleTableMgr, today, p);
      },
      remove: (id) => {
        if (scheduleTableMgr.scheduleTables[dateKey].length <= 1) {
          alert("최소 1개의 안건은 유지해야 합니다.");
          return;
        }
        scheduleTableMgr.scheduleTables[dateKey].splice(id, 1);
        if (scheduleTableMgr.mainScheduleTable[dateKey] >= id) {
          scheduleTableMgr.mainScheduleTable[dateKey] = Math.max(0, scheduleTableMgr.mainScheduleTable[dateKey] - 1);
        }
        setupScheduleListTab(scheduleTableMgr, today, p);
        scheduleTableMgr.update(document.getElementById("privateTable"));
      }
    });

    wrap.appendChild(card.elem);
  });

  const addBtn = document.createElement("div");
  addBtn.className = "scheduleCardAddBtn";
  addBtn.innerText = "+ 안건 추가";

  addBtn.onclick = () => {
    const base = scheduleTableMgr.getSchedule(today);
    const newSchedule = createScheduleFromData(extractScheduleData(base), p, today);
    scheduleTableMgr.add(newSchedule, today);
    setupScheduleListTab(scheduleTableMgr, today, p);
  };

  wrap.appendChild(addBtn);
  container.appendChild(wrap);
}
