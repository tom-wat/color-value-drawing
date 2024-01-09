const html = document.getElementsByTagName("html");
const backdrop = document.getElementById("backdrop");
const main = document.getElementById("main");
const tooltip = document.getElementById("tooltip");
const pc = document.getElementsByClassName("pc");
const fileButton = document.getElementById("file-button");
const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const compositeCanvas = document.getElementById("compositeCanvas");
const ctxComposite = compositeCanvas.getContext("2d");
const canvasBase = document.getElementById("canvas-base");
const ctxBase = canvasBase.getContext("2d");
const imageContainer = document.querySelector(".image-container");
const container = document.querySelector(".container");
const format = document.getElementById("format");
const colorsOnlyElement = document.getElementById("colors-only");
const filter = document.getElementById("filter");
const resetElement = document.getElementById("reset");
const colorBlockElement = document.getElementById("color-block");
const colorInfoElement = document.getElementById("color-info");
const colorSpace = document.getElementById("color-space");
const webp = document.getElementById("webp");
const png = document.getElementById("png");
const clear = document.getElementById("clear-btn");
const scale = document.getElementById("scale");
const zoomElement = document.getElementById("zoom");
const zoomOutput = document.getElementById("zoom-output");
const zoomAdd = document.getElementById("zoom-add");
const zoomSubtract = document.getElementById("zoom-subtract");
const fontInput = document.getElementById("font-size-input");
const fontOutput = document.getElementById("font-size-output");
const fontSizeAdd = document.getElementById("font-size-add");
const fontSizeSubtract = document.getElementById("font-size-subtract");
const columnNumber = document.getElementById("column-number");
const columnNumberOutput = document.getElementById("column-number-output");
const columnAdd = document.getElementById("column-add");
const columnSubtract = document.getElementById("column-subtract");
const downloadBtn = document.getElementById("download-btn");
const menu = document.getElementById("menu");
const openButton = document.getElementById("open-button");
const closeButton = document.getElementById("close-button");
const positionX = document.getElementById("position-x");
const positionY = document.getElementById("position-y");
const offsetX = document.getElementById("offset-x");
const offsetXOutput = document.getElementById("offset-x-output");
const offsetXAdd = document.getElementById("offset-x-add");
const offsetXSubtract = document.getElementById("offset-x-subtract");
const offsetYAdd = document.getElementById("offset-y-add");
const offsetYSubtract = document.getElementById("offset-y-subtract");
const offsetY = document.getElementById("offset-y");
const offsetYOutput = document.getElementById("offset-y-output");
const clickPointAdjustmentX = -2;
const clickPointAdjustmentY = -2;
const scaleFull = document.getElementById("scale-full");
const scaleHalf = document.getElementById("scale-half");
const scaleQuarter = document.getElementById("scale-quarter");
const scaleWindow = document.getElementById("scale-window");
const pointer = document.getElementById("pointer");
const pan = document.getElementById("pan");
const isMobile = navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry)/);
const isTablet = navigator.userAgent.match(
  /iPad|Android.*Tablet|Kindle|Playbook/
);
// const undoStatesLimitNumber = 50;
let rgb;
let hex;
let hsl;
let hsv;
let xyz;
let xyzD50;
let lab;
let lch;
let oklab;
let oklch;
let rgb2;
let hex2;
let hsl2;
let hsv2;
let xyz2;
let xyzD502;
let lab2;
let lch2;
let oklab2;
let oklch2;
let colorCode;
let isInitialValue = true;
let isInitialValue2 = true;
let image;
let undoStates = [];
let redoStates = [];
let initialState;
let currentStates;
let pointerX = 0;
let pointerY = 0;
let scaleValue = 1;
let startDragOffset = {};
let dragX = 0;
let dragY = 0;
let colors = [];

function setStyles() {
  const settingScale = localStorage.getItem("scale");
  const settingFormat = localStorage.getItem("format");
  const settingFilter = localStorage.getItem("filter");
  const settingColorSpace = localStorage.getItem("color-space");
  const settingPositionX = localStorage.getItem("position-x");
  const settingPositionY = localStorage.getItem("position-y");
  const settingOffsetX = localStorage.getItem("offsetX");
  const settingOffsetY = localStorage.getItem("offsetY");
  const settingFontSize = localStorage.getItem("fontSize");
  const settingColumn = localStorage.getItem("column");
  const settingPointer = localStorage.getItem("pointer");
  const settingPan = localStorage.getItem("pan");
  const settingColorsOnly = localStorage.getItem("colors-only");

  setValueToSelected(scale, settingScale);
  setValueToSelected(format, settingFormat);
  setValueToSelected(filter, settingFilter);
  setValueToSelected(colorSpace, settingColorSpace);
  changeColorSpaceForMenu(settingColorSpace);
  changeColorSpaceForTooltip(settingColorSpace);
  setValueToSelected(positionX, settingPositionX);
  setValueToSelected(positionY, settingPositionY);
  setValue(offsetX, settingOffsetX, offsetXOutput);
  setValue(offsetY, settingOffsetY, offsetYOutput);
  setValue(fontInput, settingFontSize, fontOutput);
  changeFontSize(ctx, fontInput.value);
  setValue(columnNumber, settingColumn, columnNumberOutput);
  setValueToChecked(pointer, settingPointer);
  setValueToChecked(pan, settingPan);
  setValueToChecked(colorsOnlyElement, settingColorsOnly);
}
function setValue(element, value, output) {
  if (!value) return;
  element.value = value;
  updateOutput(element, output);
}
function setValueToChecked(element, value) {
  if (value === null) return;
  if (value === "false") {
    element.checked = false;
    return;
  }
  element.checked = true;
}
function setValueToSelected(element, value) {
  if (!value) return;
  for (const option of element.options) {
    if (option.value === value) {
      option.selected = true;
      return;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tabbableElements = document.querySelectorAll("[data-tabindex]");

  tabbableElements.forEach(function (element, index) {
    element.setAttribute("tabindex", index + 1);
  });
  if (!!isMobile === true) {
    menu.classList.toggle("close");
    openButton.classList.toggle("close");
    closeButton.classList.toggle("close");
    main.classList.toggle("close");
    imageContainer.classList.toggle("close");
    Array.from(pc).forEach((element) => (element.style.display = "none"));
    canvas.addEventListener("mousedown", storeColor);
  }
  changeColorSpaceForTooltip(colorSpace.selectedOptions[0].value);
  setStyles();
  filterCanvas();
  if (!!isMobile === false && !!isTablet === false) {
    if (pan.checked === true) {
      canvas.addEventListener("mousedown", panMode);
      html[0].style.cursor = "grab";
    } else {
      canvas.addEventListener("mousemove", throttledGetColor);
      document.addEventListener("mousemove", showTooltip);
      canvas.addEventListener("mousedown", storeColor);
    }
  }
  backdrop.style.display = "none";
});

const openFile = (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.error("No file selected.");
    return;
  }
  main.style.display = "none";
  const reader = new FileReader();
  reader.onload = function () {
    image = new Image();
    image.src = reader.result;
    image.onload = function () {
      switch (scale.selectedOptions[0].value) {
        case "full":
          dividedDrawImage(1);
          break;
        case "half":
          dividedDrawImage(2);
          break;
        case "quarter":
          dividedDrawImage(4);
          break;
        default:
          adjustedDrawImage();
      }
      imageContainer.style.display = "block";
      changeFontSize(ctx, fontInput.value);
      initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      colors = [];
      undoStates = [];
      redoStates = [];
      dragX = 0;
      dragY = 0;
      scaleValue = 1;
      zoomElement.value = String(100);
      updateOutput(zoomElement, zoomOutput);
    };
  };

  reader.readAsDataURL(file);
};

fileInput.addEventListener("change", openFile);

