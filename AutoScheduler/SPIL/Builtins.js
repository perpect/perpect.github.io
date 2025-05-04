export class DateObject {
  constructor(today, dayOffset = 0) {
    this.date = today + dayOffset;
  }

  getWorkSchedule(scheduleTable, person) {
    return scheduleTable[person]?.[this.date] ?? undefined;
  }

  getWorkSchedules(scheduleTable) {
    const result = [];
    for (let person = 1; person < scheduleTable.length; person++) {
      if (scheduleTable[person][day] === target.value) {
        result.push(person);
      }
    }
    return result;
  }
}

export const builtins = {
    /**
     * 표준편차 함수: 표준편차(값1, 값2, ...)
     */
    "표준편차": (args, evaluator) => {
      const values = args.map(arg => evaluator.evaluateExpr(arg));
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
      return Math.sqrt(variance);
    },
  
    /**
     * 기록(person, day): 해당 셀을 trace로 기록. 점수에는 영향을 주지 않음.
     */
    "기록": ([personExpr, dayExpr], evaluator) => {
      const person = evaluator.evaluateExpr(personExpr);
      const day = evaluator.evaluateExpr(dayExpr);
      evaluator.addTrace(person, day);
      return undefined;
    },
  
    /**
     * 합계(...): 인자들의 합을 계산
     */
    "합계": (args, evaluator) => {
      return args.map(arg => evaluator.evaluateExpr(arg)).reduce((a, b) => a + b, 0);
    },
  
    /**
     * 최대(...): 인자 중 최대값
     */
    "최대": (args, evaluator) => {
      return Math.max(...args.map(arg => evaluator.evaluateExpr(arg)));
    },
  
    /**
     * 최소(...): 인자 중 최소값
     */
    "최소": (args, evaluator) => {
      return Math.min(...args.map(arg => evaluator.evaluateExpr(arg)));
    },

    "길이" : ([list], evaluator) => {
    if (!Array.isArray(list)) throw new Error("길이 함수는 리스트를 인자로 받아야 합니다.");
    return list.length;
    },

    "내일": (args, evaluator) => {
      const n = evaluator.evaluateExpr(args[0]);
      return new DateObject(evaluator.env.cursor.day + n);
    },

    "콘솔": (args, evaluator) => {
      console.log(args);
      return undefined;
    }
  };  