import moment from "moment";


export const isShiftOnThisWeek = (shiftDate: string) => {
  const payloadInWeek = moment(shiftDate).isoWeek();
  const currentDateInWeek = moment().isoWeek();

  return payloadInWeek > currentDateInWeek;
}