function dividedDrawImage(divisor) {
  canvas.width = image.width / divisor;
  canvas.height = image.height / divisor;
  canvasBase.width = image.width / divisor;
  canvasBase.height = image.height / divisor;
  compositeCanvas.width = image.width / divisor;
  compositeCanvas.height = image.height / divisor;
  imageContainer.style.width = `${image.width / divisor}px`;
  imageContainer.style.height = `${image.height / divisor}px`;
  ctxBase.drawImage(image, 0, 0, canvas.width, canvas.height);
}

//ウインドウの幅にキャンバスを合わせる
function adjustedDrawImage() {
  const canvasWidth = Math.min(
    parseInt(window.getComputedStyle(container).width),
    image.width
  );
  canvas.width = canvasWidth;
  canvas.height = image.height * (canvasWidth / image.width);
  canvasBase.width = canvasWidth;
  canvasBase.height = image.height * (canvasWidth / image.width);
  compositeCanvas.width = canvasWidth;
  compositeCanvas.height = image.height * (canvasWidth / image.width);
  imageContainer.style.width = `${canvasWidth}px`;
  imageContainer.style.height = `${
    image.height * (canvasWidth / image.width)
  }px`;
  ctxBase.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function rgbToHex(r, g, b) {
  // Ensure the input values are within the valid range (0-255)
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  // Convert each RGB component to hexadecimal and concatenate them
  const hexR = r.toString(16).padStart(2, "0");
  const hexG = g.toString(16).padStart(2, "0");
  const hexB = b.toString(16).padStart(2, "0");

  // Combine the hexadecimal values to form the final color
  const hexColor = `#${hexR}${hexG}${hexB}`;

  return hexColor;
}

function rgbToHsl(r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}

function rgbToHsv(r, g, b) {
  // Normalize RGB values to be in the range [0, 1]
  r = r / 255;
  g = g / 255;
  b = b / 255;

  let hsvMax = Math.max(r, g, b);
  let hsvMin = Math.min(r, g, b);
  let hsvH,
    hsvS,
    hsvB = hsvMax;

  let delta = hsvMax - hsvMin;

  // Calculate Hue
  if (hsvMax === hsvMin) {
    hsvH = 0; // Achromatic (gray)
  } else {
    if (hsvMax === r) {
      hsvH = ((g - b) / delta) % 6;
    } else if (hsvMax === g) {
      hsvH = (b - r) / delta + 2;
    } else {
      hsvH = (r - g) / delta + 4;
    }
    hsvH = Math.round(hsvH * 60);
    if (hsvH < 0) {
      hsvH += 360;
    }
  }

  // Calculate Saturation
  if (hsvMax === 0) {
    hsvS = 0;
  } else {
    hsvS = Math.round((delta / hsvMax) * 100);
  }

  // Calculate Brightness
  hsvB = Math.round(hsvB * 100);

  return { hsvH, hsvS, hsvB };
}

// Function to convert RGB to XYZ (D65)
function rgbToXyzD65(r, g, b) {
  // Normalize the RGB values
  const rLinear = r / 255;
  const gLinear = g / 255;
  const bLinear = b / 255;

  // Apply gamma correction to the RGB values
  const rGamma =
    rLinear <= 0.04045
      ? rLinear / 12.92
      : Math.pow((rLinear + 0.055) / 1.055, 2.4);
  const gGamma =
    gLinear <= 0.04045
      ? gLinear / 12.92
      : Math.pow((gLinear + 0.055) / 1.055, 2.4);
  const bGamma =
    bLinear <= 0.04045
      ? bLinear / 12.92
      : Math.pow((bLinear + 0.055) / 1.055, 2.4);

  // Convert RGB to XYZ (D65)
  const x = rGamma * 0.4124564 + gGamma * 0.3575761 + bGamma * 0.1804375;
  const y = rGamma * 0.2126729 + gGamma * 0.7151522 + bGamma * 0.072175;
  const z = rGamma * 0.0193339 + gGamma * 0.119192 + bGamma * 0.9503041;

  return [x, y, z];
}

// Function to perform Bradford transformation from D65 to D50
function bradfordTransformationD65toD50(xyzD65) {
  const bradfordMatrix = [
    [1.0478112, 0.0228866, -0.050127],
    [0.0295424, 0.9904844, -0.0170491],
    [-0.0092345, 0.0150436, 0.7521316],
  ];

  const xD50 =
    bradfordMatrix[0][0] * xyzD65[0] +
    bradfordMatrix[0][1] * xyzD65[1] +
    bradfordMatrix[0][2] * xyzD65[2];
  const yD50 =
    bradfordMatrix[1][0] * xyzD65[0] +
    bradfordMatrix[1][1] * xyzD65[1] +
    bradfordMatrix[1][2] * xyzD65[2];
  const zD50 =
    bradfordMatrix[2][0] * xyzD65[0] +
    bradfordMatrix[2][1] * xyzD65[1] +
    bradfordMatrix[2][2] * xyzD65[2];

  return [xD50, yD50, zD50];
}

function xyzToLab(x, y, z) {
  // Convert XYZ to CIELAB
  const labX = x * 100;
  const labY = y * 100;
  const labZ = z * 100;

  // D50
  const refX = 96.4212;
  const refY = 100.0;
  const refZ = 82.5188;

  let xRatio = labX / refX;
  let yRatio = labY / refY;
  let zRatio = labZ / refZ;

  if (xRatio > 0.008856) {
    xRatio = Math.pow(xRatio, 1 / 3);
  } else {
    xRatio = (903.3 * xRatio + 16) / 116;
  }

  if (yRatio > 0.008856) {
    yRatio = Math.pow(yRatio, 1 / 3);
  } else {
    yRatio = (903.3 * yRatio + 16) / 116;
  }

  if (zRatio > 0.008856) {
    zRatio = Math.pow(zRatio, 1 / 3);
  } else {
    zRatio = (903.3 * zRatio + 16) / 116;
  }

  const labL = Math.round(116 * yRatio - 16);
  const labA = Math.round(500 * (xRatio - yRatio));
  const labB = Math.round(200 * (yRatio - zRatio));

  return { labL, labA, labB };
}

function rgb2oklab(r, g, b) {
  // Normalize the RGB values
  let rLinear = r / 255;
  let gLinear = g / 255;
  let bLinear = b / 255;

  // Apply gamma correction to the RGB values
  rLinear =
    rLinear <= 0.04045
      ? rLinear / 12.92
      : Math.pow((rLinear + 0.055) / 1.055, 2.4);
  gLinear =
    gLinear <= 0.04045
      ? gLinear / 12.92
      : Math.pow((gLinear + 0.055) / 1.055, 2.4);
  bLinear =
    bLinear <= 0.04045
      ? bLinear / 12.92
      : Math.pow((bLinear + 0.055) / 1.055, 2.4);

  const l =
    0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear;
  const m =
    0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear;
  const s =
    0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  let oklabL = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  let oklabA = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  let oklabB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  oklabL *= 100;
  let oklabLRounded = Math.round(oklabL);
  let oklabARounded = Math.round(oklabA * 100) / 100;
  let oklabBRounded = Math.round(oklabB * 100) / 100;

  return {
    oklabL,
    oklabA,
    oklabB,
    oklabLRounded,
    oklabARounded,
    oklabBRounded,
  };
}

function labToLch(L, a, b) {
  // Calculate the chroma (C)
  let chroma = Math.sqrt(a * a + b * b);

  // Calculate the hue (H) in degrees
  let hue = Math.atan2(b, a) * (180 / Math.PI);

  // Ensure the hue is in the range [0, 360]
  if (hue < 0) {
    hue += 360;
  }

  // Calculate the lightness (L), and round it to 2 decimal places
  L = Math.round(L);

  // Calculate the chroma (C), and round it to 2 decimal places
  chroma = Math.round(chroma);

  // Calculate the hue (H), and round it to 2 decimal places
  hue = Math.round(hue);

  return { lchL: L, lchC: chroma, lchH: hue };
}

function oklab2okLch(L, a, b) {
  let luminance = Math.round(L);
  let chroma = Math.sqrt(a * a + b * b);
  chroma = Math.round(chroma * 1000) / 1000;
  let hue = Math.atan2(b, a) * (180 / Math.PI);

  if (hue < 0) {
    hue += 360;
  }

  hue = Math.round(hue);

  return { oklchL: luminance, oklchC: chroma, oklchH: hue };
}

function hslToRgb(h, s, l) {
  // H, S, L values are expected to be in the range [0, 1]
  // Convert HSL to RGB
  let toRgbH = h / 360;
  let toRgbS = s / 100;
  let toRgbL = l / 100;
  let toRgbR, toRgbG, toRgbB;

  if (toRgbS === 0) {
    toRgbR = toRgbG = toRgbB = toRgbL; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q =
      toRgbL < 0.5 ? toRgbL * (1 + toRgbS) : toRgbL + toRgbS - toRgbL * toRgbS;
    const p = 2 * toRgbL - q;

    toRgbR = hue2rgb(p, q, toRgbH + 1 / 3);
    toRgbG = hue2rgb(p, q, toRgbH);
    toRgbB = hue2rgb(p, q, toRgbH - 1 / 3);
  }

  // Scale the RGB values to the range [0, 255] and round them
  return [
    Math.round(toRgbR * 255),
    Math.round(toRgbG * 255),
    Math.round(toRgbB * 255),
  ];
}

// function to undo
function undo() {
  if (undoStates.length === 0) {
    return;
  }
  redoStates.push(undoStates.pop());
  // console.log(undoStates);
  if (undoStates.length > 0) {
    const undoStatesCopy = structuredClone(undoStates[undoStates.length - 1]);
    colors = undoStatesCopy;
  } else {
    colors = [];
  }
  drawImage();
}
function redo() {
  if (redoStates.length > 0) {
    undoStates.push(redoStates.pop());
    // console.log(undoStates);
    // console.log(redoStates);
    // console.log(colors);
    const undoStatesCopy = structuredClone(undoStates[undoStates.length - 1]);
    colors = undoStatesCopy;
    drawImage();
  }
}
function updateUndoStates() {
  const colorsCopy = structuredClone(colors);
  undoStates.push(colorsCopy);
}

function clearCanvas() {
  if (!initialState) return;
  if (initialState === undoStates[0]) return;
  colors = [];
  updateUndoStates();
  redoStates = [];
  drawImage();
}

async function copyToClipboard() {
  if (isInitialValue) {
    return;
  }
  try {
    await navigator.clipboard.writeText(colorCode);
  } catch (err) {
    console.error("Failed to copy color values.", err);
  }
}

function drawRoundedRectangle(
  ctx,
  x,
  y,
  width,
  height,
  cornerRadius,
  isStroke
) {
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.lineTo(x + width - cornerRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
  ctx.lineTo(x + width, y + height - cornerRadius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - cornerRadius,
    y + height
  );
  ctx.lineTo(x + cornerRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
  ctx.lineTo(x, y + cornerRadius);
  ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
  ctx.closePath();
  if (isStroke) {
    ctx.stroke();
  } else {
    ctx.fill();
  }
}

function drawMultilineText(
  context,
  colorText,
  pointX,
  pointY,
  textPositionX,
  textPositionY,
  fontSize,
  offsetX,
  offsetY,
  columnNumber,
  colorList,
  colorSpaceValue,
  pointerChecked
) {
  const colorElements = colorText.split(" ");
  const padding = fontSize / 4;
  const margin = fontSize / 3;
  let drawingPositionX = 0;
  let drawingPositionY = 0;
  let xOffset = 0;
  let yOffset = 0;
  let maxWidth = 0;
  changeFontSize(ctx, fontSize);

  for (let i = 0; i < colorElements.length; i++) {
    const row = colorElements.slice(i * columnNumber, (i + 1) * columnNumber);
    let rowWidth = row.reduce(
      (acc, str) => acc + context.measureText(str).width + padding * 2 + margin,
      0
    );
    rowWidth -= margin;
    maxWidth = Math.max(maxWidth, rowWidth);
    if ((i + 2) * columnNumber > colorElements.length) {
      break;
    }
  }

  for (let i = 0; i < colorElements.length; i++) {
    const colorElement = colorElements[i];
    const textWidth = context.measureText(colorElement).width;
    const offsetXValue = [0, 1, 2, 3, 4];
    const offsetYValue = [0, 0.5, 1, 1.5, 2];
    const cardWidth = textWidth + padding * 2;
    const cardHeight = fontSize + padding * 2;
    const offSetXWidth = fontSize * columnNumber;
    let xOffsetAdjustment = fontSize / 2;
    let yOffsetAdjustment = fontSize / 2;
    let colorSet;

    if (pointerChecked === false) {
      xOffsetAdjustment = 0;
      yOffsetAdjustment = 0;
    }

    switch (colorSpaceValue) {
      case "hsl+l":
        colorSet = [
          [colorList.hsl.h, colorList.hsl.h, colorList.hsl.h, 0],
          [100, colorList.hsl.s, colorList.hsl.s, 0],
          [50, 50, colorList.hsl.l, colorList.lab.labL],
        ];
        context.fillStyle = `hsl(${colorSet[0][i]} ${colorSet[1][i]}% ${colorSet[2][i]}%)`;
        break;
      case "l":
        context.fillStyle = `lab(${colorList.lab.labL}% 0 0)`;
        break;
      default:
        context.fillStyle = `rgb(${colorList.rgb[0]} ${colorList.rgb[1]} ${colorList.rgb[2]})`;
        break;
    }

    if (textPositionX === "left") {
      xOffset =
        -xOffsetAdjustment - maxWidth - offSetXWidth * offsetXValue[offsetX];
    } else if (textPositionX === "middle") {
      xOffset = -maxWidth / 2;
    } else {
      xOffset = xOffsetAdjustment + offSetXWidth * offsetXValue[offsetX];
    }
    if (textPositionY === "top") {
      yOffset =
        -yOffsetAdjustment -
        (cardHeight + margin) * Math.ceil(colorElements.length / columnNumber) +
        margin -
        (cardHeight + margin) *
          Math.ceil(colorElements.length / columnNumber) *
          offsetYValue[offsetY];
    } else if (textPositionY === "middle") {
      yOffset =
        (-(cardHeight + margin) *
          Math.ceil(colorElements.length / columnNumber) +
          margin) /
        2;
    } else {
      yOffset =
        yOffsetAdjustment +
        (cardHeight + margin) *
          Math.ceil(colorElements.length / columnNumber) *
          offsetYValue[offsetY];
    }

    drawRoundedRectangle(
      context,
      pointX + drawingPositionX + xOffset,
      pointY + drawingPositionY + yOffset,
      cardWidth,
      cardHeight,
      padding,
      false
    );

    switch (colorSpaceValue) {
      case "hsl+l":
        if (i === 0) {
          const baseColorRgb = hslToRgb(colorList.hsl.h, 100, 50);
          const contrastColor =
            getGreyScaleColorWithHighestContrast(baseColorRgb);
          context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
          break;
        }
        if (i === 1) {
          const baseColorRgb = hslToRgb(colorList.hsl.h, colorList.hsl.s, 50);
          const contrastColor =
            getGreyScaleColorWithHighestContrast(baseColorRgb);
          context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
          break;
        }
        if (i === 2) {
          const contrastColor = getGreyScaleColorWithHighestContrast(
            colorList.rgb
          );
          context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
          break;
        }
        if (i === 3) {
          const contrastColor = getGreyScaleColorWithHighestContrast(
            colorList.rgb
          );
          context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
          break;
        }
      default:
        const contrastColor = getGreyScaleColorWithHighestContrast(
          colorList.rgb
        );
        context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
        break;
    }

    context.fillText(
      colorElement,
      pointX + drawingPositionX + xOffset + padding,
      pointY + drawingPositionY + yOffset + fontSize + fontSize / 12
    );

    if ((i + 1) % columnNumber === 0) {
      drawingPositionY += cardHeight + margin;
      drawingPositionX = 0;
    } else {
      drawingPositionX += cardWidth + margin;
    }
  }
}

function positionTooltip(x, y) {
  // ツールチップを表示する位置を設定
  tooltip.style.left = x + 0 + "px";
  tooltip.style.top = y + 12 + "px";
  if (positionX.selectedOptions[0].value === "left") {
    // Get the computed styles for the element
    const computedStyles = window.getComputedStyle(tooltip);
    // Get the computed width
    let computedWidth = computedStyles.width;
    if (computedWidth === "auto") {
      switch (colorSpace.selectedOptions[0].value) {
        case "rgb":
          computedWidth = "86.4688";
          break;
        case "hex":
          computedWidth = "52.9922";
          break;
        case "hsv":
          computedWidth = "86.1719";
          break;
        case "hsl":
          computedWidth = "85.2891";
          break;
        case "lab":
          computedWidth = "83";
          break;
        case "lch":
          computedWidth = "86.3906";
          break;
        case "oklab":
          computedWidth = "79.2188";
          break;
        case "oklch":
          computedWidth = "78.9141";
          break;
        case "hsl+l":
          computedWidth = "102.992";
          break;
        case "l":
          computedWidth = "33.2812";
          break;
        case "hs":
          computedWidth = "60.828";
          break;
        default:
          break;
      }
    }
    // console.log(computedWidth);
    const computedWidthInNumber = parseFloat(computedWidth);
    tooltip.style.left = x - computedWidthInNumber + "px";
    if (positionY.selectedOptions[0].value === "middle") {
      tooltip.style.top = y - 10 + "px";
      tooltip.style.left = x - computedWidthInNumber - 10 + "px";
      return;
    }
  } else if (positionX.selectedOptions[0].value === "middle") {
    // Get the computed styles for the element
    const computedStyles = window.getComputedStyle(tooltip);
    // Get the computed width
    let computedWidth = computedStyles.width;
    if (computedWidth === "auto") {
      switch (colorSpace.selectedOptions[0].value) {
        case "rgb":
          computedWidth = "86.4688";
          break;
        case "hex":
          computedWidth = "52.9922";
          break;
        case "hsv":
          computedWidth = "86.1719";
          break;
        case "hsl":
          computedWidth = "85.2891";
          break;
        case "lab":
          computedWidth = "83";
          break;
        case "lch":
          computedWidth = "86.3906";
          break;
        case "oklab":
          computedWidth = "79.2188";
          break;
        case "oklch":
          computedWidth = "78.9141";
          break;
        case "hsl+l":
          computedWidth = "102.992";
          break;
        case "l":
          computedWidth = "33.2812";
          break;
        case "hs":
          computedWidth = "60.828";
          break;
        default:
          break;
      }
    }
    // console.log(computedWidth);
    const computedWidthInNumber = parseFloat(computedWidth) / 2;

    tooltip.style.left = x - computedWidthInNumber + "px";
    if (positionY.selectedOptions[0].value === "middle") {
      tooltip.style.top = `${y - 33 / 2 + 8.5 + 12}px`;
      return;
    }
  }
  if (positionY.selectedOptions[0].value === "top") {
    tooltip.style.top = y - 33 + "px";
  } else if (positionY.selectedOptions[0].value === "middle") {
    tooltip.style.top = `${y - 33 / 2 + 8.5}px`;
  }
  if (
    positionY.selectedOptions[0].value === "middle" &&
    positionX.selectedOptions[0].value === "right"
  ) {
    tooltip.style.top = y - 10 + "px";
    tooltip.style.left = x + 10 + "px";
  }
}

function showTooltip(event) {
  // ページのスクロール量を取得
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  const scrollLeft =
    document.documentElement.scrollLeft || document.body.scrollLeft;

  // マウスポインタの位置を取得
  const x = event.clientX + scrollLeft;
  const y = event.clientY + scrollTop;
  pointerX = x;
  pointerY = y;

  // ツールチップの位置を設定
  positionTooltip(x, y);

  // ツールチップを表示する
  tooltip.style.display = "block";
}

function changeColorSpaceForTooltip(ColorSpaceValue) {
  switch (ColorSpaceValue) {
    case "rgb":
      if (isInitialValue2) {
        tooltip.textContent = `R:-- G:-- B:--`;
        break;
      }
      tooltip.textContent = `R:${rgb2[0]} G:${rgb2[1]} B:${rgb2[2]}`;
      break;
    case "hex":
      if (isInitialValue2) {
        tooltip.textContent = `#------`;
        break;
      }
      2;
      tooltip.textContent = hex2;
      break;
    case "hsv":
      if (isInitialValue2) {
        tooltip.textContent = `H:-- S:-- V:--`;
        break;
      }
      tooltip.textContent = `H:${hsv2.hsvH} S:${hsv2.hsvS} V:${hsv2.hsvB}`;
      break;
    case "hsl":
      if (isInitialValue2) {
        tooltip.textContent = `H:-- S:-- L:--`;
        break;
      }
      tooltip.textContent = `H:${hsl2.h} S:${hsl2.s} L:${hsl2.l}`;
      break;
    case "lab":
      if (isInitialValue2) {
        tooltip.textContent = `L:-- a:-- b:--`;
        break;
      }
      tooltip.textContent = `L:${lab2.labL} a:${lab2.labA} b:${lab2.labB}`;
      tooltip.style.setProperty(
        "--background-color",
        `lab(${lab2.labL}% ${lab2.labA} ${lab2.labB})`
      );
      break;
    case "lch":
      if (isInitialValue2) {
        tooltip.textContent = `L:-- C:-- H:--`;
        break;
      }
      tooltip.textContent = `L:${lch2.lchL} C:${lch2.lchC} H:${lch2.lchH}`;
      break;
    case "oklab":
      if (isInitialValue2) {
        tooltip.textContent = `l:-- a:-- b:--`;
        break;
      }
      tooltip.textContent = `l:${oklab2.oklabLRounded} a:${oklab2.oklabARounded} b:${oklab2.oklabBRounded}`;
      break;
    case "oklch":
      if (isInitialValue2) {
        tooltip.textContent = `l:-- c:-- h:--`;
        break;
      }
      tooltip.textContent = `l:${oklch2.oklchL} c:${oklch2.oklchC} h:${oklch2.oklchH}`;
      break;
    case "hsl+l":
      if (isInitialValue2) {
        tooltip.textContent = `h:-- s:-- l:-- L:--`;
        break;
      }
      tooltip.textContent = `h:${hsl2.h} s:${hsl2.s} l:${hsl2.l} L:${lab2.labL}`;
      break;
    case "l":
      if (isInitialValue2) {
        tooltip.textContent = `L:--`;
        break;
      }
      tooltip.textContent = `L:${lab2.labL}`;
      tooltip.style.setProperty("--background-color", `lab(${lab2.labL}% 0 0)`);
      break;
    case "hs":
      if (isInitialValue2) {
        tooltip.textContent = `H:-- S:--`;
        break;
      }
      tooltip.textContent = `H:${hsl2.h} S:${hsl2.s}`;
      break;
    default:
      break;
  }
}

function changeColorSpaceForMenu(ColorSpaceValue) {
  switch (ColorSpaceValue) {
    case "rgb":
      if (isInitialValue) {
        colorInfoElement.textContent = `R:-- G:-- B:--`;
        break;
      }
      colorCode = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
      colorInfoElement.textContent = `R:${rgb[0]} G:${rgb[1]} B:${rgb[2]}`;
      break;
    case "hex":
      if (isInitialValue) {
        colorInfoElement.textContent = `#------`;
        break;
      }
      colorCode = hex;
      colorInfoElement.textContent = hex;
      break;
    case "hsv":
      if (isInitialValue) {
        colorInfoElement.textContent = `H:-- S:-- V:--`;
        break;
      }
      colorCode = `h:${hsv.hsvH} s:${hsv.hsvS} v:${hsv.hsvB}`;
      colorInfoElement.textContent = `H:${hsv.hsvH} S:${hsv.hsvS} V:${hsv.hsvB}`;
      break;
    case "hsl":
      if (isInitialValue) {
        colorInfoElement.textContent = `H:-- S:-- L:--`;
        break;
      }
      colorCode = `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
      colorInfoElement.textContent = `H:${hsl.h} S:${hsl.s} L:${hsl.l}`;
      break;
    case "lab":
      if (isInitialValue) {
        colorInfoElement.textContent = `L:-- a:-- b:--`;
        break;
      }
      colorCode = `lab(${lab.labL}% ${lab.labA} ${lab.labB})`;
      colorInfoElement.textContent = `L:${lab.labL} a:${lab.labA} b:${lab.labB}`;
      colorInfoElement.style.setProperty(
        "--background-color",
        `lab(${lab.labL}% ${lab.labA} ${lab.labB})`
      );
      break;
    case "lch":
      if (isInitialValue) {
        colorInfoElement.textContent = `L:-- C:-- H:--`;
        break;
      }
      colorCode = `lch(${lch.lchL}% ${lch.lchC} ${lch.lchH})`;
      colorInfoElement.textContent = `L:${lch.lchL} C:${lch.lchC} H:${lch.lchH}`;
      break;
    case "oklab":
      if (isInitialValue) {
        colorInfoElement.textContent = `l:-- a:-- b:--`;
        break;
      }
      colorCode = `oklab(${oklab.oklabLRounded}% ${oklab.oklabARounded} ${oklab.oklabBRounded})`;
      colorInfoElement.textContent = `l:${oklab.oklabLRounded} a:${oklab.oklabARounded} b:${oklab.oklabBRounded}`;
      break;
    case "oklch":
      if (isInitialValue) {
        colorInfoElement.textContent = `l:-- c:-- h:--`;
        break;
      }
      colorCode = `oklch(${oklch.oklchL}% ${oklch.oklchC} ${oklch.oklchH})`;
      colorInfoElement.textContent = `l:${oklch.oklchL} c:${oklch.oklchC} h:${oklch.oklchH}`;
      break;
    case "hsl+l":
      if (isInitialValue) {
        colorInfoElement.textContent = `h:-- s:-- l:-- L:--`;
        break;
      }
      colorCode = `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
      colorInfoElement.textContent = `h:${hsl.h} s:${hsl.s} l:${hsl.l} L:${lab.labL}`;
      break;
    case "l":
      if (isInitialValue) {
        colorInfoElement.textContent = `L:--`;
        break;
      }
      colorCode = `lab(${lab.labL}% 0 0)`;
      colorInfoElement.textContent = `L:${lab.labL}`;
      colorBlockElement.style.setProperty(
        "background-color",
        `lab(${lab.labL}% 0 0)`
      );
      break;
    case "hs":
      if (isInitialValue) {
        colorInfoElement.textContent = `H:-- S:--`;
        break;
      }
      colorCode = `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
      colorInfoElement.textContent = `H:${hsl.h} S:${hsl.s}`;
      break;
    default:
      break;
  }
}

function getColor(event) {
  const x = event.offsetX + clickPointAdjustmentX;
  const y = event.offsetY + clickPointAdjustmentY;
  const color = ctxBase.getImageData(x, y, 1, 1).data;
  rgb = [color[0], color[1], color[2]];
  hex = rgbToHex(color[0], color[1], color[2]);
  hsl = rgbToHsl(color[0], color[1], color[2]);
  hsv = rgbToHsv(color[0], color[1], color[2]);
  xyz = rgbToXyzD65(color[0], color[1], color[2]);
  xyzD50 = bradfordTransformationD65toD50(xyz);
  lab = xyzToLab(xyzD50[0], xyzD50[1], xyzD50[2]);
  lch = labToLch(lab.labL, lab.labA, lab.labB);
  oklab = rgb2oklab(color[0], color[1], color[2]);
  oklch = oklab2okLch(oklab.oklabL, oklab.oklabA, oklab.oklabB);
  const colorList = {
    rgb: rgb,
    hex: hex,
    hsv: hsv,
    hsl: hsl,
    lab: lab,
    lch: lch,
    oklab: oklab,
    oklch: oklch,
  };
  return colorList;
}

function getColorForTooltip(event) {
  const x = event.offsetX + clickPointAdjustmentX;
  const y = event.offsetY + clickPointAdjustmentY;
  const color = ctxBase.getImageData(x, y, 1, 1).data;
  rgb2 = [color[0], color[1], color[2]];
  hex2 = rgbToHex(color[0], color[1], color[2]);
  hsl2 = rgbToHsl(color[0], color[1], color[2]);
  hsv2 = rgbToHsv(color[0], color[1], color[2]);
  xyz2 = rgbToXyzD65(color[0], color[1], color[2]);
  xyzD502 = bradfordTransformationD65toD50(xyz2);
  lab2 = xyzToLab(xyzD502[0], xyzD502[1], xyzD502[2]);
  lch2 = labToLch(lab2.labL, lab2.labA, lab2.labB);
  oklab2 = rgb2oklab(color[0], color[1], color[2]);
  oklch2 = oklab2okLch(oklab2.oklabL, oklab2.oklabA, oklab2.oklabB);
}

function throttle(fn, wait) {
  let lastTime = 0;

  return function (event, ...args) {
    const now = Date.now();

    if (now - lastTime >= wait) {
      lastTime = now;
      return fn.apply(this, [event, ...args]);
    }
  };
}

function setTooltipView() {
  tooltip.style.setProperty(
    "--background-color",
    `rgb(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]})`
  );
  const contrastColor = getGreyScaleColorWithHighestContrast(rgb2);
  tooltip.style.setProperty(
    "--color",
    `rgb(${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`
  );
}

const throttledGetColor = throttle(function (event) {
  getColorForTooltip(event);
  setTooltipView();
  isInitialValue2 = false;
  changeColorSpaceForTooltip(colorSpace.selectedOptions[0].value);
}, 50);

function storeColor(event) {
  const colorList = getColor(event);
  colorBlockElement.style.setProperty(
    "background-color",
    `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  );
  isInitialValue = false;
  const colorSpaceValue = colorSpace.selectedOptions[0].value;
  changeColorSpaceForMenu(colorSpaceValue);
  const pointX = (event.offsetX - dragX) / scaleValue;
  const pointY = (event.offsetY - dragY) / scaleValue;
  const colorText = `${colorInfoElement.textContent}`;
  const fontSize = parseInt(fontInput.value);
  const offsetXValue = parseInt(offsetX.value);
  const offsetYValue = parseInt(offsetY.value);
  const textPositionX = positionX.selectedOptions[0].value;
  const textPositionY = positionY.selectedOptions[0].value;
  const columnNumberValue = parseInt(columnNumber.value);
  const pointerChecked = pointer.checked;
  colors.push({
    colorList,
    colorText,
    colorSpaceValue,
    pointX,
    pointY,
    fontSize,
    offsetXValue,
    offsetYValue,
    textPositionX,
    textPositionY,
    columnNumberValue,
    pointerChecked,
  });
  // console.log("colors", colors);
  updateUndoStates();
  redoStates = [];
  // console.log("undoStates", undoStates);

  // if (undoStates.length > undoStatesLimitNumber) {
  //   undoStates.length = undoStatesLimitNumber;
  // }
  drawImage();
}

function drawingColor() {
  if (colors.length === false) return;
  colors.forEach((color) => {
    drawMultilineText(
      ctx,
      color.colorText,
      color.pointX,
      color.pointY,
      color.textPositionX,
      color.textPositionY,
      color.fontSize,
      color.offsetXValue,
      color.offsetYValue,
      color.columnNumberValue,
      color.colorList,
      color.colorSpaceValue,
      color.pointerChecked
    );

    ctx.fillStyle = `hsl( 0, 0%, 100%)`;
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = `hsl( 0, 0%, 0%)`;

    if (color.pointerChecked === true) {
      drawingPointer(color.pointX, color.pointY);
    }
  });
}

function drawingPointer(pointX, pointY) {
  if (lab.labL > 85) {
    ctx.beginPath();
    ctx.moveTo(pointX - 7.5, pointY + clickPointAdjustmentY + 3);
    ctx.lineTo(pointX - 2.5, pointY + clickPointAdjustmentY + 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pointX + 1.5, pointY + clickPointAdjustmentY + 3);
    ctx.lineTo(pointX + 7, pointY + clickPointAdjustmentY + 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pointX + clickPointAdjustmentX, pointY - 2.5);
    ctx.lineTo(pointX + clickPointAdjustmentX + 3.5, pointY - 2.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pointX + clickPointAdjustmentX, pointY + 6.5);
    ctx.lineTo(pointX + clickPointAdjustmentX + 3.5, pointY + 6.5);
    ctx.stroke();
  }

  ctx.fillRect(pointX - 7.5, pointY + clickPointAdjustmentY, 5, 3);
  ctx.fillRect(pointX + 1.5, pointY + clickPointAdjustmentY, 5.2, 3);
  ctx.fillRect(pointX + clickPointAdjustmentX, pointY - 7.5, 3.5, 5);
  ctx.fillRect(pointX + clickPointAdjustmentX, pointY + 1.5, 3.5, 5);
}

/// keyboard shortcuts ///
// Add event listeners to track the state of each key
document.addEventListener("keydown", (event) => {
  if (event.key === "r") {
    if (keyMeta) return;

    fileInput.click();
  }
  if (event.key === "s") {
    fontInput.value = (parseInt(fontInput.value) + 1).toString();
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput.value);
    localStorage.setItem("fontSize", fontInput.value);
  }
  if (event.key === "a") {
    fontInput.value = (parseInt(fontInput.value) - 1).toString();
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput.value);
    localStorage.setItem("fontSize", fontInput.value);
  }
  // if (event.key === "j") {
  //   offsetX.value = (parseInt(offsetX.value) + 1).toString();
  //   updateOutput(offsetX, offsetXOutput);
  //   localStorage.setItem("offsetX", offsetX.value);
  // }
  // if (event.key === "h") {
  //   offsetX.value = (parseInt(offsetX.value) - 1).toString();
  //   updateOutput(offsetX, offsetXOutput);
  //   localStorage.setItem("offsetX", offsetX.value);
  // }
  // if (event.key === "u") {
  //   offsetY.value = (parseInt(offsetY.value) + 1).toString();
  //   updateOutput(offsetY, offsetYOutput);
  //   localStorage.setItem("offsetY", offsetY.value);
  // }
  // if (event.key === "y") {
  //   offsetY.value = (parseInt(offsetY.value) - 1).toString();
  //   updateOutput(offsetY, offsetYOutput);
  //   localStorage.setItem("offsetY", offsetY.value);
  // }
  if (event.key === "x") {
    if (keyMeta) return;
    changeSelectedElement(positionX);
    positionTooltip(pointerX, pointerY);
  }
  if (event.key === "z") {
    if (keyMeta) return;
    changeSelectedElement(positionY);
    positionTooltip(pointerX, pointerY);
  }
  if (event.key === "d") {
    if (keyMeta) return;

    debouncedDownload();
  }
  // if (event.key === "w") {
  //   if (keyMeta) return;
  //   changeSelectedElement(scale);
  // }
  // if (event.key === "f") {
  //   if (keyMeta) return;
  //   changeSelectedElement(format);
  // }
  if (event.key === "c") {
    if (keyMeta) return;

    clearCanvas();
  }
  // if (event.key === "m") {
  //   if (keyMeta) return;

  //   columnNumber.value = (parseInt(columnNumber.value) + 1).toString();
  //   updateOutput(columnNumber, columnNumberOutput);
  //   localStorage.setItem("column", columnNumber.value);
  // }
  // if (event.key === "n") {
  //   if (keyMeta) return;

  //   columnNumber.value = (parseInt(columnNumber.value) - 1).toString();
  //   updateOutput(columnNumber, columnNumberOutput);
  //   localStorage.setItem("column", columnNumber.value);
  // }
  if (event.key === "Escape") {
    navToggle();
  }
  if (event.key === "v") {
    if (keyMeta) return;
    changeSelectedElement(colorSpace);
    positionTooltip(pointerX, pointerY);
  }
  if (event.key === "t") {
    if (keyMeta) return;
    changeCheckedPointer();
  }
  if (event.key === "g") {
    if (keyMeta) return;
    changeSelectedElement(filter);
    filterCanvas();
  }
  if (event.key === "q") {
    if (keyMeta) return;
    changeCheckedPan();
  }
  if (event.key === "2") {
    zoomElement.value = (parseInt(zoomElement.value) + 10).toString();
    updateOutput(zoomElement, zoomOutput);
    localStorage.setItem("zoom", zoomElement.value);
    zoom();
  }
  if (event.key === "1") {
    zoomElement.value = (parseInt(zoomElement.value) - 10).toString();
    updateOutput(zoomElement, zoomOutput);
    localStorage.setItem("zoom", zoomElement.value);
    zoom();
  }
  if (event.key === "3") {
    reset();
  }
});

// Set up an object to track the current state of each key
let keyShift = false;
let keyControl = false;
// let keyArrowUp = false;
// let keyArrowLeft = false;
// let keyArrowDown = false;
// let keyArrowRight = false;
let keyMeta = false;
let keyZ = false;
let keyX = false;
let keyC = false;
// let keyD = false;

// Define your key press handler
function handleKeyPress() {
  if (keyMeta && keyZ && !keyShift) {
    undo();
    keyZ = false;
  }
  if (keyMeta && keyShift && keyZ) {
    redo();
    keyZ = false;
  }
  if (keyMeta && keyC) {
    copyToClipboard();
    keyC = false;
  }
}

// Add event listeners to track the state of each key
document.addEventListener("keydown", (event) => {
  if (event.key === "Shift") {
    keyShift = true;
  }
  // if (event.key === "Control") {
  //   keyControl = true;
  // }
  // if (event.key === "ArrowUp") {
  //   keyArrowUp = true;
  // }
  // if (event.key === "ArrowLeft") {
  //   keyArrowLeft = true;
  // }
  // if (event.key === "ArrowDown") {
  //   keyArrowDown = true;
  // }
  // if (event.key === "ArrowRight") {
  //   keyArrowRight = true;
  // }
  if (event.key === "Meta") {
    keyMeta = true;
  }
  if (event.key === "z") {
    keyZ = true;
  }
  if (event.key === "x") {
    keyX = true;
  }
  if (event.key === "c") {
    keyC = true;
  }
  // if (event.key === "d") {
  //   keyD = true;
  // }
  handleKeyPress();
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Shift") {
    keyShift = false;
  }
  // if (event.key === "Control") {
  //   keyControl = false;
  // }
  // if (event.key === "ArrowUp") {
  //   keyArrowUp = false;
  // }
  // if (event.key === "ArrowLeft") {
  //   keyArrowLeft = false;
  // }
  // if (event.key === "ArrowDown") {
  //   keyArrowDown = false;
  // }
  // if (event.key === "ArrowRight") {
  //   keyArrowRight = false;
  // }
  if (event.key === "Meta") {
    keyMeta = false;
  }
  if (event.key === "z") {
    keyZ = false;
  }
  // if (event.key === "x") {
  //   keyX = false;
  // }
  if (event.key === "c") {
    keyC = false;
  }
  // if (event.key === "d") {
  //   keyD = false;
  // }
});

