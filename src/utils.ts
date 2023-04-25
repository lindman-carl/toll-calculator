export const getDateString = (date: Date) => {
  // format date to "month/day", "2/14"
  // 1-indexed
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const getMinutesSinceMidnight = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();
