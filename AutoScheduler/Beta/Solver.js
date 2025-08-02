import { Schedule } from "./Schedule.js";
import { NightAfterNightOffRule, EssentialDuty, NoConsecutiveOffRule, MinimalDutiesRule } from "./Rule.js";

function solve(schedule, rules){
  const D = schedule.days;
  const P = schedule.people.length;
  let nodes = 0;
  const rowNeighbors  = Array.from({ length: D }, (_,d)=>
    Array.from({ length: P }, (_,p)=> [...Array(P).keys()].filter(j => j !== p).map(j => [d, j]))
  );
  const colNeighbors  = Array.from({ length: P }, (_,p)=>
    Array.from({ length: D }, (_,d)=> [...Array(D).keys()].filter(i => i !== d).map(i => [i, p]))
  );

  const neighbors = Array.from({ length: D }, (_,d)=>
    Array.from({ length: P }, (_,p)=>
      [...rowNeighbors[d][p], ...colNeighbors[p][d]] 
    )
  );
  
  function removeCandidate(day, person, duty, trail){
    const dom = schedule.domain[day][person];
    if (dom.has(duty)){
      dom.delete(duty);
      trail.push([day, person, duty]);
    }
  }

  function undo(trail){
    while (trail.length > 0){
      const [d, p, duty] = trail.pop();
      schedule.domain[d][p].add(duty);
    }
  }

  function forwardCheck(schedule, rules, day, person){
    const trail = [];
    for (const rule of rules){
      let ok = rule.isPartialValid(schedule, day, person);
      if (ok && schedule.isDayFilled(day)) ok = rule.isDayValid(schedule, day);
      if (ok && schedule.isPersonFilled(person)) ok = rule.isPersonValid(schedule, person);
      if (!ok) return false;
    }
    for (const [d, p] of neighbors[day][person]){
      if (schedule.duty(d, p)) continue;
      const prevDomain = schedule.getDomain(d, p);
      for (const duty of prevDomain){
        schedule.setDuty(d, p, duty);
        let ok = true;
        for (const rule of rules){
          ok = rule.isPartialValid(schedule, d, p);
          if (ok && schedule.isDayFilled(d)) ok = rule.isDayValid(schedule, d);
          if (ok && schedule.isPersonFilled(p)) ok = rule.isPersonValid(schedule, p);
          if (!ok) break;
        }
        schedule.unsetDuty(d, p, prevDomain);
        if (!ok) removeCandidate(d, p, duty, trail);
      }
      if (schedule.getDomain(d, p).size === 0) {
        undo(trail);
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
        const size = schedule.getDomain(d, p).size;
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
    for (let duty of schedule.domain[d][p]){
      nodes++;
      const prevDomain = schedule.getDomain(d, p);
      schedule.setDuty(d, p, duty);
      let ok = forwardCheck(schedule, rules, d, p);
      if (ok) {
        const res = dfs(depth + 1);
        if (res) return true;
      }
      schedule.unsetDuty(d, p, prevDomain);
    }
    return false;
  }
  const res = dfs(0);
  return { solved : res, nodesVisited: nodes };
}

for (let i = 3; i <= 7; i++) {
const peopleDemo = Array.from({ length: i }, (_, j) => `사람${j + 1}`);
const schedDemo  = new Schedule(31, peopleDemo);

const rulesDemo  = [
  new NightAfterNightOffRule(),
  new EssentialDuty(),
  new NoConsecutiveOffRule(),
  new MinimalDutiesRule()
];
[
  new MinimalDutiesRule()
  
];

console.time("solve");
const {solved,nodesVisited} = solve(schedDemo, rulesDemo);
console.timeEnd("solve");
console.log(`PeopleCount : ${i} | Solved: ${solved} | Nodes: ${nodesVisited}`);
console.log(schedDemo.toString());
}
