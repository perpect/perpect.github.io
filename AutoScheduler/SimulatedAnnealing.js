// simulatedAnnealing.js - trace 기반 SA 구현
import { evaluate } from "./SPIL/Evaluator.js";
import {
    extractScheduleData,
    createScheduleFromData,
    randInt
} from "./Integration.js";

export async function simulatedAnnealing(current, spilAST, scheduleController, iterations = 10000) {
    console.log(spilAST);
    let best = extractScheduleData(current);
    const workTypes = scheduleController.scheduleTypeData.map(type => type.id);
    for (let person = 0; person < best.length; person++) {
        for (let day = 0; day < best[person].length; day++) {
            if(best[person][day]=='')
                best[person][day] = workTypes[randInt(0, workTypes.length - 1)];
        }
    }
    let bestScore = Number.NEGATIVE_INFINITY;

    let temp = 100;
    const cooling = 0.995;
    let failStreak = 0;

    const peopleInfo = current.peopleInfo;
    const dateInfo = current.dateInfo;

    console.log("spilAST:", spilAST);
    let iter = 0;
    while(iter < iterations) {
        const schedule = createScheduleFromData(best, peopleInfo, dateInfo);
        const context = buildContext(schedule, scheduleController);
        //console.log("Context:", context);
        const result = evaluate(spilAST, context);

        if (result.discarded) {
            failStreak++;
            if (failStreak >= iterations){
                console.log(`${iterations}회 연속 폐기됨. 종료합니다.`);
                break;
            }
            if (failStreak % Math.ceil(iterations/10) === 0) {
                console.log(`실패 중 - ${failStreak/iterations*100}%(${failStreak} / ${iterations}): Best score: ${bestScore}`);
            }
        } else {
            iter++;
            failStreak = 0;
        }

        const trace = result.trace;
        const candidateData = mutateSchedule(best, workTypes, trace);
        const candidate = createScheduleFromData(candidateData, peopleInfo, dateInfo);

        const newContext = buildContext(candidate, scheduleController);
        const candidateResult = evaluate(spilAST, newContext);

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
function mutateSchedule(data, workTypes, trace = [], changeCount = 2) {
    const copy = structuredClone(data);
    const types = workTypes;

    const changes = [];

    while (changes.length < changeCount) {
        let person, day;
        if (trace.length > 0 && Math.random() < 0.7) {
            const target = trace[randInt(0, trace.length - 1)];
            //console.log("Target:", target);
            person = target.person;
            day = target.day;
        } else {
            person = randInt(1, copy.length - 1);
            day = randInt(0, copy[person].length - 1);
        }
        //console.log("Mutate:", person, day, copy);
        const currentType = copy[person][day];
        const options = types.filter(t => t !== currentType);
        const newType = options[Math.floor(Math.random() * options.length)];

        copy[person][day] = newType;
        changes.push({ person, day });
    }

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
        peopleInfo: schedule.peopleInfo,
        dateInfo: schedule.dateInfo,
        cursor: null,
        근무유형: typeMap
    };
}
