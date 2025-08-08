import { Schedule } from "./Schedule.js";
import { NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule } from "./Rule.js";

function solve(schedule, rules){
  const D = schedule.days;
  const P = schedule.people.length;
  let nodes = 0;
  let bestCost = Infinity;
  let bestSched = null;
  let foundOptimal = false;
  const trail = [];

  function mark() { return trail.length;}
  function rollback(level) {
    while (trail.length > level) {
      const [d, p, duty] = trail.pop();
      schedule.domain[d][p].add(duty);
    }
  }
  function *neighbors(d, p) {
    for (let i = 0; i < D; i++) {
      if (i == d) continue;
      yield [i, p];
    }
    for (let j = 0; j < P; j++) {
      if (j == p) continue;
      yield [d, j];
    }
  }

  function removeCandidate(day, person, duty){
    const dom = schedule.domain[day][person];
    if (dom.has(duty)){
      dom.delete(duty);
      trail.push([day, person, duty]);
    }
  }

  function forwardCheck(day, person){
    const snap = mark();
    let prevDomain;
    for (const rule of rules){
      let ok = rule.isPartialValid(schedule, day, person);
      if (ok && schedule.isDayFilled(day)) ok = rule.isDayValid(schedule, day);
      if (ok && schedule.isPersonFilled(person)) ok = rule.isPersonValid(schedule, person);
      if (!ok) {
        rollback(snap);
        return false;
      }
    }
    for (const [d, p] of neighbors(day, person)){
      if (schedule.isDayFilled(d)) continue;
      if (schedule.isPersonFilled(p)) continue;
      if (schedule.duty(d, p)) continue;
      prevDomain = schedule.domain[d][p];
      for (const duty of [...schedule.domain[d][p]]){
        schedule.setDuty(d, p, duty);
        let ok = true;
        for (const rule of rules){
          ok = rule.isPartialValid(schedule, d, p);
          if (ok && schedule.isDayFilled(d)) ok = rule.isDayValid(schedule, d);
          if (ok && schedule.isPersonFilled(p)) ok = rule.isPersonValid(schedule, p);
          if (!ok) break;
        }
        schedule.unsetDuty(d, p, prevDomain);
        if (!ok) removeCandidate(d, p, duty);
      }
      if (schedule.domain[d][p].size === 0) {
        rollback(snap);
        return false;
      }
    }
    return true;
  }

  function heuristicLower(_d, _p){
    // 1) 현재 최대·최소 근무시간 차
    const hours = schedule.personDutyHours;
    const maxH  = Math.max(...hours);
    const minH  = Math.min(...hours);
    const gap   = maxH - minH;
    if (gap === 0) return 0;

    // 2) 최소 근무시간 그룹 중, 남은 칸이 가장 많은 사람 찾기
    let bestSlots = 0;
    for (let i = 0; i < hours.length; i++){
      if (hours[i] === minH){
        const slotsLeft = schedule.days - schedule.personFillCount[i];
        if (slotsLeft > bestSlots) bestSlots = slotsLeft;
      }
    }

    // 3) 야근(14h)만 맡긴다고 가정해도 따라잡을 수 있는 최대치
    const maxCatchUp = bestSlots * 14;
    const remainingMinCanCatchUp = Math.min(gap, maxCatchUp);

    // 4) 남는 격차 = admissible lower bound
    return gap - remainingMinCanCatchUp;
  }


  function chooseVar(){
    let best = null, bestSize = Infinity;
    for (let d = 0; d < D; d++){
      if (schedule.isDayFilled(d)) continue;
      for (let p = 0; p < P; p++){
        if (schedule.duty(d, p)) continue;
        const size = schedule.domain[d][p].size;
        if (size == 0) continue;
        if (size < bestSize){
          best = [d, p];
          bestSize = size;
          if (size === 1) return best;
        }
      }
    }
    return best;
  }

  function dfs(depth, curCost, lowerBound){
    if (lowerBound >= bestCost) return;
    const varPos = chooseVar();
    if (!varPos) {
      if (curCost < bestCost){
          bestCost   = curCost;
          bestSched  = schedule.snapshot();
          if (bestCost <= 10) foundOptimal = true;
      }
      return;
    }
    const [d, p] = varPos;
    const prevDomain = schedule.domain[d][p];
    for (let duty of [...schedule.domain[d][p]]){
      if (foundOptimal) return;
      nodes++;
      const snap = mark();
      schedule.setDuty(d, p, duty);
      if (forwardCheck(d, p)) {
        const nextCost       = Math.max(...schedule.personDutyHours) - Math.min(...schedule.personDutyHours);
        const nextLowerBound = nextCost + heuristicLower(d,p);
        dfs(depth + 1, nextCost, nextLowerBound);
      }
      schedule.unsetDuty(d, p, prevDomain);
      rollback(snap);
    }
  }
  dfs(0, 1000000, 1000000);
  return { solved : bestSched !== null, nodesVisited : nodes, bestSched : bestSched };
}

for (let i = 7; i <= 7; i++) {
  if (prompt()=="") continue;
const peopleDemo = Array.from({ length: i }, (_, j) => `사람${j + 1}`);
const schedDemo  = new Schedule(31, peopleDemo);

const rulesDemo  = [
  new NightAfterNightOffRule(),
  new EssentialDuty(),
  new NoConsecutiveOffRule(),
  new MinimalDutiesRule(),
];

console.time("solve");
const {solved, nodesVisited, bestSched} = solve(schedDemo, rulesDemo);
console.timeEnd("solve");
console.log(`PeopleCount : ${i} | Solved: ${solved} | Nodes: ${nodesVisited - i * 31}`);
console.log(bestSched.toString());
}
