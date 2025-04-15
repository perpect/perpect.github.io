/*
<program>         ::= { <statement> }

<statement>       ::= <if-statement>
                    | <fail-statement>
                    | <assignment>

<if-statement>    ::= "if" "(" <expression> ")" "{" { <statement> } "}"

<fail-statement>  ::= "fail" ";"

<assignment>      ::= <identifier> "=" <expression> ";"

<expression>      ::= <term> [ <binary-operator> <term> ]

<term>            ::= <qualified-identifier>
                    | <identifier>
                    | <string-literal>
                    | <number-literal>

<qualified-identifier> ::= <identifier> "." <identifier>

<binary-operator> ::= "==" | "!=" | "<" | "<=" | ">" | ">="

<identifier>      ::= 알파벳, 숫자, _, 한글 등으로 시작하는 이름
<string-literal>  ::= '"' { 문자 } '"' | "'" { 문자 } "'"
<number-literal>  ::= 정수 [ "." 숫자들 ] [ ("e"|"E") [ "+"|"-" ] 숫자들 ]
*/
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.idx = 0;
    }

    peek(offset = 0) {
        return this.tokens[this.idx + offset];
    }

    current() {
        return this.tokens[this.idx];
    }

    match(type) {
        return this.current()?.tokenType === type;
    }

    expect(type) {
        const token = this.current();
        if (token?.tokenType !== type) {
            throw new Error(`Expected ${type}, got ${token?.tokenType}`);
        }
        this.idx++;
        return token;
    }

    parse() {
        const nodes = [];

        while (!this.match(TokenType.EOF)) {
            const node = this.statement();
            if (node) nodes.push(node);
        }

        return {
            type: "Program",
            body: nodes
        };
    }

    statement() {
        if (this.match(TokenType.IF)) {
            return this.parseIfStatement();
        } else if (this.match(TokenType.FAIL)) {
            this.expect(TokenType.FAIL);
            this.expect(TokenType.SEMICOLON);
            return { type: "FailStatement" };
        } else if (this.match(TokenType.IDENTIFIER)) {
            return this.parseAssignment();
        }

        throw new Error(`Unknown statement starting with ${this.current().tokenType}`);
    }

}