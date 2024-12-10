import DiceBox from "@3d-dice/dice-box-threejs";

/*  --------------- DICE BOX -------------- */
// Note the dice-box assets in the public folder.
// Those files are all necessary for the web workers to function properly
// create new DiceBox class
const Dice = new DiceBox(
  "#dice-box", // target DOM element to inject the canvas for rendering
  {
    id: "dice-canvas", // canvas element id
    theme_customColorset: {
      background: [
        "#00ffcb",
        "#ff6600",
        "#1d66af",
        "#7028ed",
        "#c4c427",
        "#d81128"
      ]
    },
    iterationLimit: 1e3,
    gravity_multiplier: 400,
    theme_material: "wood"
  }
);

export { Dice };
