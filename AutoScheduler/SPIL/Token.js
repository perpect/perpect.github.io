export const Keywords = {
    START: "시작",
    LOOP: "루프",
    JUDGE: "판단",
    IF: "만약",
    DISCARD: "폐기",
    AND: "그리고",
    OR: "또는",
    FUNCTION: "함수",
    RETURN: "반환"
};

export const Operators = {
    PLUS: "+",
    MINUS: "-",
    MUL: "*",
    DIV: "/",
    ASSIGN: "=",
    GT: ">",
    LT: "<",
    EQ: "==",
    NEQ: "!=",
    GTE: ">=",
    LTE: "<="
};

export const TokenType = {
    NEWLINE: "NEWLINE",
    INDENT: "INDENT",
    DEDENT: "DEDENT",
    COLON: "COLON",
    DOT: "DOT",
    NUMBER: "NUMBER",
    STRING: "STRING",
    IDENT: "IDENT",
    KEYWORD: "KEYWORD",
    META: "META",
    OPERATOR: "OPERATOR",
    LPAREN: "LPAREN",
    RPAREN: "RPAREN",
    EOF: "EOF"
};