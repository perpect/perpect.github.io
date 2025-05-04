import { tokenize } from "./SPIL/Lexer.js";
import { parse } from "./SPIL/Parser.js";
import { simulatedAnnealing } from "./SimulatedAnnealing.js";

// 자동 근무 생성 탭
function setupAutoGenerationUI(p, scheduleTableMgr, today, scheduleBtnCon) {
  const container = document.getElementById("privateTab-2");
  container.innerHTML = "";

  const textarea = document.createElement("textarea");
  textarea.id = "spilInput";
  textarea.rows = 8;
  textarea.value = `시작:\n    비용 = 0\n루프:\n    만약 내일(0).근무 == "야":\n        만약 내일(1).근무 != "비":\n            폐기\n만약 길이(당일근무자("야")) == 0:\n    폐기\n판단:\n    -비용`;
  const button = document.createElement("div");
  button.className = "smallBtn editBtn";
  button.id = "autoGenerateBtn";
  button.textContent = "자동 근무표 생성";

  button.addEventListener("click", async () => {
      const code = textarea.value;
      const spilAST = parse(tokenize(code));
      const current = scheduleTableMgr.getSchedule(today);
      if (!current) return alert("근무표 없음");

      const optimized = await simulatedAnnealing(current, spilAST, scheduleBtnCon, 3000);
      scheduleTableMgr.add(optimized, today, true);
      scheduleTableMgr.update(document.getElementById("privateTable"));
    
  });

  container.appendChild(textarea);
  container.appendChild(button);
}

// 근무 유형 설정 탭
function setupScheduleConfigUI(scheduleController) {
  const container = document.getElementById("privateTab-3");
  container.innerHTML = "";

  if (!scheduleController) {
    console.warn("ScheduleController가 정의되지 않았습니다.");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "scheduleConfigContainer";

  const makeRow = (labelText, inputElem) => {
    const row = document.createElement("div");
    row.className = "scheduleConfigRow";

    const label = document.createElement("label");
    label.textContent = labelText;

    row.appendChild(label);
    row.appendChild(inputElem);
    return row;
  };

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

  wrapper.appendChild(makeRow("SPIL 키", inputId));
  wrapper.appendChild(makeRow("표시 이름", inputName));
  wrapper.appendChild(makeRow("색상", inputColor));
  wrapper.appendChild(makeRow("시작 시간", inputStart));
  wrapper.appendChild(makeRow("종료 시간", inputEnd));

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

  wrapper.appendChild(addBtn);
  container.appendChild(wrapper);
  scheduleController.refresh(container);
}

// 수동 편집 탭
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

// ScheduleController 확장 메서드 방어코드 포함
if (typeof ScheduleController !== 'undefined') {
  ScheduleController.prototype.addScheduleType = function(typeObj) {
    this.scheduleTypeData = this.scheduleTypeData || [];
    this.scheduleTypeData.push(typeObj);
  };

  ScheduleController.prototype.hasTypeId = function(id) {
    return (this.scheduleTypeData || []).some(t => t.id === id);
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
  setupAutoGenerationUI(p, scheduleTableMgr, today, scheduleBtnCon);
  setupScheduleConfigUI(scheduleBtnCon);
  setupManualEdit(scheduleBtnCon, scheduleTableMgr, today);
}