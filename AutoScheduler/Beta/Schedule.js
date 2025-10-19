import { DUTIES } from "./Duty.js";

class Schedule {
  constructor(days, people) {
    this.days   = days;
    this.people = people;
    this.grid   = Array.from({ length: days }, () =>
      Array(people.length).fill(null)
    );
    const filteredDuties = DUTIES.filter(d => d.isLeft === false);
    this.domain = Array.from({length:days},()=>Array.from({length:people.length},()=>new Set(filteredDuties)));
    this.dayDutyCounts = Array.from({ length: days }, () =>
        Object.fromEntries(filteredDuties.map(duty => [duty, 0]))
    );
    this.dayDutyHours = Array(days).fill(0);
    this.dayFillCount = Array(days).fill(0);

    this.personDutyCounts = Array.from({ length: people.length }, () =>
        Object.fromEntries(filteredDuties.map(duty => [duty, 0]))
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

  unsetDuty(dayIdx, personIdx, prevDomain = new Set(DUTIES.filter(d => d.isLeft === false))) {
    const duty = this.grid[dayIdx][personIdx];
    if (!duty) return;
    this.grid[dayIdx][personIdx] = null;
    
    this.dayDutyCounts[dayIdx][duty]--;
    this.personDutyCounts[personIdx][duty]--;

    this.dayDutyHours[dayIdx] -= duty.hours;
    this.personDutyHours[personIdx] -= duty.hours;

    this.dayFillCount[dayIdx]--;
    this.personFillCount[personIdx]--;

    this.domain[dayIdx][personIdx] = prevDomain;
  }

  snapshot(){ return new ScheduleSnapShot(this); }
  duty(dayIdx, personIdx) { return this.grid[dayIdx][personIdx]; }
  isPersonFilled(personIdx) { return this.personFillCount[personIdx] >= this.days; }
  isDayFilled(dayIdx) { return this.dayFillCount[dayIdx] >= this.people.length; }

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

class ScheduleSnapShot {
  constructor(s){
    this.days = s.days;
    this.people = s.people;
    this.grid = s.grid.map(i => [...i]);
    this.domain = [];
    for (let i = 0; i < s.domain.length; i++) {
      this.domain.push([]);
      for (let j = 0; j < s.domain[i].length; j++){
        this.domain[i].push(new Set(s.domain[i][j]));
      }
    }
  }

  toString(){
    const header = [" ", ...this.people].join("\t");
    const rows   = this.grid.map((row, d) => [
      `D${d+1}`,
      ...row.map(cell => cell ? cell.toString() : "-")
    ].join("\t"));
    return [header, ...rows].join("\n");
  }
}

export { Schedule, ScheduleSnapShot };