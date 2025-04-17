const Kind = {
    WhiteSpace: "WhiteSpace",
    NumberLiteral: "NumberLiteral",
    StringLiteral: "StringLiteral",
    Identifier: "Identifier",
    Keyword: "Keyword",
    OperatorAndPunctuator: "OperatorAndPunctuator",
    Comment: "Comment",
    EndOfToken: "EndOfToken",
    Function: "Function",
    BooleanLiteral: "BooleanLiteral",
    NullLiteral: "NullLiteral"
};
Object.freeze(Kind);

const TokenType = {
    IF: "IF",
    ELSE: "ELSE",
    TRUE: "TRUE",
    FALSE: "FALSE",
    FAIL: "FAIL",
    NULL: "NULL",
    LET: "LET",
    FUNCTION: "FUNCTION",
    RETURN: "RETURN",

    AND: "AND",
    OR: "OR",
    NOT: "NOT",

    EQ: "==",
    NEQ: "!=",
    LT: "<",
    GT: ">",
    LTE: "<=",
    GTE: ">=",
    ASSIGN: "=",
    PLUS: "+",
    MINUS: "-",
    MUL: "*",
    DIV: "/",
    MOD: "%",

    LPAREN: "(",
    RPAREN: ")",
    LBRACE: "{",
    RBRACE: "}",
    LBRACKET: "[",
    RBRACKET: "]",
    SEMICOLON: ";",
    COMMA: ",",
    DOT: ".",

    STRING: "STRING",
    NUMBER: "NUMBER",
    IDENTIFIER: "IDENTIFIER",

    WHITESPACE: "WHITESPACE",
    COMMENT: "COMMENT",
    EOF: "EOF"
};
Object.freeze(TokenType);

class Token {
    constructor(kind, value, line, column) {
        this.kind = kind;
        this.value = value;
        this.tokenType = this.getTokenType();
        this.line = line;
        this.column = column;
    }

    getTokenType() {
        if (this.kind === Kind.Keyword) {
            switch (this.value) {
                case "if": return TokenType.IF;
                case "else": return TokenType.ELSE;
                case "fail": return TokenType.FAIL;
                case "null": return TokenType.NULL;
                case "and": return TokenType.AND;
                case "or": return TokenType.OR;
                case "not": return TokenType.NOT;
                case "let": return TokenType.LET;
            }
        }

        if (this.kind === Kind.Function) {
            switch (this.value) {
                case "function": return TokenType.FUNCTION;
                case "return": return TokenType.RETURN;
            }
        }
        if (this.kind === Kind.BooleanLiteral) {
            switch (this.value) {
                case "true": return TokenType.TRUE;
                case "false": return TokenType.FALSE;
            }
        }
        if (this.kind === Kind.NullLiteral) {
            return TokenType.NULL;
        }
    
        if (this.kind === Kind.OperatorAndPunctuator) {
            switch (this.value) {
                case "==": return TokenType.EQ;
                case "!=": return TokenType.NEQ;
                case "<": return TokenType.LT;
                case ">": return TokenType.GT;
                case "<=": return TokenType.LTE;
                case ">=": return TokenType.GTE;
                case "=": return TokenType.ASSIGN;
                case "+": return TokenType.PLUS;
                case "-": return TokenType.MINUS;
                case "*": return TokenType.MUL;
                case "%": return TokenType.MOD;
                case "/": return TokenType.DIV;
                case "(": return TokenType.LPAREN;
                case ")": return TokenType.RPAREN;
                case "{": return TokenType.LBRACE;
                case "}": return TokenType.RBRACE;
                case "[": return TokenType.LBRACKET;
                case "]": return TokenType.RBRACKET;
                case ";": return TokenType.SEMICOLON;
                case ",": return TokenType.COMMA;
                case ".": return TokenType.DOT;
                case "not": return TokenType.NOT;
                case "and": return TokenType.AND;
                case "or": return TokenType.OR;
            }
        }
    
        if (this.kind === Kind.Identifier) return TokenType.IDENTIFIER;
        if (this.kind === Kind.StringLiteral) return TokenType.STRING;
        if (this.kind === Kind.NumberLiteral) return TokenType.NUMBER;
        if (this.kind === Kind.Comment) return TokenType.COMMENT;
        if (this.kind === Kind.WhiteSpace) return TokenType.WHITESPACE;
        if (this.kind === Kind.EndOfToken) return TokenType.EOF;
    
        console.warn("TokenTypeWarning : Unknown token type for", this);
        return null;
    }

    toString() {
        return `[${this.kind}:${this.tokenType}] "${this.value}"`;
    }    
}