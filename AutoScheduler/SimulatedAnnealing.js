// simulatedAnnealing.js - trace 기반 SA 구현
import { evaluate } from "./SPIL/Evaluator.js";
import {
    extractScheduleData,
    createScheduleFromData
} from "./Integration.js";

export async function simulatedAnnealing(current, spilAST, scheduleController, iterations = 3000) {
    console.log(spilAST);
    let best = extractScheduleData(current);
    let bestScore = Number.NEGATIVE_INFINITY;

    let temp = 100;
    const cooling = 0.98;
    let failStreak = 0;

    const peopleInfo = current.peopleInfo;
    const dateInfo = current.dateInfo;

    console.log("spilAST:", spilAST);
    for (let iter = 0; iter < iterations; iter++) {
        const schedule = createScheduleFromData(best, peopleInfo, dateInfo);
        const context = buildContext(schedule, scheduleController);
        //console.log("Context:", context);
        const result = evaluate(spilAST, context);

        if (result.discarded) {
            failStreak++;
            if (failStreak >= 100){
                console.log("100회 연속 폐기됨. 종료합니다.");
                break;
            }
            continue;
        } else {
            failStreak = 0;
        }

        const trace = result.trace;
        const candidateData = mutateSchedule(best, trace);
        const candidate = createScheduleFromData(candidateData, peopleInfo, dateInfo);

        const newContext = buildContext(candidate, scheduleController);
        const candidateResult = evaluate(spilAST, newContext);

        if (candidateResult.discarded) continue;

        const delta = candidateResult.score - bestScore;
        const accept = delta > 0 || Math.random() < Math.exp(delta / temp);

        if (accept) {
            best = extractScheduleData(candidate);
            bestScore = candidateResult.score;
        }

        temp *= cooling;
        //await delay(1);
        //console.log("score:", candidateResult.score);
        if (iter % Math.ceil(iterations/10) === 0) {
            console.log(candidateResult);
            console.log(`${iter/iterations*100}%(${iter} / ${iterations}): Best score: ${bestScore}`);
        }
    }
    console.log("Best score:", bestScore);
    console.log("Best schedule:", best);
    return createScheduleFromData(best, peopleInfo, dateInfo);
}

function mutateSchedule(data, trace = []) {
    const copy = structuredClone(data);
    const types = ["주", "야", "비"];

    let person, day;

    if (trace.length > 0) {
        const target = trace[Math.floor(Math.random() * trace.length)];
        person = target.person;
        day = target.day;
    } else {
        person = Math.floor(Math.random() * copy.length);
        day = Math.floor(Math.random() * copy[0].length);
    }

    const currentType = copy[person][day];
    const options = types.filter(t => t !== currentType);
    const newType = options[Math.floor(Math.random() * options.length)];
    copy[person][day] = newType;

    return copy;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildContext(schedule, scheduleController) {
    const scheduleTypes = scheduleController?.scheduleTypeData || [];
    const typeMap = Object.fromEntries(scheduleTypes.map(t => [t.id, t]));

    return {
        scheduleTable: schedule.tableInfo.map(row =>
            row.map(cell =>
                cell.dataset?.type ||
                (cell.className.split(" ").find(cls => cls.endsWith("Color")) || "").replace("Color", "")
            )
        ),
        cursor: null,
        근무자: null,
        당일: null,
        근무유형: typeMap
    };
}
