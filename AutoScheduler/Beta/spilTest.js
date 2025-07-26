//-------------------------------------
// 0. 상수 및 헬퍼
//-------------------------------------
class DutyType {
  constructor(id, label, hours, isDay = false, isNight = false, isLeft = false) {
    this.id = id;
    this.label = label;
    this.hours = hours;
    this.isDay = isDay;
    this.isNight = isNight;
    this.isLeft = isLeft;
  }
}

const Duty = Object.freeze({
  DAY:   new DutyType("DAY", 10, isDay = true),
  NIGHT: new DutyType("NIGHT", 14, isNight = true),
  OFF:   new DutyType("OFF", 0),
  ALL:   new DutyType("ALL", 24, isDay = true, isNight = true),
  VACATION: new DutyType("VACATION", 0, isLeft = true)
});
const DUTIES = Object.values(Duty);

//-------------------------------------
// 1. Schedule 클래스
//-------------------------------------
class Schedule {
  constructor(days, people) {
    this.days   = days;
    this.people = people;
    this.grid   = Array.from({ length: days }, () =>
      Array(people.length).fill(null)
    );
  }
  /* 배치 / 취소 */
  setDuty(dayIdx, personIdx, duty) { this.grid[dayIdx][personIdx] = duty; }
  unsetDuty(dayIdx, personIdx)     { this.grid[dayIdx][personIdx] = null; }
  duty(dayIdx, personIdx)          { return this.grid[dayIdx][personIdx]; }

  /* 행/열 채움 여부 */
  isRowFilled(personIdx){ return this.grid.every(row => row[personIdx] !== null); }
  isColumnFilled(dayIdx){ return this.grid[dayIdx].every(cell => cell !== null); }

  /* 디버그 출력 */
  toString(){
    const header = [" ", ...this.people].join("\t");
    const rows   = this.grid.map((row, d) => [
      `D${d+1}`,
      ...row.map(cell => cell ?? "-")
    ].join("\t"));
    return [header, ...rows].join("\n");
  }
}

//-------------------------------------
// 2. Rule 추상 클래스
//-------------------------------------
class Rule {
  isPartialValid(_s,_d,_p){ return true; }
  isPersonValid(_s,_d,_p){ return true; }
  isDayValid   (_s,_d,_p){ return true; }
  isFinalValid (_s){ return true; }
}

//-------------------------------------
// 3. 규칙 예시
//-------------------------------------
// 3‑1. 야근 다음날 OFF
class NightAfterNightOffRule extends Rule {
  isPartialValid(s, d, p){
    if (d === 0) return true;
    const now  = s.duty(d,   p);
    const prev = s.duty(d-1, p);
    return !(prev === Duty.NIGHT && now !== Duty.OFF);
  }
}
// 3‑2. 하루에 NIGHT 1명만 허용
class EssentialDuty extends Rule {
  isPartialValid(s,d){
    return s.grid[d].filter(x=>x===Duty.NIGHT).length <= 1;
  }
  isDayValid(s,d){
    const row = s.grid[d];
    return row.filter(x=>x===Duty.NIGHT).length === 1 && row.includes(Duty.DAY);
  }
}
// 3‑3. OFF 연속 금지
class NoConsecutiveOffRule extends Rule {
  isPartialValid(s,d,p){
    if (d===0) return true;
    const now=s.duty(d,p), prev=s.duty(d-1,p);
    return !(now===Duty.OFF && prev===Duty.OFF);
  }
}
// 3‑4. 최소 근무 조건
class MinimalDutiesRule extends Rule {
  isPartialValid(s,_d,p){
    const left = s.days - s.grid.filter(r=>r[p]!==null).length;
    const duties = s.grid.map(r=>r[p]);
    const dayCnt   = duties.filter(d=>d===Duty.DAY).length;
    const nightCnt = duties.filter(d=>d===Duty.NIGHT).length;
    if (dayCnt + nightCnt + left < 15) return false;
    return true;
  }
  isPersonValid(s,_d,p){
    const duties = s.grid.map(r=>r[p]);
    const dayCnt = duties.filter(d=>d===Duty.DAY).length;
    const nightCnt = duties.filter(d=>d===Duty.NIGHT).length;
    return dayCnt*10+nightCnt*14 >= 160 && dayCnt+nightCnt >= 15 && nightCnt>=1;
  }
}

