// Calandar.js는 하나의 월에 대한 휴일 등 날짜에 대한 정보를 관리하는 역할을 한다.
// Calandar는 월을 기준으로 날짜를 관리하며, 각 날짜에 대한 정보를 포함하고 있다.
// 이를 통해 ScheduleTable 클래스는 각 날짜에 대한 정보를 관리할 수 있다.
import { Event, EventManager } from "./Event.js";
class Calandar {
    constructor(year, month) {
        this.year = year;
        this.month = month;
        this.dates = this.generateDates();
    }

    generateDates() {
        const dates = [];
        const daysInMonth = new Date(this.year, this.month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            dates.push({
                day: day,
                isHoliday: false,
                events: new EventManager(),
            });
        }

        return dates;
    }

    addHoliday(day) {
        const date = this.dates[day - 1];
        if (date) date.isHoliday = true;
    }

    deleteHoliday(day) {
        const date = this.dates[day - 1];
        if (date) date.isHoliday = false;
    }

    addEvent(day, event) {
        const date = this.dates[day - 1];
        if (!date) return;
        date.events.addEvent(event);
        if (event.getDuration() > 0) {
            for (let i = 0; i <= event.getDuration(); i++) {
                const targetDate = new Date(event.startDate);
                targetDate.setDate(targetDate.getDate() + i);
                const targetDay = targetDate.getDate();
                const targetMonth = targetDate.getMonth() + 1;
                if (targetMonth === this.month) {
                    this.dates[targetDay - 1].events.addEvent(event);
                }
            }
        }
    }

    deleteEvent(day, idx) {
        const date = this.dates[day - 1];
        if (!date) return;
        date.events.deleteEvent(idx);
        if (event.getDuration() > 0) {
            for (let i = 0; i <= event.getDuration(); i++) {
                const targetDate = new Date(event.startDate);
                targetDate.setDate(targetDate.getDate() + i);
                const targetDay = targetDate.getDate();
                const targetMonth = targetDate.getMonth() + 1;
                if (targetMonth === this.month) {
                    this.dates[targetDay - 1].events.deleteEvent(idx);
                }
            }
        }
    }

    topEventIdx(day) {
        const date = this.dates[day - 1];
        if (date) return date.events.length - 1;
    }

    getDateInfo(day) {
        return this.dates[day - 1] || null;
    }
}

export { Calandar };
