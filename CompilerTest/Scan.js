class Token{
    constructor(kind, content){
        this.kind = kind;
        this.content = content;
    }
}

var scanIdx;
var sourceCode;

function scan(ori) {
    let result = [];
    sourceCode = ori;
    sourceCode += '\0';
    scanIdx = 0;
    while (sourceCode[scanIdx] != '\0') {
        switch (getCharType(sourceCode[scanIdx])) {
            case CharType.WhiteSpace:
                scanIdx += 1;
                break;
            case CharType.NumberLiteral:
                result.push(scanNumberLiteral());
                break;
            case CharType.StringLiteral:
                result.push(scanStringLiteral());
                break;
            case CharType.IdentifierAndKeyword:
                result.push(scanIdentifierAndKeyword());
                break;
            case CharType.OperatorAndPunctuator:
                result.push(scanOperatorAndPunctuator());
                break;
            default:
                console.log(sourceCode[scanIdx] + " : 사용할 수 없는 문자입니다.");
                return undefined;
        }
    }
    result.push(kind.EndOfToken);
    return result;
}

var CharType = {
    Unknown : 0,
    WhiteSpace : 1,
    NumberLiteral : 2,
    StringLiteral : 3,
    IdentifierAndKeyword : 4,
    OperatorAndPunctuator : 5
};
Object.freeze(CharType);

function getCharType(c) {
    if (' ' == c || '\t' == c || '\r' == c || '\n' == c)
        return CharType.WhiteSpace;
    if ('0' <= c && c <= '9')
        return CharType.NumberLiteral;
    if (c == '"' || c == "'")
        return CharType.StringLiteral;
    if ('a' <= c && c <= 'z' || 'A' <= c && c <= 'Z')
        return CharType.IdentifierAndKeyword;
    if (33 <= c && c <= 47 ||
        58 <= c && c <= 64 ||
        91 <= c && c <= 126)
        return CharType.OperatorAndPunctuator;
    return CharType.Unknown;
}

function isCharType(c, type) {
    switch (type) {
        case CharType.NumberLiteral:
            return '0' <= c && c <= '9';
        case CharType.StringLiteral:
            return 32 <= c && c <= 126 && c != '"' && c!='"';
        case CharType.IdentifierAndKeyword:
            return '0' <= c && c <= '9' ||
                'a' <= c && c <= 'z' ||
                'A' <= c && c <= 'Z';
        case CharType.OperatorAndPunctuator:
            return 33 <= c && c <= 47 && c != '"' && c != "'" ||
                58 <= c && c <= 64 ||
                91 <= c && c <= 96 ||
                123 <= c && c <= 126;
        default:
            return false;
    }
}

function scanNumberLiteral() {
    let string;
    if (sourceCode[scanIdx] == '.') {
        string += sourceCode[scanIdx];
        scanIdx += 1;
        while (isCharType(sourceCode[scanIdx], CharType.NumberLiteral)) {
            string += sourceCode[scanIdx];
            scanIdx += 1;
        }
    }
    return new Token(Kind.NumberLiteral, string);
}

function scanStringLiteral() {
    let string;
    scanIdx += 1;
    while (isCharType(sourceCode[scanIdx], CharType.StringLiteral)) {
        string += sourceCode[scanIdx];
        scanIdx += 1;
    }
    if (sourceCode[scanIdx] != '\'') {
        console.log("문자열의 종료 문자가 없습니다.");
        return undefined;
    }
    scanIdx += 1;
    return new Token(Kind.StringLiteral, string);
}

function scanIdentifierAndKeyword() {
    let string;
    while (isCharType(sourceCode[scanIdx], CharType.IdentifierAndKeyword)) {
        string += sourceCode[scanIdx];
        scanIdx += 1;
    }
    kind = toKind(string);
    if (kind == Kind.Unknown)
        kind = Kind.Identifier;
    return new Token(kind, string);
}

function scanOperatorAndPunctuator() {
    let string;
    while (isCharType(sourceCode[scanIdx], CharType.OperatorAndPunctuator)) {
        stirng += sourceCode[scanIdx];
        scanIdx += 1;
    }
    while (string.empty() == false && toKind(string) == Kind.Unknown) {
        string.pop_back();
        scanIdx--;
    }
    if (string.empty()) {
        console.log(sourceCode[scanIdx], "사용할 수 없는 문자입니다.");
        return undefined;
    }
    return new Token(toKind(string), string);
}