/// Download ///

function download() {
  if (!!initialState === false) {
    return;
  }
  drawImageDefault();
  // Canvasのイメージデータを取得する
  let imageData;
  ctxComposite.drawImage(canvasBase, 0, 0);
  ctxComposite.drawImage(canvas, 0, 0);
  switch (format.selectedOptions[0].value) {
    case "png":
      imageData = compositeCanvas.toDataURL("image/png");
      break;
    case "jpeg":
      imageData = compositeCanvas.toDataURL("image/jpeg", 0.85);
      break;
    case "webp":
      imageData = compositeCanvas.toDataURL("image/webP", 0.8);
      break;
    default:
      imageData = compositeCanvas.toDataURL("image/png");
  }
  if (colorsOnlyElement.checked === true) {
    switch (format.selectedOptions[0].value) {
      case "png":
        imageData = canvas.toDataURL("image/png");
        break;
      case "jpeg":
        imageData = canvas.toDataURL("image/jpeg", 0.85);
        break;
      case "webp":
        imageData = canvas.toDataURL("image/webP", 0.8);
        break;
      default:
        imageData = canvas.toDataURL("image/png");
    }
  }
  // ダウンロード用のリンクを作成する
  const downloadLink = document.createElement("a");
  downloadLink.href = imageData;
  switch (format.selectedOptions[0].value) {
    case "png":
      downloadLink.download = "image.png";
      break;
    case "jpeg":
      downloadLink.download = "image.jpg";
      break;
    case "webp":
      downloadLink.download = "image.webp";
      break;
    default:
      downloadLink.download = "image.png";
  }
  // リンクをクリックすることでダウンロードを実行する
  downloadLink.click();
  ctxComposite.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
  drawImage();
}
const debouncedDownload = debounce(download, 2000, true);

