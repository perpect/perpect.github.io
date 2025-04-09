class Token{
    constructor(kind, content){
        this.kind = kind;
        this.content = content;
    }
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

/*var CharRegex = {
    Unknown : 0,
    WhiteSpace : new RegExp("[ \t\n\v\f\r]*"),
    NumberLiteral : new RegExp("(0|\d+)(\.\d+)?((e|E)(\-|\+)?\d+)?"),
    StringLiteral : new RegExp("\"([^\\\"]|(\\([\\\"bfnrt]|u\d{4})))*\""),
    IdentifierAndKeyword : new RegExp("[ \t\n\v\f\r]*"),
    OperatorAndPunctuator : 5
};
Object.freeze(CharType);*/

var scanIdx;
var scanLine;
var scanIdxInLine;
var sourceCode;

function scan(source) {
    sourceCode = source;
    scanIdx = 0;
    scanLine = 0;
    scanIdxInLine = 0;

    let result = [];
    let token;

    while (scanIdx < sourceCode.length) {
        const char = sourceCode[scanIdx];

        if (char === '"' || char === "'") {
            token = stringTokenizer(sourceCode);
        } else if (/\s/.test(char)) {
            token = whiteSpaceTokenizer(sourceCode);
        } else if (/[a-zA-Z_]/.test(char)) {
            token = identifierTokenizer(sourceCode);
        } else {
            // 추후 operatorTokenizer나 numberTokenizer로 분리
            token = new Token(Kind.Unknown, char);
        }

        if (token) result.push(token);
        scanIdx++;
        scanIdxInLine++;
    }
    result.push(new Token(Kind.EndOfToken, null));
    for (let token of result) {
        console.log(`[${token.kind}] "${token.content}"`);
    }
    return result;
}

function stringTokenizer(sourceCode) {
    let char;
    let content = "";
    let escape = false;
    let startSymbol = sourceCode[scanIdx];
    while(scanIdx < sourceCode.length){
        scanIdx += 1;
        scanIdxInLine += 1;
        char = sourceCode[scanIdx];
        if (escape){
            switch (char){
                case "b":
                    content = content.slice(-1);
                    break;
                case "n":
                    content += "\n";
                    break;
                case "t":
                    content += "    ";
                    break;
                default:
                    content += char;
            }
            escape = false;
        }
        else if (char == "\\")
            escape = true;
        else if(char == startSymbol)
            return new Token(Kind.StringLiteral, content);
        else
            content += char;
    }
    console.log(scanLine + ":" + scanIdxInLine + "종결되지 않은 문자열 리터럴입니다.");
    return null;
}

function whiteSpaceTokenizer(sourceCode) {
    let content = "";
    let char;
    while (scanIdx < sourceCode.length) {
        char = sourceCode[scanIdx];
        if (char === " " || char === "\t" || char === "\r") {
            content += char;
            scanIdx++;
            scanIdxInLine++;
        } else if (char === "\n"){
            scanIdx++;
            scanIdxInLine = 0;
            scanLine++;
        }
        else {
            scanIdx--;
            scanIdxInLine--;
            break;
        }
    }
    return new Token(Kind.WhiteSpace, content);
}

function identifierTokenizer(sourceCode) {
    let content = "";
    let char = sourceCode[scanIdx];

    while (scanIdx < sourceCode.length) {
        char = sourceCode[scanIdx];
        if (/[a-zA-Z0-9_]/.test(char)) {
            content += char;
            scanIdx++;
            scanIdxInLine++;
        } else {
            scanIdx--;
            scanIdxInLine--;
            break;
        }
    }
    return new Token(Kind.Identifier, content);
}