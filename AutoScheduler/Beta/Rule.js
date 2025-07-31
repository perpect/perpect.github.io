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
// Rule.js

class MinimalDutiesRule extends Rule {
  isPartialValid(schedule, dayIdx, personIdx){
    const personFillCount = schedule.personFillCount[personIdx];
    // schedule.duty(dayIdx, personIdx)가 아직 할당 안된 상태에서 호출될 수 있으므로,
    // 할당된 값을 기준으로 계산하기 위해 임시로 값을 더해줍니다.
    const currentDuty = schedule.duty(dayIdx, personIdx);
    if (!currentDuty) return true; // 값이 할당 안됐으면 판단 보류

    const left = schedule.days - personFillCount;
    const dayCnt   = schedule.personDutyCounts[personIdx][Duty.DAY];
    const nightCnt = schedule.personDutyCounts[personIdx][Duty.NIGHT];

    // 1. 기존 로직: 총 근무일 예측
    if (dayCnt + nightCnt + left < 15) return false;

    // 2. 강화된 로직: 최소 근무 시간 예측
    const currentHours = schedule.personDutyHours[personIdx];
    const maxFutureHours = left * Duty.NIGHT.hours; // 남은 날 모두 야간 근무(최대 시간) 가정
    if (currentHours + maxFutureHours < 160) return false;

    // 3. 강화된 로직: 최소 야간 근무 예측
    if (nightCnt === 0 && left > 0) {
      // 남은 날들의 도메인을 검사하여 NIGHT가 가능한지 확인
      let canDoNight = false;
      for (let d = dayIdx + 1; d < schedule.days; d++) {
        // 이 사람의 다음 날부터의 도메인에 NIGHT가 있는지 확인
        if (schedule.duty(d, personIdx) === null && schedule.getDomain(d, personIdx).has(Duty.NIGHT)) {
          canDoNight = true;
          break;
        }
      }
      if (!canDoNight) return false; // 남은 날에 야간 근무가 불가능하면 실패
    }
    
    return true;
  }

  isPersonValid(schedule, personIdx){
    const dayCnt = schedule.personDutyCounts[personIdx][Duty.DAY];
    const nightCnt = schedule.personDutyCounts[personIdx][Duty.NIGHT];
    return schedule.personDutyHours[personIdx] >= 160 && dayCnt + nightCnt >= 15 && nightCnt >= 1;
  }
}

export { Rule, NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule };