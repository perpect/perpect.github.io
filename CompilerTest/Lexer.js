class Tokenizer {
    constructor(sourceCode) {
        this.srcCode = sourceCode;
        this.idx = 0;
        this.line = 1;
        this.lastLineChange = 0;
        this.token = this.scan(sourceCode);
    }

    warn(content){
        const line = this.line;
        const column = this.idx - this.lastLineChange + 1;
        console.warn(`Warning: ${content} (줄: ${line}, 글자: ${column})`);
    }

    error(content){
        const line = this.line;
        const column = this.idx - this.lastLineChange + 1;
        console.log(this.idx);
        console.error(`Error: ${content} (줄: ${line}, 글자: ${column})`);
    }

    newToken(kind, value){
        const column = this.idx - this.lastLineChange + 1;
        return new Token(kind, value, this.line, column);
    }

    isWhiteSpace(c){return /[\t\r\n ]/.test(c);}
    isDigit(c){return /[0-9]/.test(c);}
    isOperatorAndPunctuator(c){
        const operatorsAndPunctuators = [
            '%', '=', '+', '-', '*', '/', '!', '<', '>', '(', ')', ':', ';', '{', '}', ',', '.', 
            '==', '<=', '>=', '!=', '%=', '*=', '/=', '+=', '-='
        ];
        return operatorsAndPunctuators.includes(c);
    }
    isIdentifierPart(c) {return /[a-zA-Z0-9_ㄱ-ㅎㅏ-ㅣ가-힣]/.test(c);}
    isKeyword(c) {return /if|else|fail|let/.test(c);}
    isBooleanLiteral(c) {return /true|false/.test(c);}
    isNullLiteral(c) {return /null/.test(c);}
    isFunction(c) {return /function|return/.test(c);}
    isLogicalOperator(c) {return /and|or|not/.test(c);}

    scan(){
        let result = [];
        let token;
        while (this.idx < this.srcCode.length) {
            const char = this.srcCode[this.idx];
            if (/["']/.test(char))
                token = this.string();
            else if (char == "@")
                token = this.comment();
            else if (this.isWhiteSpace(char)) {
                this.whiteSpace();
                continue;
            } else if (this.isOperatorAndPunctuator(char))
                token = this.operatorAndPunctuator();
            else if (this.isDigit(char))
                token = this.number();
            else if (this.isIdentifierPart(char))
                token = this.identifier();
            else {
                this.idx++;
                this.warn("유효하지 않은 글자입니다.");
                continue;
            }
            result.push(token);
        }
        result.push(this.newToken(Kind.EndOfToken, TokenType.EOF));
        return result;
    }

    identifier() {
        let identifier = '';

        while (this.idx < this.srcCode.length && this.isIdentifierPart(this.srcCode[this.idx])) {
            identifier += this.srcCode[this.idx];
            this.idx++;
        }

        if (this.isKeyword(identifier)) {
            return this.newToken(Kind.Keyword, identifier);
        }
        if (this.isBooleanLiteral(identifier)) {
            return this.newToken(Kind.BooleanLiteral, identifier);
        }
        if (this.isNullLiteral(identifier)) {
            return this.newToken(Kind.NullLiteral, identifier);
        }
        if (this.isFunction(identifier)) {
            return this.newToken(Kind.Function, identifier);
        }
        if (this.isLogicalOperator(identifier)) {
            return this.newToken(Kind.OperatorAndPunctuator, identifier);
        }

        return this.newToken(Kind.Identifier, identifier);
    }

    string() {
        let str = '';
        const quote = this.srcCode[this.idx++];

        while (this.idx < this.srcCode.length) {
            const char = this.srcCode[this.idx];
            if (char == quote) {
                this.idx++;
                return this.newToken(Kind.StringLiteral, str);
            }
            if (char == '\\') {
                this.idx++;
                if (this.idx < this.srcCode.length) {
                    const escapeChar = this.srcCode[this.idx];
                    switch (escapeChar) {
                        case 'n': str += '\n'; break;
                        case 't': str += '\t'; break; 
                        case 'r': str += '\r'; break; 
                        case '\\': str += '\\'; break;
                        case '"': str += '"'; break;
                        case "'": str += "'"; break;
                        default: str += escapeChar; break;
                    }
                }
            } else
                str += char;
            this.idx++;
        }
        this.error(`문자열 리터럴이 닫히지 않았습니다: ${str}`);
    }

    comment(){
        let comment = '';
        this.idx++;

        while (this.idx < this.srcCode.length) {
            const char = this.srcCode[this.idx];
            if (char === '\n') {
                this.idx++;
                return this.newToken(Kind.Comment, comment);
            }
            comment += char;
            this.idx++;
        }

        return this.newToken(Kind.Comment, comment);
    }

    whiteSpace(){
        let whitespace = '';
        while (this.idx < this.srcCode.length && this.isWhiteSpace(this.srcCode[this.idx])) {
            const char = this.srcCode[this.idx];
            if (char === '\n') {
                this.line++;
                this.lastLineChange = this.idx;
            }
            whitespace += char;
            this.idx++;
        }
        return this.newToken(Kind.WhiteSpace, whitespace);
    }

    number() {
        let num = '';
        let hasDot = false;
        let hasExponent = false;

        while (this.idx < this.srcCode.length) {
            const char = this.srcCode[this.idx];

            if (this.isDigit(char)) {
                num += char;
            } else if (char === '.' && !hasDot && !hasExponent) {
                hasDot = true;
                num += char;
            } else if ((char === 'e' || char === 'E') && !hasExponent) {
                hasExponent = true;
                num += char;

                const nextChar = this.srcCode[this.idx + 1];
                if (nextChar === '+' || nextChar === '-') {
                    num += nextChar;
                    this.idx++;
                }
            } else {
                break;
            }
            this.idx++;
        }

        if (num.endsWith('.') || num.endsWith('e') || num.endsWith('E') || num.endsWith('+') || num.endsWith('-')) {
            this.error(`유효하지 않은 숫자 리터럴: ${num}`);
        }

        return this.newToken(Kind.NumberLiteral, num);
    }

    operatorAndPunctuator() {
        const oneChar = this.srcCode[this.idx];
        const twoChar = this.srcCode.slice(this.idx, this.idx + 2);
        
        const twoCharOps = ["==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%="];
        const oneCharOps = [
            "%", "=", "+", "-", "*", "/", "!", "<", ">", 
            "(", ")", ":", ";", "{", "}", ",", "."
        ];
    
        if (twoCharOps.includes(twoChar)) {
            this.idx += 2;
            return this.newToken(Kind.OperatorAndPunctuator, twoChar);
        }
    
        else if (oneCharOps.includes(oneChar)) {
            this.idx ++;
            return this.newToken(Kind.OperatorAndPunctuator, oneChar);
        }
    
        this.warn(`알 수 없는 연산자 또는 구두점: ${oneChar}`);
        this.idx ++;
        return this.newToken(Kind.OperatorAndPunctuator, oneChar);
    }
}