class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
        console.log(tokens);
    }

    current() {
        return this.tokens[this.position];
    }

    match(kind, tokenType = null) {
        const token = this.current();
        if (!token) return null;
        if (token.kind === kind && (tokenType === null || token.tokenType === tokenType)) {
            this.position++;
            return token;
        }
        return null;
    }

    expect(kind, tokenType = null) {
        const token = this.current();
        if (!token || token.kind !== kind || (tokenType !== null && token.tokenType !== tokenType)) {
            throw new Error(`Expected ${tokenType || kind} but got '${token?.value}' at ${token?.line}:${token?.column}`);
        }
        this.position++;
        return token;
    }

    parse() {
        const statements = [];
        while (this.current() && this.current().tokenType !== TokenType.EOF) {
            statements.push(this.statement());
        }
        return {
            type: "Program",
            body: statements
        };
    }

    statement() {
        const token = this.current();
        if (!token) throw new Error("Unexpected end of input");

        if (token.kind === Kind.Comment) return this.comment();
        if (token.kind === Kind.Keyword && token.tokenType === TokenType.IF) return this.ifStatement();
        if (token.kind === Kind.Keyword && token.tokenType === TokenType.FAIL) return this.fail();
        if (token.kind === Kind.Keyword && token.tokenType === TokenType.LET) return this.let();
        if (token.kind === Kind.Keyword && token.tokenType === TokenType.VALUE) return this.block("value");
        if (token.kind === Kind.Keyword && token.tokenType === TokenType.FUNCTION) return this.functionDeclaration();
        if (token.kind === Kind.Keyword && token.tokenType === TokenType.RETURN) return this.returnStatement();
        if (token.kind === Kind.Identifier) return this.assignment();

        throw new Error(`Unexpected token '${token.value}' at ${token?.line}:${token?.column}`);
    }

    comment() {
        const token = this.expect(Kind.Comment);
        return {
            type: "Comment",
            value: token.value
        };
    }

    let () {
        this.expect(Kind.Keyword, TokenType.LET);
        const id = this.expect(Kind.Identifier);
        this.expect(Kind.OperatorAndPunctuator, TokenType.ASSIGN);
        const expr = this.expression();
        this.expect(Kind.OperatorAndPunctuator, TokenType.SEMICOLON);
        return {
            type: "LetStatement",
            name: id.value,
            value: expr
        };
    }

    assignment() {
        const id = this.expect(Kind.Identifier);
        this.expect(Kind.OperatorAndPunctuator, TokenType.ASSIGN);
        const expr = this.expression();
        this.expect(Kind.OperatorAndPunctuator, TokenType.SEMICOLON);
        return {
            type: "Assignment",
            name: id.value,
            value: expr
        };
    }

    fail() {
        this.expect(Kind.Keyword, TokenType.FAIL);
        let condition = null;
        if (!(this.current().kind === Kind.OperatorAndPunctuator && this.current().tokenType === TokenType.SEMICOLON)) {
            condition = this.expression();
        }
        this.expect(Kind.OperatorAndPunctuator, TokenType.SEMICOLON);
        return {
            type: "FailStatement",
            condition
        };
    }

    block(kind) {
        this.expect(Kind.Keyword, TokenType.VALUE);
        this.expect(Kind.OperatorAndPunctuator, TokenType.LBRACE);
        const body = [];
        while (this.current() && !(this.current().kind === Kind.OperatorAndPunctuator && this.current().tokenType === TokenType.RBRACE)) {
            body.push(this.statement());
        }
        this.expect(Kind.OperatorAndPunctuator, TokenType.RBRACE);
        return {
            type: "Block",
            kind,
            body
        };
    }

    ifStatement() {
        this.expect(Kind.Keyword, TokenType.IF);
        const condition = this.expression();

        this.expect(Kind.OperatorAndPunctuator, TokenType.LBRACE);
        const consequent = [];
        while (
            this.current() &&
            !(this.current().kind === Kind.OperatorAndPunctuator && this.current().tokenType === TokenType.RBRACE)
        ) {
            consequent.push(this.statement());
        }
        this.expect(Kind.OperatorAndPunctuator, TokenType.RBRACE);

        let alternate = null;
        if (this.current() && this.current().kind === Kind.Keyword && this.current().tokenType === TokenType.ELSE) {
            this.position++;
            this.expect(Kind.OperatorAndPunctuator, TokenType.LBRACE);
            alternate = [];
            while (
                this.current() &&
                !(this.current().kind === Kind.OperatorAndPunctuator && this.current().tokenType === TokenType.RBRACE)
            ) {
                alternate.push(this.statement());
            }
            this.expect(Kind.OperatorAndPunctuator, TokenType.RBRACE);
        }

        return {
            type: "IfStatement",
            condition,
            consequent,
            alternate
        };
    }

    expression() {
        return this.logicalOr();
    }

    logicalOr() {
        let left = this.logicalAnd();
        while (this.match(Kind.OperatorAndPunctuator, TokenType.OR)) {
            const right = this.logicalAnd();
            left = {
                type: "LogicalExpression",
                operator: "or",
                left,
                right
            };
        }
        return left;
    }

    logicalAnd() {
        let left = this.equality();
        while (this.match(Kind.OperatorAndPunctuator, TokenType.AND)) {
            const right = this.equality();
            left = {
                type: "LogicalExpression",
                operator: "and",
                left,
                right
            };
        }
        return left;
    }

    equality() {
        let left = this.relational();
        while (true) {
            if (this.match(Kind.OperatorAndPunctuator, TokenType.EQ)) {
                const right = this.relational();
                left = {
                    type: "BinaryExpression",
                    operator: "==",
                    left,
                    right
                };
            } else if (this.match(Kind.OperatorAndPunctuator, TokenType.NEQ)) {
                const right = this.relational();
                left = {
                    type: "BinaryExpression",
                    operator: "!=",
                    left,
                    right
                };
            } else {
                break;
            }
        }
        return left;
    }

    relational() {
        let left = this.additive();
        while (true) {
            if (this.match(Kind.OperatorAndPunctuator, TokenType.LT)) {
                const right = this.additive();
                left = {
                    type: "BinaryExpression",
                    operator: "<",
                    left,
                    right
                };
            } else if (this.match(Kind.OperatorAndPunctuator, TokenType.GT)) {
                const right = this.additive();
                left = {
                    type: "BinaryExpression",
                    operator: ">",
                    left,
                    right
                };
            } else if (this.match(Kind.OperatorAndPunctuator, TokenType.LTE)) {
                const right = this.additive();
                left = {
                    type: "BinaryExpression",
                    operator: "<=",
                    left,
                    right
                };
            } else if (this.match(Kind.OperatorAndPunctuator, TokenType.GTE)) {
                const right = this.additive();
                left = {
                    type: "BinaryExpression",
                    operator: ">=",
                    left,
                    right
                };
            } else {
                break;
            }
        }
        return left;
    }

    additive() {
        let left = this.multiplicative();
        while (true) {
            if (this.match(Kind.OperatorAndPunctuator, TokenType.PLUS)) {
                const right = this.multiplicative();
                left = {
                    type: "BinaryExpression",
                    operator: "+",
                    left,
                    right
                };
            } else if (this.match(Kind.OperatorAndPunctuator, TokenType.MINUS)) {
                const right = this.multiplicative();
                left = {
                    type: "BinaryExpression",
                    operator: "-",
                    left,
                    right
                };
            } else {
                break;
            }
        }
        return left;
    }

    multiplicative() {
        let left = this.unary();
        while (true) {
            if (this.match(Kind.OperatorAndPunctuator, TokenType.MUL)) {
                const right = this.unary();
                left = {
                    type: "BinaryExpression",
                    operator: "*",
                    left,
                    right
                };
            } else if (this.match(Kind.OperatorAndPunctuator, TokenType.DIV)) {
                const right = this.unary();
                left = {
                    type: "BinaryExpression",
                    operator: "/",
                    left,
                    right
                };
            } else if (this.match(Kind.OperatorAndPunctuator, TokenType.MOD)) {
                const right = this.unary();
                left = {
                    type: "BinaryExpression",
                    operator: "%",
                    left,
                    right
                };
            } else {
                break;
            }
        }
        return left;
    }

    unary() {
        if (this.match(Kind.OperatorAndPunctuator, TokenType.MINUS)) {
            return {
                type: "UnaryExpression",
                operator: "-",
                argument: this.unary()
            };
        }
        if (this.match(Kind.OperatorAndPunctuator, TokenType.NOT)) {
            return {
                type: "UnaryExpression",
                operator: "not",
                argument: this.unary()
            };
        }
        return this.primary();
    }

    primary() {
        const token = this.current();

        if (token.kind === Kind.NullLiteral && token.tokenType === TokenType.NULL) {
            this.position++;
            return {
                type: "NullLiteral",
                value: null
            };
        }

        if (token.kind === Kind.BooleanLiteral && token.tokenType === TokenType.TRUE) {
            this.position++;
            return {
                type: "BooleanLiteral",
                value: true
            };
        }
        if (token.kind === Kind.BooleanLiteral && token.tokenType === TokenType.FALSE) {
            this.position++;
            return {
                type: "BooleanLiteral",
                value: false
            };
        }

        if (token.kind === Kind.NumberLiteral) {
            this.position++;
            return {
                type: "NumberLiteral",
                value: Number(token.value)
            };
        }

        if (token.kind === Kind.StringLiteral) {
            this.position++;
            return {
                type: "StringLiteral",
                value: token.value
            };
        }

        if (token.kind === Kind.Identifier) {
            const next = this.tokens[this.position + 1];
            if (next && next.kind === Kind.OperatorAndPunctuator && next.tokenType === TokenType.LPAREN) {
                return this.functionCall();
            }
            this.position++;
            return {
                type: "Identifier",
                name: token.value
            };
        }

        if (this.match(Kind.OperatorAndPunctuator, TokenType.LPAREN)) {
            const expr = this.expression();
            this.expect(Kind.OperatorAndPunctuator, TokenType.RPAREN);
            return expr;
        }

        throw new Error(`Unexpected token '${token?.value}' at line ${token?.line}`);
    }
    functionDeclaration() {
        this.expect(Kind.Keyword, TokenType.FUNCTION); // 'function'
        const name = this.expect(Kind.Identifier).value;
      
        this.expect(Kind.OperatorAndPunctuator, TokenType.LPAREN);
      
        const params = [];
        if (
          this.current().kind === Kind.Identifier
        ) {
          params.push(this.expect(Kind.Identifier).value);
          while (
            this.current().kind === Kind.OperatorAndPunctuator &&
            this.current().tokenType === TokenType.COMMA
          ) {
            this.expect(Kind.OperatorAndPunctuator, TokenType.COMMA);
            params.push(this.expect(Kind.Identifier).value);
          }
        }
      
        this.expect(Kind.OperatorAndPunctuator, TokenType.RPAREN);
      
        this.expect(Kind.OperatorAndPunctuator, TokenType.LBRACE);
      
        const body = [];
        while (
          this.current() &&
          !(this.current().kind === Kind.OperatorAndPunctuator &&
            this.current().tokenType === TokenType.RBRACE)
        ) {
          body.push(this.statement());
        }
      
        this.expect(Kind.OperatorAndPunctuator, TokenType.RBRACE);
      
        return {
          type: "FunctionDeclaration",
          name,
          params,
          body,
        };
      }

    returnStatement() {
        this.expect(Kind.Keyword, TokenType.RETURN);
        const value = this.expression();
        this.expect(Kind.OperatorAndPunctuator, TokenType.SEMICOLON);
      
        return {
          type: "ReturnStatement",
          value
        };
      }      

    functionCall() {
        const name = this.expect(Kind.Identifier).value;
        this.expect(Kind.OperatorAndPunctuator, TokenType.LPAREN);

        const args = [];
        while (this.current() && !(this.current().kind === Kind.OperatorAndPunctuator && this.current().tokenType === TokenType.RPAREN)) {
            args.push(this.expression());
            if (this.current().kind === Kind.OperatorAndPunctuator && this.current().tokenType === TokenType.COMMA) {
                this.expect(Kind.OperatorAndPunctuator, TokenType.COMMA);
            } else {
                break;
            }
        }

        this.expect(Kind.OperatorAndPunctuator, TokenType.RPAREN);
        return {
            type: "FunctionCall",
            name,
            args
        };
    }
}

const examples = [
    `
if (x == 10) {
    print = "Hello, World!";
} else {
    print = "Goodbye!";
}
`,
    `
let y = 20;
if (y > 0) {
    y = y - 1;
    print = y;
}
`,
    `
@ This is a comment
let z = "Test string with escape \\n characters";
if (not z == false) {
    print = 1e12;
}
`
];

examples.forEach((sourceCode, index) => {
    console.log(`Example ${index + 1}:`);
    const scanner = new Tokenizer(sourceCode);
    const tokens = scanner.token;

    tokens.forEach(token => {
        console.log(token.toString());
    });

    console.log("----");

    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log(JSON.stringify(ast, null, 2));
    console.log("----");

});