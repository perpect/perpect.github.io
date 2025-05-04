// Evaluator.js
import { builtins, DateObject } from "./Builtins.js";

class Evaluator {
  constructor(ast, environment = {}) {
    this.ast = ast;
    this.env = environment;
    this.discarded = false;
    this.score = 0;
    this.trace = [];
    this.functions = {};
    this.builtins = builtins;
    this.returning = false;
    this.returnValue = null;
  }

  run() {
    for (const section of this.ast.sections) {
      if (section.type === "FunctionDeclaration") {
        this.functions[section.name] = section;
      }
      if (section.type === "StartSection") {
        this.executeStartSection(section);
      }
      if (section.type === "LoopSection" && !this.discarded) {
        this.executeLoopSection(section);
      }
      if (section.type === "JudgeSection" && !this.discarded) {
        this.executeJudgeSection(section);
      }
    }
    return {
      score: this.score,
      discarded: this.discarded,
      env: this.env,
      trace: this.trace
    };
  }

  executeStartSection(section) {
    for (const stmt of section.body) {
      this.executeStatement(stmt);
    }
  }

  executeLoopSection(section) {
    const schedule = this.env.scheduleTable;
    if (!schedule) return;

    for (let person = 1; person < schedule.length; person++) {
      for (let day = 0; day < schedule[person].length; day++) {
        if (this.discarded) return;

        this.env.cursor = { person, day };
        this.env.근무자 = person;
        this.env.당일 = day;

        for (const stmt of section.body) {
          this.executeStatement(stmt);
          if (this.discarded || this.returning) break;
        }
      }
    }
  }

  executeJudgeSection(section) {
    for (const judge of section.body) {
      const value = this.evaluateExpr(judge.expr);
      if (judge.op === '-') this.score += value;
      else if (judge.op === '+') this.score -= value;
    }
  }

  executeStatement(stmt) {
    if (stmt.type === "Assignment") {
      const value = this.evaluateExpr(stmt.expr);
      this.env[stmt.name] = value;
    } else if (stmt.type === "IfStatement") {
      const condition = this.evaluateExpr(stmt.condition);
      if (condition) {
        for (const inner of stmt.body) {
          this.executeStatement(inner);
          if (this.discarded || this.returning) break;
        }
      }
    } else if (stmt.type === "DiscardStatement") {
      this.discarded = true;
    } else if (stmt.type === "ReturnStatement") {
      this.returnValue = this.evaluateExpr(stmt.expr);
      this.returning = true;
    } else {
      throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }

  evaluateExpr(node) {
    if (node.type === "Literal") {
        return this.parseLiteral(node.value);  // 리터럴 처리
    }
    if (node.type === "Identifier") {
        return this.env[node.name] ?? undefined;  // 식별자 처리
    }    
    if (node.type === "FieldAccess") {
        return this.resolveFieldAccess(node);  // 필드 접근 처리
    }
    if (node.type === "UnaryExpr") {
        const value = this.evaluateExpr(node.expr);
        if (node.op === '-') return -value;  // 음수 처리
        throw new Error(`Unknown unary operator: ${node.op}`);
    }
    if (node.type === "BinaryExpr") {
        const left = this.evaluateExpr(node.left);
        const right = this.evaluateExpr(node.right);
        //if (left == right) console.log(left, node.op, right);
        switch (node.op) {
            case '+': return left + right;  // 덧셈
            case '-': return left - right;  // 뺄셈
            case '*': return left * right;  // 곱셈
            case '/': return left / right;  // 나눗셈
            case '>': return left > right;  // 크기 비교
            case '<': return left < right;  // 크기 비교
            case '>=': return left >= right;  // 크거나 같음 비교
            case '<=': return left <= right;  // 작거나 같음 비교
            case '==': return left == right;  // 동일 비교
            case '!=': return left != right;  // 다름 비교
            default: throw new Error(`Unknown binary operator: ${node.op}`);
        }
    }
    if (node.type === "IndexAccess") {
        const list = this.evaluateExpr(node.list);
        const index = this.evaluateExpr(node.index);
        if (!Array.isArray(list)) throw new Error("Indexing non-list value");
        return list[index];  // 리스트 인덱스 접근
    }
    if (node.type === "LogicalExpr") {
        const left = this.evaluateExpr(node.left);
        const right = this.evaluateExpr(node.right);
        if (node.op === "그리고") return left && right;  // 논리적 AND
        if (node.op === "또는") return left || right;  // 논리적 OR
        throw new Error(`Unknown logical operator: ${node.op}`);
    }
    if (node.type === "FunctionCall") {
        if (this.builtins[node.name]) {
            return this.builtins[node.name](node.args, this);
        }
        const func = this.functions[node.name];
        if (!func) throw new Error(`정의되지 않은 함수: ${node.name}`);

        const localEnv = { ...this.env };
        for (let i = 0; i < func.params.length; i++) {
            localEnv[func.params[i]] = this.evaluateExpr(node.args[i]);
        }

        const fnEvaluator = new Evaluator({ sections: [] }, localEnv);
        fnEvaluator.functions = this.functions;
        fnEvaluator.builtins = this.builtins;

        for (const stmt of func.body) {
            fnEvaluator.executeStatement(stmt);
            if (fnEvaluator.returning) break;
        }

        return fnEvaluator.returnValue;
    }
    if (node.type === "ListLiteral") {
        return node.elements.map(el => this.evaluateExpr(el));
    }

    throw new Error(`Unknown expr type: ${node.type}`);
}

resolveFieldAccess(node) {
  const object = this.evaluateExpr(node.object); // '내일'이 여기서 평가됨
  const field = node.field;

  const { person, day } = this.env.cursor ?? {};
  const schedule = this.env.scheduleTable;

  if (object instanceof DateObject) {
      if (field === "근무")
          return object.getWorkSchedule(schedule, person);
      if (field === "근무들")
        return object.getWorkSchedules(schedule);
  }

  // '근무'일 때 처리
  if (object === "근무") {
      return schedule?.[person]?.[day] ?? undefined;
  }

  // '근무자'일 때 처리
  if (object === "근무자") {
      const idx = this.env.근무자;
      const personObj = this.env.peopleInfo?.getPerson?.(idx);
      if (!personObj) return undefined;
      switch (field) {
          case "입대일":
              return personObj.enlistmentDay?.getTime?.() ?? undefined;
          default:
              return undefined;
      }
  }

  // '당일'일 때 처리
  if (object === "당일") {
      const dateInfo = this.env.dateInfo;
      const currentDate = new Date(dateInfo.getFullYear(), dateInfo.getMonth(), (day ?? undefined) + 1);
      switch (field) {
          case "요일":
              return currentDate.getDay();
          case "날짜":
              return currentDate.getDate();
          default:
              return undefined;
      }
  }

  return undefined;
}


    

  addTrace(person, day) {
    this.trace.push({ person, day });
  }

  parseLiteral(value) {
    if (typeof value === 'string' && /^\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value)) {
      return parseFloat(value);
    }
    return value;
  }
}

export function evaluate(ast, environment = {}) {
  return new Evaluator(ast, environment).run();
}
