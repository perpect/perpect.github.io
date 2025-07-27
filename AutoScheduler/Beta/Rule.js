import { Duty } from "./Duty.js";
class Rule {
  isPartialValid(_schedule, _dayIdx, _personIdx){ return true; }
  isPersonValid(_schedule, _personIdx){ return true; }
  isDayValid   (_schedule, _dayIdx){ return true; }
  isFinalValid (_schedule){ return true; }
}

// 야근 다음날 OFF
class NightAfterNightOffRule extends Rule {
  isPartialValid(schedule, dayIdx, personIdx){
    if (dayIdx == 0) return true;
    const now  = schedule.duty(dayIdx, personIdx);
    const prev = schedule.duty(dayIdx - 1, personIdx);
    return !(prev === Duty.NIGHT && now !== Duty.OFF);
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
    const left = schedule.days - schedule.personFillCount[personIdx];
    const dayCnt   = schedule.personDutyCounts[personIdx][Duty.DAY];
    const nightCnt = schedule.personDutyCounts[personIdx][Duty.NIGHT];
    if (dayCnt + nightCnt + left < 15) return false;
    return true;
  }

  isPersonValid(schedule, personIdx){
    const dayCnt = schedule.personDutyCounts[personIdx][Duty.DAY];
    const nightCnt = schedule.personDutyCounts[personIdx][Duty.NIGHT];
    return schedule.personDutyHours[personIdx] >= 160 && dayCnt + nightCnt >= 15 && nightCnt >= 1;
  }
}

export { Rule, NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule };