const degreesToRads = (degree) => {
  return (degree * Math.PI) / 180;
};

const roundDownToNearestMultiple = (number, multiple) => {
  return Math.floor(number / multiple) * multiple;
};

export { degreesToRads, roundDownToNearestMultiple };
