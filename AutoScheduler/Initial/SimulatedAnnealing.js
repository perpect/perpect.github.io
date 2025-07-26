// SimulatedAnnealing.js
// ---------------------------------------------------------------------------
// Trace-based Simulated Annealing + Reverse-day Backtracking for SPIL schedules
//   • 백트래킹은 day 역순(D-1 → 0)으로 탐색 → ‘내일’ 셀이 이미 채워진 상태 보장
//   • 오늘·내일 두 day 모두 완전히 채워졌을 때만 evaluateAt / evaluate 호출
//   • adaptive cooling, trace-guided mutation
// ---------------------------------------------------------------------------

import { evaluate, evaluateAt } from "./SPIL/Evaluator.js";
import {
  extractScheduleData,
  createScheduleFromData,
  randInt
} from "./Integration.js";

/* ======================================================================== *
 *  Public entry
 * ------------------------------------------------------------------------ */

/**
 * @typedef {Object} SAOptions
 * @property {number} [iterations=20000]
 * @property {number} [initialTemp=100]
 * @property {number} [cooling=0.995]
 * @property {number} [minTemp=0.1]
 * @property {number} [mutationRatio=0.15]   – trace 셀 중 변이 비율
 */

/**
 * Trace-guided Simulated Annealing optimizer
 * @param {Object} scheduleObj  – ScheduleController.getSchedule(…) 결과
 * @param {Object} spilAST      – parsed SPIL AST
 * @param {ScheduleController}  scheduleController
 * @param {SAOptions} [opt]
 * @returns {Object}  최적화된 schedule 객체 (createScheduleFromData 반환)
 */
export async function simulatedAnnealing(
  scheduleObj,
  spilAST,
  scheduleController,
  opt = {}
) {
  /* ───── 파라미터 ───── */
  const ITERS   = opt.iterations     ?? 20000;
  const T0      = opt.initialTemp   ?? 100;
  const COOL    = opt.cooling       ?? 0.995;
  const T_MIN   = opt.minTemp       ?? 0.1;
  const MUT_R   = opt.mutationRatio ?? 0.15;

  /* ───── 초기 상태 ───── */
  const ids         = scheduleController.scheduleTypeData.map(t => t.id);
  const peopleInfo  = scheduleObj.peopleInfo;
  const dateInfo    = scheduleObj.dateInfo;

  let curMat = extractScheduleData(scheduleObj);
  fillBlanks(curMat, ids);                  // 빈칸 먼저 채움

  let curSc  = score(curMat);
  let bestMat = clone(curMat);
  let bestSc  = curSc;
  let T       = T0;

  /* ───── 메인 루프 ───── */
  for (let it = 1; it <= ITERS && T > T_MIN; it++) {
    const { trace, discarded } = evaluate(
      spilAST,
      buildCtx(curMat, peopleInfo, dateInfo, scheduleController)
    );

    if (discarded) {                               // 완전 폐기 → backtracking
      curMat = backTracking(
        curMat, ids, spilAST, scheduleController, peopleInfo, dateInfo
      );
      curSc  = score(curMat);
      continue;
    }

    const candMat = mutate(curMat, trace, ids, MUT_R);
    const candSc  = score(candMat);
    const delta   = candSc - curSc;                // 음수면 개선

    const accept = delta <= 0 || Math.random() < Math.exp(-delta / T);
    if (accept) {
      curMat = candMat;
      curSc  = candSc;
      if (candSc < bestSc) {
        bestMat = candMat;
        bestSc  = candSc;
      }
    }
    T = accept && delta < 0 ? T * COOL : T;        // adaptive cooling

    if (it % Math.ceil(ITERS / 10) === 0) {
      console.log(`[SA] ${(it / ITERS * 100).toFixed(0)}%  best=${bestSc}`);
    }
  }

  console.log("[SA] Done. bestScore:", bestSc);
  return createScheduleFromData(bestMat, peopleInfo, dateInfo);

  /* ───── 내부 helper ───── */
  function score(mat) {
    const { score, discarded } = evaluate(
      spilAST,
      buildCtx(mat, peopleInfo, dateInfo, scheduleController)
    );
    return discarded ? Infinity : score;
  }
}

