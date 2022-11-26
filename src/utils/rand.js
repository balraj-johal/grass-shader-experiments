import { alea } from "seedrandom";

export const getSeed = () => {
  let seed = window.localStorage.getItem("SEED");
  if (!seed) {
    seed = "NEWSEED";
    window.localStorage.setItem("SEED", seed);
  }
  return seed;
};

const Rand = {
  generate: new alea(getSeed()),
};

export default Rand;
