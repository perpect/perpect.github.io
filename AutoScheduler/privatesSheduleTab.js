// privatesSheduleTab.js (근무 설정 탭 CSS 클래스 재정비)
import { tokenize } from "./SPIL/Lexer.js";
import { parse } from "./SPIL/Parser.js";
import { simulatedAnnealing } from "./Integration.js";

function setupAutoGenerationUI(p, scheduleTableMgr, today) {
  const container = document.getElementById("privateTab-2");

  const textarea = document.createElement("textarea");
  textarea.id = "spilInput";
  textarea.rows = 8;
  textarea.style.width = "100%";
  textarea.value = `시작:
 비용 = 0
루프:
 만약 근무 == "야":
  만약 내일.근무 != "비":
   폐기
 비용 = 비용 + 1
판단:
 -비용`;

  const button = document.createElement("div");
  button.className = "smallBtn editBtn";
  button.id = "autoGenerateBtn";
  button.textContent = "자동 근무표 생성";

  button.addEventListener("click", async () => {
    const code = textarea.value;
    const spilAST = parse(tokenize(code));
    const current = scheduleTableMgr.getSchedule(today);
    if (!current) return alert("근무표 없음");
    const optimized = await simulatedAnnealing(current, p, today, spilAST, 300);
    scheduleTableMgr.add(optimized, today, true);
    scheduleTableMgr.update(document.getElementById("privateTable"));
  });

  container.appendChild(textarea);
  container.appendChild(button);
}

function setupScheduleConfigUI(scheduleController) {
  const container = document.getElementById("privateTab-3");
  container.innerHTML = "";

  const inputId = document.createElement("input");
  inputId.placeholder = "SPIL 키 (예: day)";

  const inputName = document.createElement("input");
  inputName.placeholder = "표시 이름 (예: 주간)";

  const inputColor = document.createElement("input");
  inputColor.type = "color";
  inputColor.value = "#cccccc";

  const inputStart = document.createElement("input");
  inputStart.type = "time";
  inputStart.value = "09:00";

  const inputEnd = document.createElement("input");
  inputEnd.type = "time";
  inputEnd.value = "18:00";

  const formRow = document.createElement("div");
  formRow.className = "scheduleConfigRow";
  [inputId, inputName, inputColor, inputStart, inputEnd].forEach(el => formRow.appendChild(el));

  const addBtn = document.createElement("button");
  addBtn.textContent = "근무 추가";
  addBtn.className = "scheduleConfigAddBtn";

  addBtn.onclick = () => {
    const id = inputId.value.trim();
    const name = inputName.value.trim();
    const color = inputColor.value;
    const time = [inputStart.value, inputEnd.value];

    if (!id || !name || !time[0] || !time[1]) return alert("모든 항목을 입력하세요");
    if (scheduleController.hasTypeId(id)) return alert("이미 존재하는 ID입니다.");

    scheduleController.addScheduleType({ id, name, color, time });
    scheduleController.refresh(container);
    inputId.value = "";
    inputName.value = "";
  };

  container.appendChild(formRow);
  container.appendChild(addBtn);
  scheduleController.refresh(container);
}

function setupManualEdit(scheduleController, scheduleTableMgr, today) {
  const container = document.getElementById("privateTab-1");
  const table = scheduleTableMgr.getSchedule(today);
  if (!table) return;

  for (let i = 1; i < table.tableInfo.length; i++) {
    for (let j = 0; j < table.tableInfo[i].length; j++) {
      const cell = table.tableInfo[i][j];
      cell.style.cursor = "pointer";
      cell.onclick = () => {
        const type = scheduleController.nowId;
        const types = scheduleController.getAllTypeIds();
        types.forEach(t => cell.classList.remove(t + "Color"));
        cell.classList.add(type + "Color");
      };
    }
  }
}

if (typeof ScheduleController !== 'undefined') {
  ScheduleController.prototype.addScheduleType = function(typeObj) {
    this.scheduleTypeData = this.scheduleTypeData || [];
    this.scheduleTypeData.push(typeObj);
  };

  ScheduleController.prototype.hasTypeId = function(id) {
    return this.scheduleTypeData?.some(t => t.id === id);
  };

  ScheduleController.prototype.getAllTypeIds = function() {
    return (this.scheduleTypeData || []).map(t => t.id);
  };

  ScheduleController.prototype.refresh = function(parent) {
    const old = parent.querySelector(".scheduleTypeButtonWrap");
    if (old) old.remove();

    const btnWrap = document.createElement("div");
    btnWrap.className = "scheduleTypeButtonWrap";
    (this.scheduleTypeData || []).forEach(type => {
      const btn = document.createElement("button");
      btn.className = "smallBtn";
      btn.innerText = type.name;
      btn.style.backgroundColor = type.color;
      btn.onclick = () => {
        this.selectBtn(type.id);
        btnWrap.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
      if (type.id === this.nowId) btn.classList.add("selected");
      btnWrap.appendChild(btn);
    });
    parent.appendChild(btnWrap);
  };
}

export function patchAutoSchedulerUI(p, scheduleTableMgr, scheduleBtnCon, today) {
  setupAutoGenerationUI(p, scheduleTableMgr, today);
  setupScheduleConfigUI(scheduleBtnCon);
  setupManualEdit(scheduleBtnCon, scheduleTableMgr, today);
}
