# 1. 🎯 프로젝트 개요
24시간 교대근무가 필요한 조직에서 근무표를 공정하고 효율적으로 생성할 수 있도록 하기 위해, 사용자가 직접 규칙을 선언할 수 있는 도메인 특화 언어(DSL) 기반 인터프리터를 개발한다.

# 2. 🧠 시스템 방향성
인터프리터 기반 DSL (Python처럼 줄 단위 해석)

사용자가 간단한 문법으로 규칙 정의 가능

하드 제약조건(fail)과 소프트 페널티/보상(+/-)을 구분

최종 목적 함수는 **여러 평가 기준의 합산(value function)**으로 구성

# 3. ✅ 핵심 설계 내용
## 3.1 토크나이저 개선 방향
줄 단위 해석에 적합하게 개편

공백 및 줄바꿈 처리를 명확히

정규식 지원 (패턴 탐지에 활용)

e 지수 표현 지원 등 숫자 파싱 강화

## 3.2 문법 예시
### 🎯 하드 룰
context person:
    if match_pattern("야야"):
        fail "야간 연속 근무 금지"
### 📉 소프트 코스트
context person:
    if match_pattern("야비야"):
        fatigue += 5

    if day_count("비") > 2:
        rest_bonus += 3
### 🧮 목적 함수
value_function:
    return fatigue * 1.5 - rest_bonus * 2
### ⚙️ 파라미터 설정
param min_work_days = 15
param required_hours = 160
# 4. 🔧 핵심 기능
context 단위 분리: person, day, cell 등 기준에 따라 규칙 적용

내장 함수 제공:

match_pattern("주야비")

day_count("비") > 2

is_weekend(), is_holiday()

fail 키워드로 하드 제한 조건 명시

각 조건의 결과값을 변수화해 목적 함수에서 참조 가능

# 5. 🧪 예시 정책 요약
규칙 내용구현 예시
1. 야야 연속 금지	if match_pattern("야야"): fail
2. 야간 후엔 무조건 비번	if match_pattern("야[^비]"): fail
3. 근무 시간 160h+, 15일 이상	person.total_hours > 160 and person.work_days >= 15
4. 하루 주/야 인원 1명씩	context day: if count("야") != 1 → fail
5. 피로도 고려 분배	fatigue += value, return abs(p1.fatigue - p2.fatigue)
# 6. 📌 키워드 목록
키워드	설명
`context`	평가 기준 단위 (person, day 등)
`if`, `else`	조건문
`fail`	해당 조건 위반 시 일정표 폐기
`+=`, `-=`	코스트 및 보상 조정
`value_function`	최종 최적화 함수
`param`	전역 변수 선언
# 7. 💡 확장 아이디어
@penalty, @bonus와 같은 주석 기반 태그로 분석/시각화 연동

다양한 목적 함수를 지원하는 다중 평가 시스템

사용자 친화적 규칙 작성 GUI


# 참고
```# 1. 야간 후 비번이 1회 초과일 경우 금지
#    단, 휴가 일수가 적은 경우 (주말에 한정하여) 허용
rule "야간 후 비번 초과 제한":
    if night_after_off > 1 and vacation_days < 3 and not is_weekend:
        fail "야간 후 비번이 2회 이상 (휴가 적고 주말 아님)"

# 2. 야간 후엔 반드시 비번이 따라와야 함
rule "야간 다음 날 비번 필수":
    if night_shift and not next_day_off:
        fail "야간 다음 날 비번이 아님"

# 3. 최소 근무 시간과 근무 일수 보장
rule "근무량 조건":
    if total_hours < 160 or work_days < 15:
        cost += 100  # 코스트 부여 (페널티)

# 4. 매일 주간 1명 + 야간 1명 필수
rule "하루 근무자 인원 조건":
    if day_shift_count != 1 or night_shift_count != 1:
        fail "하루 근무 인원이 기준 미달"

# 5. 피로도 기반 페널티 적용
#    - 야간 중 일 발생 시 피로도 증가
#    - 주말 주간 근무는 피로도 감소
rule "피로도 계산":
    if fatigue > average_fatigue:
        cost += (fatigue - average_fatigue) * 2

# 6. 연속 야간-비번-야간 ("짱비짱비") 패턴 금지
rule "연속 야간 패턴 제한":
    if work_pattern contains "짱비짱비":
        fail "연속된 짱비짱비 패턴 금지"

# 7. 하이퍼파라미터 조정 (직접 수치 조정도 가능)
rule "가중치 조정":
    night_penalty += 10
    weekend_bonus -= 5

# 8. 가치 함수 기반 코스트 통합
value_function "총 스케줄 가치 계산":
    return fatigue_penalty + unfairness_score + absence_penalt```