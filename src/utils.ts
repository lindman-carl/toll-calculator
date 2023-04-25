export const getDateString = (date: Date) => {
  // format date to "month/day", "2/14"
  // 1-indexed
  return `${date.getMonth() + 1}/${date.getDate()}`;
};
