import { DUTIES } from "./Duty.js";

class Schedule {
  constructor(days, people) {
    this.days   = days;
    this.people = people;
    this.grid   = Array.from({ length: days }, () =>
      Array(people.length).fill(null)
    );

    // 각 날과 사람에 대한 도메인 초기화
    this.domain = Array.from({length:days},()=>Array.from({length:people.length},()=>new Set(DUTIES)));

    // 각 날의 근무 유형 카운트 및 시간 합계
    this.dayDutyCounts = Array.from({ length: days }, () =>
        Object.fromEntries(DUTIES.map(duty => [duty, 0]))
    );
    this.dayDutyHours = Array(days).fill(0);
    this.dayFillCount = Array(days).fill(0);

    // 각 사람의 근무 유형 카운트 및 시간 합계
    this.personDutyCounts = Array.from({ length: people.length }, () =>
        Object.fromEntries(DUTIES.map(duty => [duty, 0]))
    );
    this.personDutyHours = Array(people.length).fill(0);
    this.personFillCount = Array(people.length).fill(0);
  }

  setDuty(dayIdx, personIdx, duty) {
    this.grid[dayIdx][personIdx] = duty;

    this.dayDutyCounts[dayIdx][duty]++;
    this.personDutyCounts[personIdx][duty]++;

    this.dayDutyHours[dayIdx] += duty.hours;
    this.personDutyHours[personIdx] += duty.hours;

    this.dayFillCount[dayIdx]++;
    this.personFillCount[personIdx]++;

    this.domain[dayIdx][personIdx] = new Set([duty]);
  }

  unsetDuty(dayIdx, personIdx) {
    const duty = this.grid[dayIdx][personIdx];
    if (!duty) return;
    this.grid[dayIdx][personIdx] = null;
    
    this.dayDutyCounts[dayIdx][duty]--;
    this.personDutyCounts[personIdx][duty]--;

    this.dayDutyHours[dayIdx] -= duty.hours;
    this.personDutyHours[personIdx] -= duty.hours;

    this.dayFillCount[dayIdx]--;
    this.personFillCount[personIdx]--;

    this.domain[dayIdx][personIdx] = new Set(DUTIES);
  }
  
  duty(dayIdx, personIdx) { return this.grid[dayIdx][personIdx]; }
  /* 행/열 채움 여부 */
  isRowFilled(personIdx) { return this.personFillCount[personIdx] >= this.days; }
  isColumnFilled(dayIdx) { return this.dayFillCount[dayIdx] >= this.people.length; }

  /* 디버그 출력 */
  toString(){
    const header = [" ", ...this.people].join("\t");
    const rows   = this.grid.map((row, d) => [
      `D${d+1}`,
      ...row.map(cell => cell ? cell.toString() : "-")
    ].join("\t"));
    return [header, ...rows].join("\n");
  }

  getDomain(dayIdx, personIdx) {
    return this.domain[dayIdx][personIdx];
  }
}

export { Schedule };