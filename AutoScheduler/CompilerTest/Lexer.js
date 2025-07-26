import {
    Keywords,
    Operators,
    MetaAccessors,
    TokenType
} from "./Token.js";

const KEYWORDS = new Set(Object.values(Keywords));
const META = new Set(Object.values(MetaAccessors));
const TWO_CHAR_OPS = new Set([Operators.EQ, Operators.NEQ, Operators.GTE, Operators.LTE]);
const ONE_CHAR_OPS = new Set([Operators.PLUS, Operators.MINUS, Operators.MUL, Operators.DIV, Operators.ASSIGN, Operators.GT, Operators.LT]);

class Token {
    constructor(type, lexeme, line, col) {
        this.type = type;
        this.lexeme = lexeme;
        this.line = line;
        this.col = col;
    }
}

export class Tokenizer {
    constructor(src) {
        this.src = src;
        this.i = 0;
        this.line = 1;
        this.col = 1;
        this.tokens = [];
        this.indents = [0];
    }
    push(type, lex = null) {
        this.tokens.push(new Token(type, lex, this.line, this.col));
    }
    peek(n = 0) {
        return this.src[this.i + n] ?? "";
    }
    isEOF() {
        return this.i >= this.src.length;
    }
    advance() {
        const ch = this.src[this.i++];
        if (ch === "\n") {
            this.line++;
            this.col = 1;
        } else {
            this.col++;
        }
        return ch;
    }
    match(re) {
        const m = re.exec(this.src.slice(this.i));
        if (!m || m.index !== 0) return null;
        this.i += m[0].length;
        this.col += m[0].length;
        return m[0];
    }
    error(msg) {
        throw new SyntaxError(`${msg} (줄 ${this.line}, 칸 ${this.col})`);
    }
    handleIndent() {
        let idx = this.i;
        let spaces = 0;
        while (this.src[idx] === " ") {
            spaces++;
            idx++;
        }
        if (this.src[idx] === "\t") this.error("탭 들여쓰기는 허용되지 않습니다.");
        if (this.src[idx] === "\n" || this.src[idx] === "\r") return;
        const prev = this.indents[this.indents.length - 1];
        if (spaces % 4 !== 0) this.error("들여쓰기는 4의 배수여야 합니다.");
        const level = spaces / 4;
        if (level > prev) {
            this.indents.push(level);
            this.push(TokenType.INDENT);
        } else if (level < prev) {
            while (this.indents[this.indents.length - 1] > level) {
                this.indents.pop();
                this.push(TokenType.DEDENT);
            }
            if (this.indents[this.indents.length - 1] !== level) this.error("들여쓰기 일관성 오류입니다.");
        }
        this.col += spaces;
        this.i = idx;
    }
    tokenize() {
        while (!this.isEOF()) {
            const ch = this.peek();
            if (ch === "\n" || ch === "\r") {
                this.advance();
                this.push(TokenType.NEWLINE, "\n");
                this.handleIndent();
                continue;
            }
            if (ch === "@") {
                while (!this.isEOF() && this.peek() !== "\n" && this.peek() !== "\r") this.advance();
                continue;
            }
            if (ch === " " || ch === "\t") {
                this.advance();
                continue;
            }
            if (ch === '"' || ch === "'") {
                const quote = this.advance();
                let str = "";
                while (!this.isEOF() && this.peek() !== quote) {
                    if (this.peek() === "\\") {
                        this.advance();
                        str += "\\" + this.advance();
                    } else {
                        str += this.advance();
                    }
                }
                if (this.peek() !== quote) this.error("문자열 리터럴이 닫히지 않았습니다.");
                this.advance();
                this.push(TokenType.STRING, str);
                continue;
            }
            const num = this.match(/^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
            if (num) {
                this.push(TokenType.NUMBER, num);
                continue;
            }
            const id = this.match(/^[A-Za-z가-힣_][\w가-힣_]*/);
            if (id) {
                if (KEYWORDS.has(id)) this.push(TokenType.KEYWORD, id);
                else if (META.has(id)) this.push(TokenType.META, id);
                else this.push(TokenType.IDENT, id);
                continue;
            }
            const two = this.peek() + this.peek(1);
            if (TWO_CHAR_OPS.has(two)) {
                this.advance();
                this.advance();
                this.push(TokenType.OPERATOR, two);
                continue;
            }
            if (ONE_CHAR_OPS.has(ch)) {
                this.push(TokenType.OPERATOR, this.advance());
                continue;
            }
            if (ch === '.') {
                this.push(TokenType.DOT, this.advance());
                continue;
            }
            if (ch === ':') {
                this.push(TokenType.COLON, this.advance());
                continue;
            }
            if (ch === '(') {
                this.push(TokenType.LPAREN, this.advance());
                continue;
            }
            if (ch === ')') {
                this.push(TokenType.RPAREN, this.advance());
                continue;
            }
            this.error(`알 수 없는 문자 '${ch}'가 발견되었습니다.`);
        }
        if (this.tokens.length && this.tokens[this.tokens.length - 1].type !== TokenType.NEWLINE) this.push(TokenType.NEWLINE, "\n");
        while (this.indents.length > 1) {
            this.indents.pop();
            this.push(TokenType.DEDENT);
        }
        this.push(TokenType.EOF);
        return this.tokens;
    }
}

export function tokenize(src) {
    return new Tokenizer(src).tokenize();
}