downloadBtn.addEventListener("click", debouncedDownload);

function debounce(func, delay, immediate) {
  let timerId;
  return function () {
    const context = this;
    const args = arguments;
    const callNow = immediate && !timerId;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, delay);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

/// UI function eventListener ///

function changeFontSize(context, fontSize) {
  const fontSizeValue = parseInt(fontSize);
  context.font = `500 ${fontSizeValue}px 'Inter','Helvetica Neue', Arial, sans-serif `;
}

fontInput.addEventListener("input", function () {
  changeFontSize(ctx, fontInput.value);
});

function updateOutput(inputField, outputField) {
  const inputValue = inputField.value; // 入力値を取得
  outputField.textContent = inputValue; // 出力要素に処理後の値を表示
}

function changeSelectedElement(element) {
  const selectedIndex = element.selectedIndex;
  if (selectedIndex + 1 === element.options.length) {
    element.options[0].selected = true;
    if (element === colorSpace) {
      changeColorSpaceForMenu(element.selectedOptions[0].value);
      changeColorSpaceForTooltip(element.selectedOptions[0].value);
    }
    localStorage.setItem(`${element.name}`, element.selectedOptions[0].value);
  } else {
    element.options[selectedIndex + 1].selected = true;
    if (element === colorSpace) {
      changeColorSpaceForMenu(element.selectedOptions[0].value);
      changeColorSpaceForTooltip(element.selectedOptions[0].value);
    }
    localStorage.setItem(`${element.name}`, element.selectedOptions[0].value);
  }
}

fileButton.addEventListener("click", function () {
  if (!!isMobile) {
    navToggle();
  }
});
scale.addEventListener("change", function (event) {
  localStorage.setItem(`${scale.name}`, scale.selectedOptions[0].value);
  // scale.blur();
});
format.addEventListener("change", function (event) {
  localStorage.setItem(`${format.name}`, format.selectedOptions[0].value);
  // format.blur();
});
filter.addEventListener("change", function (event) {
  localStorage.setItem(`${filter.name}`, filter.selectedOptions[0].value);
  filterCanvas();
});
colorSpace.addEventListener("change", function () {
  changeColorSpaceForMenu(colorSpace.selectedOptions[0].value);
  changeColorSpaceForTooltip(colorSpace.selectedOptions[0].value);
  localStorage.setItem(
    `${colorSpace.name}`,
    colorSpace.selectedOptions[0].value
  );
  positionTooltip(pointerX, pointerY);
  // colorSpace.blur();
});
clear.addEventListener("click", function () {
  if (!!isMobile) {
    navToggle();
  }
});
positionX.addEventListener("change", function () {
  localStorage.setItem(`${positionX.name}`, positionX.selectedOptions[0].value);
  positionTooltip(pointerX, pointerY);
  // positionX.blur();
});
positionY.addEventListener("change", function () {
  localStorage.setItem(`${positionY.name}`, positionY.selectedOptions[0].value);
  positionTooltip(pointerX, pointerY);
  // positionY.blur();
});
offsetXAdd.addEventListener("click", function () {
  let count = parseInt(offsetX.value);
  count += 1;
  offsetX.value = String(count);
  updateOutput(offsetX, offsetXOutput);
  localStorage.setItem("offsetX", offsetX.value);
});
offsetXSubtract.addEventListener("click", function () {
  let count = parseInt(offsetX.value);
  count -= 1;
  offsetX.value = String(count);
  updateOutput(offsetX, offsetXOutput);
  localStorage.setItem("offsetX", offsetX.value);
});
offsetXAdd.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetX.value);
    count += 1;
    offsetX.value = String(count);
    updateOutput(offsetX, offsetXOutput);
    localStorage.setItem("offsetX", offsetX.value);
  }
});
offsetXSubtract.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetX.value);
    count -= 1;
    offsetX.value = String(count);
    updateOutput(offsetX, offsetXOutput);
    localStorage.setItem("offsetX", offsetX.value);
  }
});
offsetYAdd.addEventListener("click", function () {
  let count = parseInt(offsetY.value);
  count += 1;
  offsetY.value = String(count);
  updateOutput(offsetY, offsetYOutput);
  localStorage.setItem("offsetY", offsetY.value);
});
offsetYSubtract.addEventListener("click", function () {
  let count = parseInt(offsetY.value);
  count -= 1;
  offsetY.value = String(count);
  updateOutput(offsetY, offsetYOutput);
  localStorage.setItem("offsetY", offsetY.value);
});
offsetYAdd.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetY.value);
    count += 1;
    offsetY.value = String(count);
    updateOutput(offsetY, offsetYOutput);
    localStorage.setItem("offsetY", offsetY.value);
    // offsetYSubtract.blur();
  }
});
offsetYSubtract.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetY.value);
    count -= 1;
    offsetY.value = String(count);
    updateOutput(offsetY, offsetYOutput);
    localStorage.setItem("offsetY", offsetY.value);
    // offsetYSubtract.blur();
  }
});
fontSizeAdd.addEventListener("click", function () {
  let count = parseInt(fontInput.value);
  count += 1;
  fontInput.value = String(count);
  updateOutput(fontInput, fontOutput);
  changeFontSize(ctx, fontInput.value);
  localStorage.setItem("fontSize", fontInput.value);
});
fontSizeSubtract.addEventListener("click", function () {
  let count = parseInt(fontInput.value);
  count -= 1;
  fontInput.value = String(count);
  updateOutput(fontInput, fontOutput);
  changeFontSize(ctx, fontInput.value);
  localStorage.setItem("fontSize", fontInput.value);
});
fontSizeAdd.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(fontInput.value);
    count += 1;
    fontInput.value = String(count);
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput.value);
    localStorage.setItem("fontSize", fontInput.value);
  }
});
fontSizeSubtract.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(fontInput.value);
    count -= 1;
    fontInput.value = String(count);
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput.value);
    localStorage.setItem("fontSize", fontInput.value);
  }
});
columnAdd.addEventListener("click", function (event) {
  // event.stopPropagation();
  let count = parseInt(columnNumber.value);
  count += 1;
  columnNumber.value = String(count);
  updateOutput(columnNumber, columnNumberOutput);
  localStorage.setItem("column", columnNumber.value);
});
columnSubtract.addEventListener("click", function (event) {
  // event.stopPropagation();
  let count = parseInt(columnNumber.value);
  count -= 1;
  columnNumber.value = String(count);
  updateOutput(columnNumber, columnNumberOutput);
  localStorage.setItem("column", columnNumber.value);
});
columnAdd.addEventListener("keydown", (event) => {
  // event.stopPropagation();
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(columnNumber.value);
    count += 1;
    columnNumber.value = String(count);
    updateOutput(columnNumber, columnNumberOutput);
    localStorage.setItem("column", columnNumber.value);
  }
});
columnSubtract.addEventListener("keydown", (event) => {
  // event.stopPropagation();
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(columnNumber.value);
    count -= 1;
    columnNumber.value = String(count);
    updateOutput(columnNumber, columnNumberOutput);
    localStorage.setItem("column", columnNumber.value);
  }
});
zoomAdd.addEventListener("click", function (event) {
  // event.stopPropagation();
  let count = parseInt(zoomElement.value);
  count += 10;
  zoomElement.value = String(count);
  updateOutput(zoomElement, zoomOutput);
  zoom();
});
zoomSubtract.addEventListener("click", function (event) {
  // event.stopPropagation();
  let count = parseInt(zoomElement.value);
  count -= 10;
  zoomElement.value = String(count);
  updateOutput(zoomElement, zoomOutput);
  zoom();
});
zoomAdd.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    // event.stopPropagation();
    let count = parseInt(zoomElement.value);
    count += 10;
    zoomElement.value = String(count);
    updateOutput(zoomElement, zoomOutput);
    zoom();
  }
});
zoomSubtract.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    // event.stopPropagation();
    let count = parseInt(zoomElement.value);
    count -= 10;
    zoomElement.value = String(count);
    updateOutput(zoomElement, zoomOutput);
    zoom();
  }
});
resetElement.addEventListener("click", function () {
  reset();
});
resetElement.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    reset();
  }
});

