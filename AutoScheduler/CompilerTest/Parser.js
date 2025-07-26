import {
    Keywords,
    Operators,
    MetaAccessors,
    TokenType
} from "./Token.js";

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.i = 0;
    }

    peek(offset = 0) {
        return this.tokens[this.i + offset] ?? { type: TokenType.EOF };
    }

    advance() {
        return this.tokens[this.i++] ?? { type: TokenType.EOF };
    }

    match(...types) {
        const token = this.peek();
        if (types.includes(token.type)) {
            this.advance();
            return token;
        }
        return null;
    }

    expect(...types) {
        const token = this.advance();
        if (!types.includes(token.type)) {
            throw new SyntaxError(`Expected ${types.join(" or ")} but got ${token.type}`);
        }
        return token;
    }

    parseProgram() {
        const sections = [];
        while (this.peek().type !== TokenType.EOF) {
            const next = this.peek();
            if (next.type === TokenType.KEYWORD && [Keywords.START, Keywords.LOOP, Keywords.JUDGE].includes(next.lexeme)) {
                sections.push(this.parseSection());
            } else if (next.type === TokenType.KEYWORD && next.lexeme === Keywords.FUNCTION) {
                sections.push(this.parseFunctionDeclaration());
            } else if (next.type === TokenType.NEWLINE) {
                this.advance();
            } else {
                throw new SyntaxError(`Expected section keyword but got ${next.type}`);
            }
        }
        return { type: "Program", sections };
    }    

    parseSection() {
        const keyword = this.expect(TokenType.KEYWORD).lexeme;
        this.expect(TokenType.COLON);
        this.expect(TokenType.NEWLINE);

        if (this.peek().type === TokenType.INDENT) this.advance();

        if ([Keywords.START, Keywords.LOOP].includes(keyword)) {
            const statements = [];
            while (true) {
                const next = this.peek();
                if (next.type === TokenType.DEDENT || next.type === TokenType.EOF || (next.type === TokenType.KEYWORD && [Keywords.START, Keywords.LOOP, Keywords.JUDGE].includes(next.lexeme))) {
                    if (next.type === TokenType.DEDENT) this.advance();
                    break;
                }
                if (next.type === TokenType.NEWLINE) {
                    this.advance();
                    continue;
                }
                statements.push(this.parseStatement());
            }
            return { type: keyword === Keywords.START ? "StartSection" : "LoopSection", body: statements };
        }

        if (keyword === Keywords.JUDGE) {
            const judges = [];
            while (true) {
                const next = this.peek();
                if (next.type === TokenType.DEDENT || next.type === TokenType.EOF) {
                    if (next.type === TokenType.DEDENT) this.advance();
                    break;
                }
                if (next.type === TokenType.NEWLINE) {
                    this.advance();
                    continue;
                }
                judges.push(this.parseJudgeExpr());
            }
            return { type: "JudgeSection", body: judges };
        }

        throw new SyntaxError(`Unknown section keyword: ${keyword}`);
    }

    parseStatement() {
        const next = this.peek();
        if (next.type === TokenType.KEYWORD && next.lexeme === Keywords.IF) return this.parseIfStatement();
        if (next.type === TokenType.KEYWORD && next.lexeme === Keywords.DISCARD) return this.parseDiscardStatement();
        if (next.type === TokenType.KEYWORD && next.lexeme === Keywords.RETURN) return this.parseReturnStatement();
        return this.parseAssignment();
    }
    
    parseReturnStatement() {
        this.expect(TokenType.KEYWORD);
        const expr = this.parseExpr();
        this.expect(TokenType.NEWLINE);
        return { type: "ReturnStatement", expr };
    }    

    parseDiscardStatement() {
        this.expect(TokenType.KEYWORD);
        this.expect(TokenType.NEWLINE);
        return { type: "DiscardStatement" };
    }

    parseAssignment() {
        const name = this.expect(TokenType.IDENT).lexeme;
        this.expect(TokenType.OPERATOR);
        const expr = this.parseExpr();
        this.expect(TokenType.NEWLINE);
        return { type: "Assignment", name, expr };
    }

    parseIfStatement() {
        this.expect(TokenType.KEYWORD);
        const condition = this.parseExpr();
        this.expect(TokenType.COLON);
        this.expect(TokenType.NEWLINE);
        this.expect(TokenType.INDENT);
        const body = [];
        while (this.peek().type !== TokenType.DEDENT && this.peek().type !== TokenType.EOF) {
            body.push(this.parseStatement());
        }
        this.expect(TokenType.DEDENT);
        return { type: "IfStatement", condition, body };
    }

    parseJudgeExpr() {
        const token = this.advance();
        if (token.type !== TokenType.OPERATOR || (token.lexeme !== "+" && token.lexeme !== "-")) {
            throw new SyntaxError(`Expected '+' or '-' but got ${token.lexeme}`);
        }
        const expr = this.parseExpr();
        this.expect(TokenType.NEWLINE);
        return { type: "JudgeExpr", op: token.lexeme, expr };
    }

    parseFunctionDeclaration() {
        this.expect(TokenType.KEYWORD);
        const name = this.expect(TokenType.IDENT).lexeme;
        this.expect(TokenType.LPAREN);
    
        const params = [];
        if (this.peek().type !== TokenType.RPAREN) {
            do {
                params.push(this.expect(TokenType.IDENT).lexeme);
            } while (this.match(TokenType.OPERATOR) && this.tokens[this.i - 1].lexeme === "," );
        }
        this.expect(TokenType.RPAREN);
        this.expect(TokenType.COLON);
        this.expect(TokenType.NEWLINE);
        this.expect(TokenType.INDENT);
    
        const body = [];
        while (this.peek().type !== TokenType.DEDENT && this.peek().type !== TokenType.EOF) {
            body.push(this.parseStatement());
        }
        this.expect(TokenType.DEDENT);
    
        return {
            type: "FunctionDeclaration",
            name,
            params,
            body
        };
    }    

    parseExpr() {
        return this.parseComparisonExpr();
    }

    parseComparisonExpr() {
        let left = this.parseLogicExpr();
        while (this.peek().type === TokenType.OPERATOR && [">", "<", ">=", "<=", "==", "!="].includes(this.peek().lexeme)) {
            const op = this.advance().lexeme;
            const right = this.parseLogicExpr();
            left = { type: "BinaryExpr", op, left, right };
        }
        return left;
    }

    parseLogicExpr() {
        let left = this.parseArithExpr();
        while (this.peek().type === TokenType.KEYWORD && [Keywords.AND, Keywords.OR].includes(this.peek().lexeme)) {
            const op = this.advance().lexeme;
            const right = this.parseArithExpr();
            left = { type: "LogicalExpr", op, left, right };
        }
        return left;
    }

    parseArithExpr() {
        let left = this.parseTerm();
        while (this.peek().type === TokenType.OPERATOR && [Operators.PLUS, Operators.MINUS].includes(this.peek().lexeme)) {
            const op = this.advance().lexeme;
            const right = this.parseTerm();
            left = { type: "BinaryExpr", op, left, right };
        }
        return left;
    }

    parseTerm() {
        let left = this.parseFactor();
        while (this.peek().type === TokenType.OPERATOR && [Operators.MUL, Operators.DIV].includes(this.peek().lexeme)) {
            const op = this.advance().lexeme;
            const right = this.parseFactor();
            left = { type: "BinaryExpr", op, left, right };
        }
        return left;
    }

    parseFactor() {
        if (this.peek().type === TokenType.OPERATOR && this.peek().lexeme === Operators.MINUS) {
            this.advance();
            const expr = this.parseFactor();
            return { type: "UnaryExpr", op: "-", expr };
        }
        if (this.peek().type === TokenType.LPAREN) {
            this.advance();
            const expr = this.parseExpr();
            this.expect(TokenType.RPAREN);
            return expr;
        }
        return this.parseAtom();
    }

    parseAtom() {
        const token = this.peek();
        if (token.type === TokenType.NUMBER || token.type === TokenType.STRING) {
            return { type: "Literal", value: this.advance().lexeme };
        }
    
        if (token.type === TokenType.IDENT) {
            let node = { type: "Identifier", name: this.advance().lexeme };
    
            if (this.peek().type === TokenType.LPAREN) {
                this.advance();
                const args = [];
                if (this.peek().type !== TokenType.RPAREN) {
                    do {
                        args.push(this.parseExpr());
                    } while (this.match(TokenType.OPERATOR) && this.tokens[this.i - 1].lexeme === "," );
                }
                this.expect(TokenType.RPAREN);
                return { type: "FunctionCall", name: node.name, args };
            }
    
            while (this.peek().type === TokenType.DOT) {
                this.advance();
                const field = this.expect(TokenType.IDENT, TokenType.META).lexeme;
                node = { type: "FieldAccess", object: node, field };
            }
            return node;
        }
    
        throw new SyntaxError(`Unexpected token: ${token.type}`);
    }    
}

export function parse(tokens) {
    return new Parser(tokens).parseProgram();
}