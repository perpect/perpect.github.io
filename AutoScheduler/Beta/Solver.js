import { Schedule } from "./Schedule.js";
import { TestRule, NightAfterNightOffRule2, NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule } from "./Rule.js";

function solve(schedule, rules){
  const D = schedule.days;
  const P = schedule.people.length;
  let nodes = 0;
  const trail = [];

  function mark() { return trail.length;}
  function rollback(level) {
    while (trail.length > level) {
      const [d, p, duty] = trail.pop();
      schedule.domain[d][p].add(duty);
    }
  }
  const neighbors = (d, p) => {
    const result = [];
    for (let i = 0; i < D; i++) {
      if (i !== d) result.push([i, p]);
    }
    for (let j = 0; j < P; j++) {
      if (j !== p) result.push([d, j]);
    }
    return result;
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
      prevDomain = new Set(schedule.domain[d][p]);
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

  function dfs(depth){
    const varPos = chooseVar();
    if (!varPos) return true;
    const [d, p] = varPos;
    const prevDomain = new Set(schedule.domain[d][p]);
    for (let duty of [...schedule.domain[d][p]]){
      nodes++;
      const snap = mark();
      schedule.setDuty(d, p, duty);
      if (forwardCheck(d, p)) {
        const res = dfs(depth + 1);
        if (res) return true;
      }
      schedule.unsetDuty(d, p, prevDomain);
      rollback(snap);
    }
    return false;
  }
  const res = dfs(0);
  return { solved : res, nodesVisited: nodes };
}

for (let i = 3; i <= 8; i++) {
const peopleDemo = Array.from({ length: i }, (_, j) => `사람${j + 1}`);
const schedDemo  = new Schedule(31, peopleDemo);

const rulesDemo  = [
  new NightAfterNightOffRule(),
  new EssentialDuty(),
  new NoConsecutiveOffRule(),
  new MinimalDutiesRule(),
  new NightAfterNightOffRule2()
];
[
  new MinimalDutiesRule()
  
];

console.time("solve");
const {solved,nodesVisited} = solve(schedDemo, rulesDemo);
console.timeEnd("solve");
console.log(`PeopleCount : ${i} | Solved: ${solved} | Nodes: ${nodesVisited - i * 31}`);
console.log(schedDemo.toString());
}
