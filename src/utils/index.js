
export const degreesToRads = (degree) => {
  return (degree * Math.PI) / 180;
};

export const getSeed = () => {
  let seed = window.localStorage.getItem("SEED");
  if (!seed) {
    seed = "NEWSEED";
    window.localStorage.setItem("SEED", seed);
  }
  return seed;
}