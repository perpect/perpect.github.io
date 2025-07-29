class DutyType {
  constructor(label, hours, isDay = false, isNight = false, isLeft = false) {
    this.label = label;
    this.hours = hours;
    this.isDay = isDay;
    this.isNight = isNight;
    this.isLeft = isLeft;
  }
  toString() {
    return this.label;
  }
}

const Duty = Object.freeze({
  DAY:   new DutyType("주", 10, true, false, false),
  NIGHT: new DutyType("야", 14, false, true, false),
  OFF:   new DutyType("비", 0),
  //ALL:   new DutyType("짱", 24, true, true, false),
  //VACATION: new DutyType("휴", 0, false, false, true)
});
const DUTIES = Object.values(Duty);

export { Duty, DUTIES, DutyType };