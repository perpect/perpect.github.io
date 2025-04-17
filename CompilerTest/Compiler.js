// ===== 기본 Environment 클래스 =====
class Environment {
    constructor(parent = null) {
        this.vars = new Map();
        this.parent = parent;
    }

    define(name, value) {
        if (this.vars.has(name)) throw new Error(`Variable '${name}' already defined`);
        this.vars.set(name, value);
    }

    assign(name, value) {
        if (this.vars.has(name)) {
            this.vars.set(name, value);
        } else if (this.parent) {
            this.parent.assign(name, value);
        } else {
            throw new Error(`Undefined variable '${name}'`);
        }
    }

    get(name) {
        if (this.vars.has(name)) return this.vars.get(name);
        if (this.parent) return this.parent.get(name);
        throw new Error(`Undefined variable '${name}'`);
    }
}

// ===== ReturnSignal (return 흐름 제어용) =====
class ReturnSignal {
    constructor(value) {
        this.value = value;
    }
}

// ===== 메인 evaluateStatement 함수 =====
function evaluateStatement(stmt, env, functions) {
    switch (stmt.type) {
        case "LetStatement":
            env.define(stmt.name, evaluateExpression(stmt.value, env, functions));
            return;

        case "Assignment":
            env.assign(stmt.name, evaluateExpression(stmt.value, env, functions));
            return;

        case "ReturnStatement":
            throw new ReturnSignal(evaluateExpression(stmt.value, env, functions));

        case "FailStatement":
            if (!stmt.condition || evaluateExpression(stmt.condition, env, functions)) {
                throw new Error("Execution failed due to 'fail' condition");
            }
            return;

        case "IfStatement": {
            const cond = evaluateExpression(stmt.condition, env, functions);
            const body = cond ? stmt.consequent : stmt.alternate || [];
            for (const s of body) {
                const result = evaluateStatement(s, env, functions);
                if (result instanceof ReturnSignal) throw result;
            }
            return;
        }

        case "Block":
            for (const s of stmt.body) {
                const result = evaluateStatement(s, env, functions);
                if (result instanceof ReturnSignal) throw result;
            }
            return;

        case "FunctionDeclaration":
            functions[stmt.name] = stmt;
            return;

        case "Comment":
            return; // 주석은 무시

        default:
            throw new Error("Unknown statement type: " + stmt.type);
    }
}

// ===== evaluateExpression 함수 =====
function evaluateExpression(expr, env, functions) {
    switch (expr.type) {
        case "NumberLiteral":
        case "StringLiteral":
        case "BooleanLiteral":
        case "NullLiteral":
            return expr.value;

        case "Identifier":
            return env.get(expr.name);

        case "UnaryExpression": {
            const val = evaluateExpression(expr.argument, env, functions);
            switch (expr.operator) {
                case "-":
                    return -val;
                case "!":
                case "not":
                    return !val;
                default:
                    throw new Error(`Unknown unary operator ${expr.operator}`);
            }
        }

        case "BinaryExpression": {
            const left = evaluateExpression(expr.left, env, functions);
            const right = evaluateExpression(expr.right, env, functions);
            switch (expr.operator) {
                case "+":
                    return left + right;
                case "-":
                    return left - right;
                case "*":
                    return left * right;
                case "/":
                    return left / right;
                case "%":
                    return left % right;
                case "==":
                    return left == right;
                case "!=":
                    return left != right;
                case "<":
                    return left < right;
                case ">":
                    return left > right;
                case "<=":
                    return left <= right;
                case ">=":
                    return left >= right;
                case "and":
                    return left && right;
                case "or":
                    return left || right;
                default:
                    throw new Error(`Unknown binary operator ${expr.operator}`);
            }
        }

        case "FunctionCall": {
            const fn = functions[expr.name];
            if (!fn) throw new Error(`Undefined function '${expr.name}'`);
            const args = expr.args.map(arg => evaluateExpression(arg, env, functions));
            return callUserFunction(fn, args, env, functions);
        }

        default:
            throw new Error("Unknown expression type: " + expr.type);
    }
}

// ===== 함수 호출기 =====
function callUserFunction(fnDecl, args, callerEnv, functions) {
    const localEnv = new Environment(callerEnv);
    for (let i = 0; i < fnDecl.params.length; i++) {
        localEnv.define(fnDecl.params[i], args[i]);
    }

    try {
        for (const stmt of fnDecl.body) {
            evaluateStatement(stmt, localEnv, functions);
        }
        return null; // return 없으면 null 반환
    } catch (signal) {
        if (signal instanceof ReturnSignal) return signal.value;
        throw signal;
    }
}

// ===== 프로그램 실행 진입점 =====
function evaluateProgram(program) {
    const env = new Environment();
    const functions = {};

    for (const stmt of program.body) {
        evaluateStatement(stmt, env, functions);
    }

    return {
        env,
        functions
    };
}