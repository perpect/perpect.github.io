var Kind = {
    Unknown : 0,
    EndOfToken : 1,
    NullLiteral : 2,
    TrueLiteral : 3,
    FalseLiteral : 4,
    NumberLiteral : 5,
    StringLiteral : 6,
    Identifier : 7,

    Variable : 8,
    For : 9,
    Break : 10,
    Continue : 11,
    If : 12,
    Elif : 13,
    Else : 14,
    Print : 15,
    PrintLine : 16,

    LogicalAnd : 17,
    LogicalOr : 18,
    Assignment : 19,
    Add : 20,
    Subtract : 21,
    Multiply : 22,
    Divide : 23,
    Modulo : 24,
    Equal : 25,
    NotEqual : 26,
    LessThan : 27,
    GreaterThan : 28,
    LessOrEqual : 29,
    GreaterOrEqual : 30,

    Comma : 31,
    Colon : 32,
    Semicolon : 33,
    LeftParen : 34,
    RightParen : 35,
    LeftBrace : 36,
    RightBrace : 37,
    LeftBraket : 38,
    RightBraket : 39
};
Object.freeze(Kind);

var Kind = [
    "Unknown",
    "EndOfToken",
    "NullLiteral",
    "TrueLiteral",
    "FalseLiteral",
    "NumberLiteral",
    "StringLiteral",
    "Identifier",

    "Variable",
    "For",
    "Break",
    "Continue",
    "If",
    "Elif",
    "Else",
    "Print",
    "PrintLine",

    "LogicalAnd",
    "LogicalOr",
    "Assignment",
    "Add",
    "Subtract",
    "Multiply",
    "Divide",
    "Modulo",
    "Equal",
    "NotEqual",
    "LessThan",
    "GreaterThan",
    "LessOrEqual",
    "GreaterOrEqual",

    "Comma",
    "Colon",
    "Semicolon",
    "LeftParen",
    "RightParen",
    "LeftBrace",
    "RightBrace",
    "LeftBraket",
    "RightBraket"
];
Object.freeze(Kind);

function toKind(string) {
    if (string in stringToKind)
        return stringToKind[string];
    return Kind.Unknown;
}