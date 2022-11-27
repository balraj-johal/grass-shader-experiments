const getStartOfDay = (date) => {
  return new Date(date.toDateString());
};

const isNewDay = () => {
  const lastActionString = window.localStorage.getItem("LAST_ACTION");
  const lastActionDate = lastActionString
    ? new Date(lastActionString)
    : new Date(1997, 10, 29);
  return (
    getStartOfDay(lastActionDate).getTime() <
    getStartOfDay(new Date()).getTime()
  );
};

export { getStartOfDay, isNewDay };