function navToggle() {
  menu.classList.toggle("close");
  openButton.classList.toggle("close");
  closeButton.classList.toggle("close");
  main.classList.toggle("close");
  imageContainer.classList.toggle("close");
}

function changeCheckedPointer() {
  pointer.checked = !pointer.checked;
  localStorage.setItem(`pointer`, pointer.checked);
}
function changeCheckedColorsOnly() {
  colorsOnlyElement.checked = !colorsOnlyElement.checked;
  localStorage.setItem(`colors-only`, colorsOnlyElement.checked);
}

/// find contrast color

function getGreyScaleColorWithHighestContrast(backgroundRGBColor) {
  // Define an array of greyScale colors in RGB format
  const greyScaleColors = [
    [27, 27, 27],
    [240, 240, 240],
  ];

  let maxContrastColor = [];
  let maxContrastRatio = 0;

  // Calculate contrast ratio for each greyScale color
  for (const greyScaleColor of greyScaleColors) {
    const contrastRatio = calculateContrastRatio(
      greyScaleColor,
      backgroundRGBColor
    );
    // Update max contrast values if a higher contrast is found
    if (contrastRatio > maxContrastRatio) {
      maxContrastRatio = contrastRatio;
      maxContrastColor = greyScaleColor;
    }
  }
  return maxContrastColor;
}

