class Token{
    constructor(kind, content){
        this.kind = kind;
        this.content = content;
    }
}

function isDigit(c){
    return "0" <= c && c <= "9";
}

function warning(content){
    console.warn(content + ":" + scanLine + ":" + scanIdxInLine);
}

function tokenizerError(content){
    console.error("토큰화 과정 오류:" + content + ":" + scanLine + ":" + scanIdxInLine);
}

function nextIdx(){
    scanIdx++;
    scanIdxInLine++;
}

var scanIdx;
var scanLine;
var scanIdxInLine;
var sourceCode;

function scan(source) {
    sourceCode = source;
    scanIdx = 0;
    scanLine = 1;
    scanIdxInLine = 0;

    let result = [];
    let token;

    while (scanIdx < sourceCode.length) {
        const char = sourceCode[scanIdx];

        if (char == '"' || char == "'") {
            token = stringTokenizer(sourceCode);
        } else if (/[\t\r\n ]/.test(char)) {
            whiteSpaceTokenizer(sourceCode); // 일부러 공백들은 계산 안 하게 함
            continue;
        } else if ("=+\-*/!<>():;{},.".includes(char)) {
            token = operatorTokenizer(sourceCode);
        } else if (isDigit(char)) {
            token = numberTokenizer(sourceCode);
        } else if (isIdentifierPart(char)) {
            token = identifierTokenizer(sourceCode);
        } else {
            nextIdx();
            warning("유효하지 않은 글자입니다.");
            continue;
            //token = new Token(Kind.Unknown, char);
        }
        result.push(token);
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
        nextIdx();
        char = sourceCode[scanIdx];
        if (escape){
            switch (char){
                case "b":
                    content += "\b";
                    break;
                case "n":
                    content += "\n";
                    break;
                case "t":
                    content += "\t";
                    break;
                default:
                    content += char;
            }
            escape = false;
        }
        else if(char == "\\")
            escape = true;
        else if(char == startSymbol){
            nextIdx();
            return new Token(Kind.StringLiteral, content);
        } else
            content += char;
    }
    tokenizerError("종결되지 않은 문자열 리터럴입니다.");
    return null;
}

function whiteSpaceTokenizer(sourceCode) {
    let content = "";
    let char = sourceCode[scanIdx];
    content += char;
    nextIdx();
    if (char == "\n"){
        scanIdxInLine = 0;
        scanLine++;
    }
    return new Token(Kind.WhiteSpace, content);
}

function identifierTokenizer(sourceCode) {
    let content = "";

    while (scanIdx < sourceCode.length && isIdentifierPart(sourceCode[scanIdx])) {
        content += sourceCode[scanIdx];
        nextIdx();
    }

    if (isKeyword(content)) {
        return new Token(Kind.Keyword, content);
    }

    return new Token(Kind.Identifier, content);
}

function isIdentifierPart(char) {
    return /[a-zA-Z0-9_ㄱ-ㅎㅏ-ㅣ가-힣]/.test(char);
}

function isKeyword(word) {
    const keywords = ["if", "else", "true", "false"];
    return keywords.includes(word);
}

function operatorTokenizer(sourceCode) {
    let char = sourceCode[scanIdx];
    let content = char;

    nextIdx();
    if (scanIdx + 1 < sourceCode.length) {
        const nextChar = sourceCode[scanIdx];
        if (/==|!=|<=|>=/.test(char + nextChar)) {
            content += nextChar;
            nextIdx();
        }
    }
    return new Token(Kind.OperatorAndPunctuator, conten);
}

function numberTokenizer(sourceCode) {
    let content = 0;

    while (scanIdx < sourceCode.length && isDigit(sourceCode[scanIdx])) {
        content = content * 10 + parseInt(sourceCode[scanIdx]);
        nextIdx();
        console.log(sourceCode[scanIdx], content);
    }

    if (sourceCode[scanIdx] == ".") {
        nextIdx();
        if (!isDigit(sourceCode[scanIdx])){
            tokenizerError("소수점 뒤에 숫자가 없습니다.");
            return null;
        }
        let e = 0.1;
        while (scanIdx < sourceCode.length && isDigit(sourceCode[scanIdx])) {
            content = content + e * parseInt(sourceCode[scanIdx]);
            nextIdx();
            e *= 0.1;
        }
    }

    if (sourceCode[scanIdx] == "e" || sourceCode[scanIdx] == "E") {
        nextIdx();
        console.log(sourceCode[scanIdx]);
        if(isDigit(sourceCode[scanIdx]) || "-+".includes(sourceCode[scanIdx])){
            let d = 10;
            if (sourceCode[scanIdx] == "-")
                d = 0.1;
            if (!isDigit(sourceCode[scanIdx])){
                nextIdx();
            }
            let tmp = 0;
            while (scanIdx < sourceCode.length && isDigit(sourceCode[scanIdx])) {
                tmp = tmp * 10 + parseInt(sourceCode[scanIdx]);
                nextIdx();
            }
            content *= Math.pow(d, tmp);
        } else{
            tokenizerError("지수 표현에서 숫자가 필요합니다.");
            return null;
        }
    }
    return new Token(Kind.NumberLiteral, content);
}