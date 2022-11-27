const getSavedPlants = () => {
  let saved = window.localStorage.getItem("SAVED_PLANTS");
  if (!saved) {
    saved = [];
    window.localStorage.setItem("SAVED_PLANTS", saved);
    return saved;
  }
  return JSON.parse(saved);
};

const savePlant = (plant) => {
  let saved = window.localStorage.getItem("SAVED_PLANTS");
  if (!saved) {
    saved = [];
  } else {
    saved = JSON.parse(saved);
  }
  saved.push(plant);
  window.localStorage.setItem("SAVED_PLANTS", JSON.stringify(saved));
};

const updateLastAction = () => {
  window.localStorage.setItem(
    "LAST_ACTION",
    JSON.stringify(new Date().toDateString())
  );
};

export { getSavedPlants, updateLastAction, savePlant };