// Function to calculate contrast ratio between two RGB colors
function calculateContrastRatio(foregroundRGBColor, backgroundRGBColor) {
  const getLuminance = (rgbColor) => {
    const [r, g, b] = rgbColor.map((value) => value / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const foregroundLuminance = getLuminance(foregroundRGBColor);
  const backgroundLuminance = getLuminance(backgroundRGBColor);

  const brighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (brighter + 0.05) / (darker + 0.05);
}

function filterCanvas() {
  if (filter.selectedOptions[0].value === "off") {
    canvasBase.style.filter = "grayscale(0%)";
  }
  if (filter.selectedOptions[0].value === "greyscale") {
    canvasBase.style.filter = "grayscale(100%)";
  }
}

/// switch mode ///

function changeCheckedPan() {
  pan.checked = !pan.checked;
  localStorage.setItem(`pan`, pan.checked);
  if (pan.checked === true) {
    tooltip.style.display = "none";
    html[0].style.cursor = "grab";
    removeEventListenerTooltip();
    canvas.removeEventListener("mousedown", storeColor);
    canvas.addEventListener("mousedown", panMode);
  } else {
    html[0].style.cursor = "crosshair";
    canvas.removeEventListener("mousedown", panMode);
    canvas.addEventListener("mousemove", throttledGetColor);
    document.addEventListener("mousemove", showTooltip);
    canvas.addEventListener("mousedown", storeColor);
  }
}
function removeEventListenerTooltip() {
  canvas.removeEventListener("mousemove", throttledGetColor);
  document.removeEventListener("mousemove", showTooltip);
  canvas.removeEventListener("mouseup", removeEventListenerTooltip);
  canvas.removeEventListener("mouseout", removeEventListenerTooltip);
}
function panMode(event) {
  html[0].style.cursor = "grabbing";
  startDragOffset.x = event.clientX - canvas.offsetLeft - dragX;
  startDragOffset.y = event.clientY - canvas.offsetTop - dragY;
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseout", onMouseUp);
}

function onMouseMove(event) {
  dragX = event.clientX - canvas.offsetLeft - startDragOffset.x;
  dragY = event.clientY - canvas.offsetTop - startDragOffset.y;
  drawImage();
}

function onMouseUp() {
  html[0].style.cursor = "grab";
  canvas.removeEventListener("mousemove", onMouseMove);
  canvas.removeEventListener("mouseup", onMouseUp);
  canvas.removeEventListener("mouseout", onMouseUp);
}

function drawImage() {
  if (!!image === false) return;
  ctxBase.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctxBase.save();
  ctxBase.translate(dragX, dragY);
  ctxBase.scale(scaleValue, scaleValue);

  ctx.save();
  ctx.translate(dragX, dragY);
  ctx.scale(scaleValue, scaleValue);

  ctxBase.drawImage(image, 0, 0, canvas.width, canvas.height);
  drawingColor();
  ctxBase.restore();
  ctx.restore();
}

function drawImageDefault() {
  ctxBase.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctxBase.save();
  ctxBase.scale(1, 1);

  ctx.save();
  ctx.scale(1, 1);

  ctxBase.drawImage(image, 0, 0, canvas.width, canvas.height);
  drawingColor();
  ctxBase.restore();
  ctx.restore();
}

function zoom() {
  const zoomValue = zoomElement.value / 100;
  scaleValue = zoomValue;
  drawImage();
}

function reset() {
  drawImageDefault();
  dragX = 0;
  dragY = 0;
  scaleValue = 1;
  zoomElement.value = String(100);
  updateOutput(zoomElement, zoomOutput);
}
