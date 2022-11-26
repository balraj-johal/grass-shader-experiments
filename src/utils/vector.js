const getDistanceVector = (x1, z1, x2, z2) => {
  return [x1 - x2, z1 - z2];
};

const getVectorMagnitude = (vector) => {
  const aSquared = Math.pow(vector[0], 2);
  const bSquared = Math.pow(vector[1], 2);
  const cSquared = aSquared + bSquared;
  return Math.sqrt(cSquared);
};

export { getDistanceVector, getVectorMagnitude };
