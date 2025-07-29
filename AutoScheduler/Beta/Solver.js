import { Duty, DUTIES, DutyType } from "./Duty.js";
import { Schedule } from "./Schedule.js";
import { Rule, NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule } from "./Rule.js";

function solve(schedule, rules){
  const D = schedule.days;
  const P = schedule.people.length;
  let nodes = 0;

  const indexOf = (d, p) => d * P + p;
  const levelOf = [];
  const parentOf = [];

  const rowNeighbors  = Array.from({ length: D }, (_,d)=>
    Array.from({ length: P }, (_,p)=> [...Array(P).keys()].filter(j => j !== p).map(j => [d, j]))
  );
  
  const colNeighbors  = Array.from({ length: P }, (_,p)=>
    Array.from({ length: D }, (_,d)=> [...Array(D).keys()].filter(i => i!==d).map(i => [i, p]))
  );

  function neighborsOf(day, person){
    return rowNeighbors[day][person].concat(colNeighbors[person][day]);
  }

  function removeCandidate(day, person, duty, trail){
    const dom = schedule.domain[day][person];
    if (dom.has(duty)){
      dom.delete(duty);
      trail.push({ day, person, duty });
    }
  }

  function undo(trail){
    for (let i = trail.length - 1; i >= 0; i--){
      const { day, person, duty } = trail[i];
      schedule.domain[day][person].add(duty);
    }
  }

function forwardCheck(schedule, rules, day, person, trail){
  for (const rule of rules){
    if (!rule.isPartialValid(schedule, day, person)) return false;
  }
  for (const [d2, p2] of neighborsOf(day, person)){
    if (schedule.duty(d2, p2)) continue;
    for (const duty of [...schedule.domain[d2][p2]]){
      schedule.setDuty(d2, p2, duty);
      const ok = rules.every(r => r.isPartialValid(schedule, d2, p2));
      schedule.unsetDuty(d2, p2);
      if (!ok) removeCandidate(d2, p2, duty, trail);
    }
    if (schedule.domain[d2][p2].size === 0) return false;
  }
  return true;
}


  function chooseVar(){
    let best = null, bestSize = Infinity;
    for (let d = 0; d < D; d++){
      if (schedule.isDayFilled(d)) continue;
      for (let p = 0; p < P; p++){
        if (schedule.duty(d, p)) continue;
        const size = schedule.getDomain(d, p).size;
        if (size < bestSize){
          best = [d, p];
          bestSize = size;
          if (size === 1) return best;
        }
      }
    }
    return best;
  }

  function countPruned(d, p, duty){
    let pruned = 0;
    schedule.setDuty(d, p, duty);

    for (const [d2, p2] of neighborsOf(d, p)){
      if (schedule.duty(d2, p2)) continue;
      for (const cand of schedule.domain[d2][p2]){
        schedule.setDuty(d2, p2, cand);
        const ok = rules.every(r => r.isPartialValid(schedule, d2, p2));
        schedule.unsetDuty(d2, p2);
        if (!ok) pruned++;
      }
    }

    schedule.unsetDuty(d, p);
    return pruned;
  }


  function dfs(depth){
    const varPos = chooseVar();
    if (!varPos){
      const okFinal = rules.every(r=>r.isFinalValid(schedule));
      if (okFinal) return { success:true, conflict:new Set(), jumpDepth:-1 };
      const cf = new Set();
      for (let d = 0; d < D; d++){
        if (!rules.every(r => r.isDayValid(schedule,d)))
          for (let p = 0; p < P; p++) cf.add(indexOf(d, p));
      }
      for (let p = 0; p < P; p++){
        if (!rules.every(r => r.isPersonValid(schedule, p)))
          for (let d = 0; d < D; d++) cf.add(indexOf(d, p));
      }
      return { success: false, conflict: cf, jumpDepth: -1 };
    }

    const [d, p] = varPos;
    const varIdx = indexOf(d, p);
    levelOf[depth] = varIdx;
    parentOf[depth] = depth - 1;

    let XiConflict = new Set();

    const candidates = [...schedule.domain[d][p]]
      .map(duty => ({ duty, prune: countPruned(d, p, duty) }))
      .sort((a, b) => a.prune - b.prune);
    
    for (let duty of candidates){
      duty = duty.duty;
      nodes++;
      const trail = [];
      schedule.setDuty(d, p, duty);

      let ok = forwardCheck(schedule, rules, d, p, trail);
      if (ok && schedule.isDayFilled(d)) ok = rules.every(r => r.isDayValid(schedule, d));
      if (ok && schedule.isPersonFilled(p)) ok = rules.every(r => r.isPersonValid(schedule, p));
      if (ok) {
        const res = dfs(depth + 1);
        if (res.success) return res;
        for (const v of res.conflict) XiConflict.add(v);
      }

      schedule.unsetDuty(d, p);
      undo(trail);
    }
    XiConflict.delete(varIdx);

    let jumpDepth = -1;
    if (XiConflict.size > 0) {
      let maxLevel = -1;
      for (const idx of XiConflict) {
        const lv = levelOf.indexOf(idx);
        if (lv > maxLevel) {
          maxLevel = lv;
        }
      }
      jumpDepth = maxLevel;
    } else {
      jumpDepth = depth - 1;
    }
    return { success : false, conflict : XiConflict, jumpDepth };
  }

  const res = dfs(0);
  return { solved : res.success, nodesVisited: nodes };
}

//-------------------------------------
// 5. 데모 (node 실행 시)
//-------------------------------------
const peopleDemo = ["선규", "민수", "정민", "신1", "신2", "신3", "신4", "신5"];
//const peopleDemo = ["선규", "민수", "정민"];
const schedDemo  = new Schedule(31, peopleDemo);

const rulesDemo  = [
  new NightAfterNightOffRule(),
  new EssentialDuty(),
  new NoConsecutiveOffRule(),
  new MinimalDutiesRule()
];

console.time("solve");
const {solved,nodesVisited} = solve(schedDemo, rulesDemo);
console.timeEnd("solve");
console.log("Solved:", solved, " | Nodes:", nodesVisited);
console.log(schedDemo.toString());
