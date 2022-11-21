import { alea } from "seedrandom";
import { getSeed } from "./index";

const Rand = {
  generate: new alea(getSeed()),
}

export default Rand;