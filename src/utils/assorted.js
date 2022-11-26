const degreesToRads = (degree) => {
  return (degree * Math.PI) / 180;
};

const roundDownToNearestMultiple = (number, multiple) => {
  return Math.floor(number / multiple) * multiple;
};

const mapUVToWorld = (coord, size) => {
  return coord * size - size / 2;
};

export { degreesToRads, roundDownToNearestMultiple, mapUVToWorld };
