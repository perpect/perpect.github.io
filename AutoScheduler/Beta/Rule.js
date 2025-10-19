import { Duty } from "./Duty.js";
class Rule {
  description() { return "기본 규칙"; }
  isPartialValid(_schedule, _dayIdx, _personIdx){ return true; }
  isPersonValid(_schedule, _personIdx){ return true; }
  isDayValid   (_schedule, _dayIdx){ return true; }
  isFinalValid (_schedule){ return true; }
}

class NightAfterNightOffRule extends Rule {
  description() { return "야근 다음날은 반드시 휴무"; }
  isPartialValid(schedule, day, person) {
    let stop = true;
    if (day > 0){
      const cur = schedule.duty(day, person);
      const prev = schedule.duty(day - 1, person);
      if (prev === Duty.NIGHT && cur !== Duty.OFF) return false;
    }
    else return true;
    if (day < schedule.days - 1) {
      const cur = schedule.duty(day, person);
      const next = schedule.duty(day + 1, person);
      return !(cur === Duty.NIGHT && next !== null && next !== Duty.OFF);  
    }
    else return true;
  }
}

class EssentialDuty extends Rule {
  description() { return "하루에 야근 1명, 주간 1명 필수"; }
  isPartialValid(schedule, dayIdx){
    return schedule.dayDutyCounts[dayIdx][Duty.NIGHT] <= 1;
  }
  isDayValid(schedule, dayIdx){
    return schedule.dayDutyCounts[dayIdx][Duty.NIGHT] == 1 && schedule.dayDutyCounts[dayIdx][Duty.DAY] >= 1;
  }
}

// OFF 연속 금지
class NoConsecutiveOffRule extends Rule {
  description() { return "연속 휴무 금지"; }
  isPartialValid(schedule, dayIdx, personIdx){
    if (dayIdx == 0) return true;
    const now = schedule.duty(dayIdx, personIdx);
    const prev = schedule.duty(dayIdx - 1, personIdx);
    return !(now === Duty.OFF && prev === Duty.OFF);
  }
}

// 최소 근무 조건
class MinimalDutiesRule extends Rule {
  description() { return "최소 근무 조건 충족"; }
  isPartialValid(schedule, dayIdx, personIdx){
    const personFillCount = schedule.personFillCount[personIdx];

    const left = schedule.days - personFillCount;
    const dayCnt   = schedule.personDutyCounts[personIdx][Duty.DAY];
    const nightCnt = schedule.personDutyCounts[personIdx][Duty.NIGHT];

    // 1. 기존 로직: 총 근무일 예측
    if (dayCnt + nightCnt + left < 15) return false;

    // 2. 강화된 로직: 최소 근무 시간 예측
    const currentHours = schedule.personDutyHours[personIdx];
    const maxFutureHours = left * 14;
    if (currentHours + maxFutureHours < 160) return false;
    if (nightCnt === 0 && left == 0) return false;

    return true;
  }

  isPersonValid(schedule, personIdx){
    const dayCnt = schedule.personDutyCounts[personIdx][Duty.DAY];
    const nightCnt = schedule.personDutyCounts[personIdx][Duty.NIGHT];
    return schedule.personDutyHours[personIdx] >= 160 && dayCnt + nightCnt >= 15 && nightCnt >= 1;
  }
}

class TestRule extends Rule {
  description() { return "테스트용 규칙: 최소 1회 야근"; }
  isPersonValid(schedule, personIdx){
    const nightCnt = schedule.personDutyCounts[personIdx][Duty.NIGHT];
    return nightCnt >= 1;
  } 
}

var ALL_RULES = [
  new NightAfterNightOffRule(),
  new EssentialDuty(),
  new NoConsecutiveOffRule(),
  new MinimalDutiesRule()
]

var RULES_MASK = Object.fromEntries(ALL_RULES.map(rule => [rule.__proto__.constructor.name, true]))
ALL_RULES = Object.fromEntries(ALL_RULES.map(rule => [rule.__proto__.constructor.name, rule]))

export { RULES_MASK, ALL_RULES, TestRule, NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule };