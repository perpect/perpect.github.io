function solveCDBJ(schedule, rules){
  const P = schedule.people.length;
  const numVars = schedule.days * P;
  let nodes=0;

  const assigned  = new Array(numVars).fill(null);

  const idx2cell = idx => ({ day: Math.floor(idx/P), person: idx%P });

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