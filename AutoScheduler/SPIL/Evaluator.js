// Evaluator.js
import {
    builtins,
    DateObject,
    PersonObject
} from "./Builtins.js";

class Evaluator {
    constructor(ast, environment = {}) {
        this.ast = ast;
        this.env = environment;
        this.discarded = 0;
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
            if (section.type === "LoopSection") {
                this.executeLoopSection(section);
            }
            if (section.type === "JudgeSection") {
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
        const schedule = this.env.scheduleTable;
        if (!schedule) return;

        for (const stmt of section.body) {
            this.executeStatement(stmt);
        }

        this.env.dates = [];
        this.env.crews = [];

        const dayCount = schedule[1].length;
        const personCount = schedule.length;

        for (let day = 0; day < dayCount; day++) {
            const column = [];
            for (let person = 1; person < personCount; person++) {
                column.push(schedule[person][day]);
            }
            const dateInfo = this.env.dateInfo.getDate?.(day);
            this.env.dates.push(new DateObject(column, day));
        }

        for (let person = 1; person < personCount; person++) {
            this.env.crews.push(new PersonObject(
                person,
                this.env.peopleInfo.getPerson(person - 1),
                schedule[person]
            ));
        }
    }

    executeLoopSection(section) {
        const schedule = this.env.scheduleTable;
        const dayCount = schedule[1].length;
        const personCount = schedule.length;

        for (let person = 1; person < personCount; person++) {
            for (let day = 0; day < dayCount; day++) {
                //if (this.discarded) return;
                this.env.cursor = {
                    person,
                    day
                };
                for (const stmt of section.body) {
                    this.executeStatement(stmt);
                    //if (this.discarded || this.returning) break;
                }
            }
        }
    }

    executeJudgeSection(section) {
        for (const judge of section.body) {
            const value = this.evaluateExpr(judge.expr);
            if (judge.op === '-') this.score -= value;
            else if (judge.op === '+') this.score += value;
            this.score -= this.discarded * 1000;
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
                    //if (this.discarded || this.returning) break;
                }
            }
        } else if (stmt.type === "DiscardStatement") {
            if (stmt.type === "DiscardStatement") {
                const { person, day } = this.env.cursor ?? {};
                this.discarded += 1;
              
                this.addTrace(person - 1, day);
              
                const date = this.env.dates?.[day];
                const personObj = this.env.crews?.[person];
                if (date && date.scheduleTable) {
                  //console.log("Discard 원인 추정: 날짜", date, "근무자", personObj);
                }
              }
            this.discarded += 1;
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
            return this.env[node.name] ?? undefined;
        }
        if (node.type === "FieldAccess") {
            return this.resolveFieldAccess(node);
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
                case '+':
                    return left + right;
                case '-':
                    return left - right;
                case '*':
                    return left * right;
                case '/':
                    return left / right;
                case '>':
                    return left > right;
                case '<':
                    return left < right;
                case '>=':
                    return left >= right;
                case '<=':
                    return left <= right;
                case '==':
                    return left == right;
                case '!=':
                    return left != right;
                default:
                    throw new Error(`Unknown binary operator: ${node.op}`);
            }
        }
        if (node.type === "IndexAccess") {
            const list = this.evaluateExpr(node.list);
            const index = this.evaluateExpr(node.index);
            if (!Array.isArray(list)) throw new Error("Indexing non-list value");
            return list[index];
        }
        if (node.type === "LogicalExpr") {
            const left = this.evaluateExpr(node.left);
            const right = this.evaluateExpr(node.right);
            if (node.op === "그리고") return left && right;
            if (node.op === "또는") return left || right;
            throw new Error(`Unknown logical operator: ${node.op}`);
        }
        if (node.type === "FunctionCall") {
            if (this.builtins[node.name]) {
                const args = node.args.map(arg => this.evaluateExpr(arg));
                return this.builtins[node.name](args, this);
            }

            const func = this.functions[node.name];
            if (!func) throw new Error(`정의되지 않은 함수: ${node.name}`);

            const localEnv = {
                ...this.env
            };
            for (let i = 0; i < func.params.length; i++) {
                localEnv[func.params[i]] = this.evaluateExpr(node.args[i]);
            }

            const fnEvaluator = new Evaluator({
                sections: []
            }, localEnv);
            fnEvaluator.functions = this.functions;
            fnEvaluator.builtins = this.builtins;

            for (const stmt of func.body) {
                fnEvaluator.executeStatement(stmt);
                if (fnEvaluator.returning) break;
            }

            return fnEvaluator.returnValue;
        }
        if (node.type === "FieldCall") {
            const object = this.evaluateExpr(node.object);
            const method = object?.[node.field];
            const args = node.args.map(arg => this.evaluateExpr(arg));

            if (typeof method !== 'function') {
                throw new Error(`${node.field}는 호출 가능한 필드가 아닙니다.`);
            }

            return method.apply(object, args);
        }
        if (node.type === "ListLiteral") {
            return node.elements.map(el => this.evaluateExpr(el));
        }

        throw new Error(`Unknown expr type: ${node.type}`);
    }

    resolveFieldAccess(node) {
        const object = this.evaluateExpr(node.object);
        const field = node.field;

        if (typeof object?.getField === "function") {
            return object.getField(field, this.env);
        }

        return object?.[field];
    }

    addTrace(person, day) {
        this.trace.push({
            person,
            day
        });
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