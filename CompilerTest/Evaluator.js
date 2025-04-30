// Evaluator.js
import { builtins } from "./builtins.js";

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
    for (const stmt of section.body) {
      if (this.discarded) break;
      this.executeStatement(stmt);
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
      return this.parseLiteral(node.value);
    }
    if (node.type === "Identifier") {
      return this.env[node.name] ?? 0;
    }
    if (node.type === "FieldAccess") {
      return 0;
    }
    if (node.type === "UnaryExpr") {
      const value = this.evaluateExpr(node.expr);
      if (node.op === '-') return -value;
      throw new Error(`Unknown unary operator: ${node.op}`);
    }
    if (node.type === "BinaryExpr") {
      const left = this.evaluateExpr(node.left);
      const right = this.evaluateExpr(node.right);
      switch (node.op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        case '>': return left > right;
        case '<': return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        case '==': return left == right;
        case '!=': return left != right;
        default: throw new Error(`Unknown binary operator: ${node.op}`);
      }
    }
    if (node.type === "LogicalExpr") {
      const left = this.evaluateExpr(node.left);
      const right = this.evaluateExpr(node.right);
      if (node.op === "그리고") return left && right;
      if (node.op === "또는") return left || right;
      throw new Error(`Unknown logical operator: ${node.op}`);
    }
    if (node.type === "FunctionCall") {
      if (node.name in this.builtins) {
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

    throw new Error(`Unknown expr type: ${node.type}`);
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
