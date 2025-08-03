import { Duty } from "./Duty.js";
class Rule {
  isPartialValid(_schedule, _dayIdx, _personIdx){ return true; }
  isPersonValid(_schedule, _personIdx){ return true; }
  isDayValid   (_schedule, _dayIdx){ return true; }
  isFinalValid (_schedule){ return true; }
}

class NightAfterNightOffRule extends Rule {
  isPartialValid(schedule, day, person) {
    if (day == 0) return true;
    const cur = schedule.duty(day, person);
    const prev = schedule.duty(day - 1, person);
    return !(prev === Duty.NIGHT && cur !== Duty.OFF);    
  }
}

class NightAfterNightOffRule2 extends Rule {
  isPartialValid(schedule, day, person) {
    if (day == schedule.days - 1) return true;
    const cur = schedule.duty(day, person);
    const next = schedule.duty(day + 1, person);
    return !(cur === Duty.NIGHT && next !== null && next !== Duty.OFF);    
  }
}


// 하루에 NIGHT 1명만 허용
class EssentialDuty extends Rule {
  isPartialValid(schedule, dayIdx){
    return schedule.dayDutyCounts[dayIdx][Duty.NIGHT] <= 1;
  }
  isDayValid(schedule, dayIdx){
    return schedule.dayDutyCounts[dayIdx][Duty.NIGHT] == 1 && schedule.dayDutyCounts[dayIdx][Duty.DAY] >= 1;
  }
}

// OFF 연속 금지
class NoConsecutiveOffRule extends Rule {
  isPartialValid(schedule, dayIdx, personIdx){
    if (dayIdx == 0) return true;
    const now = schedule.duty(dayIdx, personIdx);
    const prev = schedule.duty(dayIdx - 1, personIdx);
    return !(now === Duty.OFF && prev === Duty.OFF);
  }
}

// 최소 근무 조건
class MinimalDutiesRule extends Rule {
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
  isPersonValid(schedule, personIdx){
    const nightCnt = schedule.personDutyCounts[personIdx][Duty.NIGHT];
    return nightCnt >= 1;
  } 
}

export { TestRule, NightAfterNightOffRule2, NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule };