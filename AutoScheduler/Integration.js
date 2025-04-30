import { tokenize } from "./Lexer.js";
import { parse } from "./Parser.js";
import { evaluate } from "./Evaluator.js";

const spilCode = `
시작:
    비용 = 0
루프:
    만약 근무 == "야":
        만약 내일.근무 != "비":
            폐기
    비용 = 비용 + 1
판단:
    -비용
`;

function evaluateSchedule(scheduleTable, peopleInfo, dateInfo, spilAST) {
  const context = {
    scheduleTable: tableToMatrix(scheduleTable),
    cursor: null,
    근무자: null,
    당일: null
  };
  return evaluate(spilAST, context);
}

function tableToMatrix(scheduleTable) {
  const matrix = [];
  for (let i = 1; i < scheduleTable.tableInfo.length; i++) {
    const row = [];
    for (let j = 0; j < scheduleTable.tableInfo[i].length; j++) {
      const cell = scheduleTable.tableInfo[i][j];
      const classes = cell.className.split(" ");
      const type = classes.find(cls => cls.endsWith("Color"))?.replace("Color", "") ?? "";
      row.push(type);
    }
    matrix.push(row);
  }
  return matrix;
}

function extractScheduleData(scheduleTable) {
  return scheduleTable.tableInfo.slice(1).map(row =>
    row.map(cell => {
      const cls = cell.className.split(" ");
      return cls.find(c => c.endsWith("Color"))?.replace("Color", "") ?? "";
    })
  );
}

function createScheduleFromData(data, peopleInfo, dateInfo) {
  const table = new ScheduleTable(peopleInfo, dateInfo);
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      table.tableInfo[i + 1][j].className = "dayCell " + data[i][j] + "Color";
    }
  }
  return table;
}

async function simulatedAnnealing(initialTable, peopleInfo, dateInfo, spilAST, iterations = 1000) {
  let currentData = extractScheduleData(initialTable);
  let current = createScheduleFromData(currentData, peopleInfo, dateInfo);
  let result = evaluateSchedule(current, peopleInfo, dateInfo, spilAST);
  let currentScore = result.score;
  let trace = result.trace;

  let bestData = currentData;
  let bestScore = currentScore;

  let T = 100;
  const alpha = 0.95;

  for (let i = 0; i < iterations; i++) {
    const neighborData = generateNeighborFromTrace(currentData, trace);
    const neighbor = createScheduleFromData(neighborData, peopleInfo, dateInfo);
    const result = evaluateSchedule(neighbor, peopleInfo, dateInfo, spilAST);
    if (result.discarded) continue;

    const delta = result.score - currentScore;

    if (delta < 0 || Math.random() < Math.exp(-delta / T)) {
      currentData = neighborData;
      currentScore = result.score;
      trace = result.trace;

      if (currentScore < bestScore) {
        bestData = neighborData;
        bestScore = currentScore;
        visualizeTrace(trace, neighbor);
      }
    }
    T *= alpha;
  }

  return createScheduleFromData(bestData, peopleInfo, dateInfo);
}

function generateNeighborFromTrace(data, trace) {
  const newData = data.map(row => [...row]);
  if (trace.length === 0) return newData;

  const target = trace[Math.floor(Math.random() * trace.length)];
  const person = target.person;
  const day = target.day;

  const types = ["주", "야", "비"];
  const currentType = newData[person][day];

  const options = types.filter(t => t !== currentType);
  const newType = options[Math.floor(Math.random() * options.length)];
  newData[person][day] = newType;

  return newData;
}

function visualizeTrace(trace, table) {
  for (const { person, day } of trace) {
    const cell = table.tableInfo[person + 1]?.[day];
    if (cell) {
      cell.style.outline = "3px solid red";
      cell.style.animation = "blink 0.4s ease-in-out";
    }
  }
}