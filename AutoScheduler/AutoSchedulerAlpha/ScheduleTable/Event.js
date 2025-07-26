// Event.js
// Event.js는 근무표의 이벤트를 관리하는 역할을 한다.
// Event는 특정 근무자의 특정 날짜에 대한 이벤트를 정의한다.
// Event는 Calandar.js의 날짜 정보를 사용하여 이벤트를 관리한다.
// Event는 근무자의 ID, 이벤트 종류, 이벤트 설명, 이벤트 특성 (예: 휴가, 훈련 등)를 포함한다.
// Event는 이벤트의 시작일과 종료일을 포함한다.
class Event {
    constructor(employeeId, eventType, description, attributes, startDate, endDate, id = null) {
        this.id = id?id:Date.now(); // 이벤트 ID (현재 시간을 기준으로 생성)
        this.employeeId = employeeId; // 근무자 ID
        this.eventType = eventType; // 이벤트 종류
        this.description = description; // 이벤트 설명
        this.attributes = attributes; // 이벤트 특성 (예: 휴가, 훈련 등)
        this.startDate = new Date(startDate); // 이벤트 시작일
        this.endDate = new Date(endDate); // 이벤트 종료일
    }

    // 이벤트 기간을 반환
    getDuration() {
        const timeDiff = this.endDate - this.startDate;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // 일 단위로 반환
    }

    // 이벤트가 특정 날짜에 포함되는지 확인
    isDateWithin(date) {
        const targetDate = new Date(date);
        return targetDate >= this.startDate && targetDate <= this.endDate;
    }

    // 이벤트 정보를 문자열로 반환
    toString() {
        return `Event for Employee ${this.employeeId}: ${this.eventType} (${this.description}) from ${this.startDate.toDateString()} to ${this.endDate.toDateString()}`;
    }
}

// EventManager 클래스는 이벤트를 관리하는 역할을 한다.
// EventManager는 이벤트를 추가, 삭제, 수정하는 기능을 제공한다.
// EventManager는 이벤트를 배열로 관리한다.
class EventManager {
    constructor() {
        this.events = []; // 이벤트를 담는 배열
    }

    addEvent(event) {
        this.events.push(event); // 이벤트 추가
    }

    deleteEvent(eventIdx) {
        this.events = this.events.pop(eventIdx);
    }

    updateEvent(eventId, updatedEvent) {
        const index = this.events.findIndex(event => event.id === eventId);
        if (index !== -1) {
            this.events[index] = updatedEvent; // 이벤트 수정
        }
    }

    getEventsByEmployeeId(employeeId) {
        return this.events.filter(event => event.employeeId === employeeId); // 특정 근무자의 이벤트 반환
    }
}

export { Event, EventManager };