//-------------------------------------
// 4. CDBJ 기반 솔버
//-------------------------------------
function solveCDBJ(schedule, rules){
  const P = schedule.people.length;
  const numVars = schedule.days * P; // 변수 == 셀
  let nodes=0;                       // 방문 노드 카운트

  // 충돌 집합 저장용
  const conflicts = Array.from({length:numVars}, ()=> new Set());
  const assigned  = new Array(numVars).fill(null);

  /* 인덱스 변환 헬퍼 */
  const idx2cell = idx => ({ day: Math.floor(idx/P), person: idx%P });

  /* 도메인 계산(Fwd check) */
  function domainOf(idx){
    const {day,person} = idx2cell(idx);
    return DUTIES.filter(duty => {
      schedule.setDuty(day, person, duty);
      let ok = rules.every(r=>r.isPartialValid(schedule, day, person));
      if(ok && schedule.isRowFilled(person)) ok = rules.every(r=>r.isPersonValid(schedule, day, person));
      if(ok && schedule.isColumnFilled(day)) ok = rules.every(r=>r.isDayValid(schedule, day, person));
      schedule.unsetDuty(day, person);
      return ok;
    });
  }

  /* MRV 선택 */
  function chooseVar(){
    let best=null, bestDom=null;
    for(let i=0;i<numVars;i++){
      if(assigned[i]!==null) continue;
      const dom=domainOf(i);
      if(dom.length===0) return {fail:true};
      if(bestDom===null||dom.length<bestDom.length){
        best=i; bestDom=dom;
        if(dom.length===1) break;
      }
    }
    if(best===null) return {complete:true};
    return {var:best, dom:bestDom};
  }

  /* 재귀 DFS + CDBJ */
  function dfs(){
    const pick = chooseVar();
    if(pick.complete) return {ok:true};
    if(pick.fail)     return {ok:false, conflict:new Set()};

    const X = pick.var;
    let CS  = new Set([X]);      // 현재 변수 포함
    const {day,person}=idx2cell(X);

    for(const duty of pick.dom){
      nodes++;
      assigned[X]=duty;
      schedule.setDuty(day,person,duty);

      const res = dfs();
      if(res.ok) return res;     // 해 찾음

      // 실패면 충돌 집합 합치기
      for(const v of res.conflict) CS.add(v);

      schedule.unsetDuty(day,person);
      assigned[X]=null;
    }

    // 모든 값 실패 → back‑jump
    if(CS.size===1) return {ok:false, conflict:CS}; // 루트까지 실패
    return {ok:false, conflict:CS};                 // 상위에 전달 (점프는 스택 unwind로 처리)
  }

  const result = dfs();
  return { solved: result.ok, nodesVisited: nodes };
}

//-------------------------------------
// 5. 데모 (node 실행 시)
//-------------------------------------
const peopleDemo = ["선규","민수","정민", "경태", "세호", "영훈", "지수", "수빈", "현우", "지민"];
const schedDemo  = new Schedule(31, peopleDemo);
const rulesDemo  = [
  new NightAfterNightOffRule(),
  new EssentialDuty(),
  new NoConsecutiveOffRule(),
  new MinimalDutiesRule()
];

console.time("solveCDBJ");
const {solved,nodesVisited} = solveCDBJ(schedDemo, rulesDemo);
console.timeEnd("solveCDBJ");
console.log("Solved:", solved, " | Nodes:", nodesVisited);
console.log(schedDemo.toString());

//-------------------------------------
// 6. 모듈 내보내기 (ESM)
//-------------------------------------
export {
  Duty,
  Schedule,
  Rule,
  NightAfterNightOffRule,
  EssentialDuty,
  NoConsecutiveOffRule,
  MinimalDutiesRule,
  solveCDBJ
};