export class DateObject {
  constructor(scheduleTable, today) {
      this.scheduleTable = scheduleTable;
      this.date = today;
  }

  getField(field, env) {
    switch (field) {
        case "근무":
            return this.scheduleTable[env.cursor.person] ?? undefined;
        default:
            return undefined;
    }
  }

  검색(target) {
      const result = [];
      for (let person = 0; person < this.scheduleTable.length; person++) {
        const work = this.scheduleTable[person];
        if(work === target) result.push(person);
      }
      //console.log("해당근무", target, result, this.scheduleTable, this.date);
      return result;
  }
}

export class PersonObject {
  constructor(id, info, scheduleRow) {
      this.id = id;
      this.info = info;
      this.schedule = scheduleRow;
  }

  getField(field, env) {
      switch (field) {
          case "입대일":
              return this.info?.enlistmentDay?.getTime?.();
          case "이름":
              return this.info?.name;
          default:
              return undefined;
      }
  }
}

export const builtins = {
  /**
   * 표준편차 함수: 표준편차(값1, 값2, ...)
   */
  "표준편차": (values, evaluator) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
      return Math.sqrt(variance);
  },

  /**
   * 기록(person, day): 해당 셀을 trace로 기록. 점수에는 영향을 주지 않음.
   */
  "기록": ([person, day], evaluator) => {
      evaluator.addTrace(person, day);
      return undefined;
  },

  /**
   * 합계(...): 인자들의 합을 계산
   */
  "합계": (args, evaluator) => {
      return args.reduce((a, b) => a + b, 0);
  },

  /**
   * 최대(...): 인자 중 최대값
   */
  "최대": (args, evaluator) => {
      return Math.max(...args);
  },

  /**
   * 최소(...): 인자 중 최소값
   */
  "최소": (args, evaluator) => {
      return Math.min(...args);
  },

  /**
   * 길이(...): 리스트의 길이를 반환
   */
  "길이": ([list], evaluator) => {
      if (!Array.isArray(list)) throw new Error("길이 함수는 리스트를 인자로 받아야 합니다.");
      //console.log(list, list.length);
      return list.length;
  },

  /**
   * 당일(...): 현재 날짜에 n을 더한 날짜를 반환
   */
  "당일": (offset, evaluator) => {
        //console.log(evaluator.env.dates);
        //console.log("당일", evaluator.env.dates?.[evaluator.env.cursor.day + offset[0]], evaluator.env.cursor.day + offset[0]);
      return evaluator.env.dates?.[evaluator.env.cursor.day + offset[0]] ?? undefined;
  },

  /**
   * 콘솔(...): 인자들을 콘솔에 출력
   */
  "콘솔": (args, evaluator) => {
      console.log(args);
      return undefined;
  }
};