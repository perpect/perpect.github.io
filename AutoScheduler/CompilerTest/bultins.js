// 모든 함수는 (args: Expr[], evaluator: Evaluator) => number 형태여야 함

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
     * trace(person, day): 해당 셀을 trace로 기록. 점수에는 영향을 주지 않음.
     */
    "trace": ([personExpr, dayExpr], evaluator) => {
      const person = evaluator.evaluateExpr(personExpr);
      const day = evaluator.evaluateExpr(dayExpr);
      evaluator.addTrace(person, day);
      return 0;
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
    }
  };  