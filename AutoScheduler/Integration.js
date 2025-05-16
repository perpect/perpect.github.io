// Integration.js - SPIL 평가 및 schedule 변환 유틸 모음
import { evaluate } from "./SPIL/Evaluator.js";

export function extractScheduleData(schedule) {
  return schedule.tableInfo.slice(1).map(row => row.map(cell => cell.dataset?.type || ""));
}

export function createScheduleFromData(data, peopleInfo, dateInfo) {
  const newSchedule = new ScheduleTable(peopleInfo, new Date(dateInfo));
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      newSchedule.workData[i][j] = data[i][j];
    }
  }
  return newSchedule;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}