/* ======================================================================== *
 *  Reverse-day Backtracking
 *    – day 역순 탐색 (내일 셀 보장) + day 완성 시점 평가
 * ------------------------------------------------------------------------ */
function backTracking(mat, ids, ast, sc, peopleInfo, dateInfo) {
  const P = mat.length;
  const D = mat[0].length;

  /* cursorList: (day D-1 → 0) × (person 0 → P-1) */
  const cursors = [];
  for (let day = D - 1; day >= 0; day--)
    for (let person = 0; person < P; person++)
      cursors.push({ person, day });

  let bestSc  = Infinity;
  let bestMat = null;

  function dayComplete(m, day) {
    if (day < 0 || day >= D) return true;   // 범위 밖 ⇒ 완료로 간주
    for (let p = 0; p < P; p++) if (m[p][day] === "") return false;
    return true;
  }

  function dfs(idx) {
    if (idx === cursors.length) {
      const { score, discarded } = evaluate(
        ast,
        buildCtx(mat, peopleInfo, dateInfo, sc)
      );
      if (!discarded && score < bestSc) { bestSc = score; bestMat = clone(mat); }
      return;
    }

    const { person, day } = cursors[idx];
    for (const id of ids) {
      mat[person][day] = id;

      const todayDone  = dayComplete(mat, day);
      const tomorrowDone = dayComplete(mat, day + 1);

      if (todayDone && tomorrowDone) {
        const { discarded } = evaluateAt(
          ast,
          buildCtx(mat, peopleInfo, dateInfo, sc),
          { person, day }
        );
        if (!discarded) dfs(idx + 1);
      } else {
        dfs(idx + 1);   // 아직 day 미완 ⇒ 곧장 깊이 탐색
      }
    }
    mat[person][day] = "";   // undo
  }

  dfs(0);
  return bestMat ?? mat;     // fallback
}

/* ======================================================================== *
 *  Mutation & Utility
 * ------------------------------------------------------------------------ */
function mutate(mat, traceSet, ids, ratio) {
  /* traceSet이 없으면 랜덤 1칸만 뒤집도록 처리 */
  const cells = (traceSet && typeof traceSet[Symbol.iterator] === "function")
    ? Array.from(traceSet)
    : [];

  const m = clone(mat);

  /* trace 정보가 없으면 임의 셀 하나 변이 */
  if (cells.length === 0) {
    const p = randInt(0, m.length - 1);
    const d = randInt(0, m[0].length - 1);
    m[p][d] = ids[randInt(0, ids.length - 1)];
    return m;
  }

  /* ---- 기존 로직 ---- */
  const k = Math.max(1, Math.ceil(cells.length * ratio));
  for (let i = 0; i < k; i++) {
    const [p, d] = cells[randInt(0, cells.length - 1)];
    let newId;
    do { newId = ids[randInt(0, ids.length - 1)]; }
    while (newId === m[p][d]);
    m[p][d] = newId;
  }
  return m;
}

function fillBlanks(mat, ids) {
  for (let p = 0; p < mat.length; p++)
    for (let d = 0; d < mat[p].length; d++)
      if (mat[p][d] === "") mat[p][d] = ids[randInt(0, ids.length - 1)];
}

const clone = m => m.map(r => [...r]);

function buildCtx(schedule, peopleInfo, dateInfo, scheduleController) {
  const typeMap = Object.fromEntries(
    (scheduleController.scheduleTypeData || []).map(t => [t.id, t])
  );
  return {
    scheduleTable: schedule,
    peopleInfo   : peopleInfo,
    dateInfo     : dateInfo,
    cursor       : null,
    근무유형     : typeMap
  };
}
