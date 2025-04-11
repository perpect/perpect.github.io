const Kind = {
    WhiteSpace: "WhiteSpace",
    NumberLiteral: "NumberLiteral",
    StringLiteral: "StringLiteral",
    Identifier: "Identifier",
    Keyword: "Keyword",
    OperatorAndPunctuator: "OperatorAndPunctuator",
    EndOfToken: "EndOfToken"
};
Object.freeze(Kind);

function toKind(string) {
    if (string in stringToKind)
        return stringToKind[string];
    return Kind.Unknown;
}