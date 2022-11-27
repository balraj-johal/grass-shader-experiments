import { alea } from "seedrandom";

const generateRandomString = (length = 6) => {
  return Math.random().toString(20).slice(2, length);
};

export const getSeed = () => {
  let seed = window.localStorage.getItem("SEED");
  if (!seed) {
    seed = generateRandomString(10);
    window.localStorage.setItem("SEED", seed);
  }
  return seed;
};

const Rand = {
  generate: new alea(getSeed()),
};

export default Rand;
