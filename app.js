const html = document.getElementsByTagName("html");
const body = document.getElementsByTagName("body");
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
const ctxBase = canvasBase.getContext("2d", {
  willReadFrequently: true,
});
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
const zoomElement = document.getElementById("zoom");
const fontInput = document.getElementById("font-size-input");
const columnNumber = document.getElementById("column-number");
const downloadBtn = document.getElementById("download-btn");
const menu = document.getElementById("menu");
const openButton = document.getElementById("open-button");
const closeButton = document.getElementById("close-button");
const positionX = document.getElementById("position-x");
const positionY = document.getElementById("position-y");
const clickPointAdjustmentX = 0;
const clickPointAdjustmentY = 0;
const color = document.getElementById("color");
const pointer = document.getElementById("pointer");
const line = document.getElementById("line");
const lineOpacityElement = document.getElementById("line-opacity");
const lineWidthElement = document.getElementById("line-width");
const lineColorElement = document.getElementById("line-color");
const lineColorBtn = document.getElementById("line-color-btn");
const angleConstraintElement = document.getElementById("angle-constraint");
// const pan = document.getElementById("pan");
const isMobile = navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry)/);
const isTablet = navigator.userAgent.match(
  /iPad|Android.*Tablet|Kindle|Playbook/
);
const overlay = document.getElementById("overlay");
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
let hsl50;
let rgbForTooltip;
let hexForTooltip;
let hslForTooltip;
let hsvForTooltip;
let xyzForTooltip;
let xyzD50ForTooltip;
let labForTooltip;
let lchForTooltip;
let oklabForTooltip;
let oklchForTooltip;
let hsl50ForTooltip;
let colorCode;
let isInitialValue = true;
let isInitialValueForTooltip = true;
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
let moveX = 0;
let moveY = 0;
let scaleDiffX = 0;
let scaleDiffY = 0;
let prevCanvasWidth = 0;
let prevCanvasHeight = 0;
let colors = [];
let checkedPoints = [];
let lines = [];
let storeLineFlag = false;
let file;

const throttledStoreLine = throttle(storeLine, 100);
function setStyles() {
  const settingFormat = localStorage.getItem("format");
  const settingFilter = localStorage.getItem("filter");
  const settingColorSpace = localStorage.getItem("color-space");
  const settingPositionX = localStorage.getItem("position-x");
  const settingPositionY = localStorage.getItem("position-y");
  const settingFontSize = localStorage.getItem("font-size-input");
  const settingColumn = localStorage.getItem("column-number");
  const settingColor = localStorage.getItem("color");
  const settingPointer = localStorage.getItem("pointer");
  const settingLine = localStorage.getItem("line");
  const settingLineOpacity = localStorage.getItem("line-opacity");
  const settingLineWidth = localStorage.getItem("line-width");
  const settingLineColor = localStorage.getItem("line-color");
  const settingColorsOnly = localStorage.getItem("colors-only");
  const settingAngleConstraint = localStorage.getItem("angle-constraint");

  setValueToSelected(format, settingFormat);
  setValueToSelected(filter, settingFilter);
  setValueToSelected(colorSpace, settingColorSpace);
  changeColorSpaceForMenu(settingColorSpace);
  changeColorSpaceForTooltip(settingColorSpace);
  setValueToSelected(positionX, settingPositionX);
  setValueToSelected(positionY, settingPositionY);
  setValueToSelected(fontInput, settingFontSize);
  changeFontSize(ctx, fontInput.value);
  setValueToSelected(columnNumber, settingColumn);
  setValueToChecked(color, settingColor);
  setValueToChecked(pointer, settingPointer);
  setValueToChecked(line, settingLine);
  lineColorElement.value = settingLineColor;
  setValueToSelected(lineOpacityElement, settingLineOpacity);
  setValueToSelected(lineWidthElement, settingLineWidth);
  setValueToChecked(colorsOnlyElement, settingColorsOnly);
  setValueToChecked(angleConstraintElement, settingAngleConstraint);
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
    canvas.addEventListener("click", throttledStoreLine);
  }
  changeColorSpaceForTooltip(colorSpace.selectedOptions[0].value);
  setStyles();
  filterCanvas();
  if (!!isMobile === false && !!isTablet === false) {
    canvas.addEventListener("mousemove", throttledGetColor);
    document.addEventListener("mousemove", showTooltip);
    canvas.addEventListener("mousedown", throttledStoreLine);
  }
  if (!!isMobile === true) {
    setTimeout(() => {
      backdrop.style.display = "none";
    }, 250);
    return;
  }
  backdrop.style.display = "none";
});

const openFile = (event) => {
  file = event.target.files[0];
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
      dividedDrawImage(1);
      ctxBase.drawImage(image, 0, 0, canvas.width, canvas.height);
      imageContainer.style.display = "block";
      changeFontSize(ctx, fontInput.value);
      initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      colors = [];
      lines = [];
      checkedPoints = [];
      undoStates = [];
      redoStates = [];
      dragX = 0;
      dragY = 0;
      moveX = 0;
      moveY = 0;
      scaleDiffX = 0;
      scaleDiffY = 0;
      prevCanvasWidth = 0;
      prevCanvasHeight = 0;
      scaleValue = 1;
      zoomElement.value = String(100);
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
  s /= 100;
  l /= 100;

  if (s === 0) {
    l *= 255; // 輝度だけで色が決まる
    return [l, l, l];
  }

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h / 360 + 1 / 3);
  const g = hue2rgb(p, q, h / 360);
  const b = hue2rgb(p, q, h / 360 - 1 / 3);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hslToHsl50(hslH, oklchC) {
  let storeDiff = 100;
  let prevStoreDiff = 0;
  let saturation = 0;
  for (let i = 0; i <= 100; i++) {
    const rgb = hslToRgb(hslH, i, 50);
    // const xyz = rgbToXyzD65(rgb[0], rgb[1], rgb[2]);
    // const xyzD50 = bradfordTransformationD65toD50(xyz);
    // const lab = xyzToLab(xyzD50[0], xyzD50[1], xyzD50[2]);
    // const lch = labToLch(lab.labL, lab.labA, lab.labB);
    const oklab = rgb2oklab(rgb[0], rgb[1], rgb[2]);
    const oklch = oklab2okLch(oklab.oklabL, oklab.oklabA, oklab.oklabB);
    const diff = Math.abs(oklchC - oklch.oklchC);
    const minDiff = Math.min(diff, storeDiff);
    storeDiff = minDiff;
    if (prevStoreDiff - storeDiff !== 0) {
      saturation = i;
    }
    prevStoreDiff = storeDiff;
    // console.log(minDiff);
  }
  return saturation;
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
    lines = undoStatesCopy.lines;
    colors = undoStatesCopy.colors;
  } else {
    lines = [];
    colors = [];
  }
  checkedPoints = [];
  if (storeLineFlag === true && !!isMobile === false && !!isTablet === false) {
    canvas.removeEventListener("mousemove", drawLineOnMouseMove);
    canvas.addEventListener("mousemove", throttledGetColor);
    document.addEventListener("mousemove", showTooltip);
    storeLineFlag === false;
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
    lines = undoStatesCopy.lines;
    colors = undoStatesCopy.colors;
    checkedPoints = [];
    if (
      storeLineFlag === true &&
      !!isMobile === false &&
      !!isTablet === false
    ) {
      canvas.removeEventListener("mousemove", drawLineOnMouseMove);
      canvas.addEventListener("mousemove", throttledGetColor);
      document.addEventListener("mousemove", showTooltip);
      storeLineFlag === false;
    }
    drawImage();
  }
}
function updateUndoStates() {
  const colorsCopy = structuredClone(colors);
  const linesCopy = structuredClone(lines);
  const object = { lines: linesCopy, colors: colorsCopy };
  undoStates.push(object);
}

function clearCanvas() {
  if (!initialState) return;
  if (initialState === undoStates[0]) return;
  colors = [];
  lines = [];
  checkedPoints = [];
  if (storeLineFlag === true && !!isMobile === false && !!isTablet === false) {
    canvas.removeEventListener("mousemove", drawLineOnMouseMove);
    canvas.addEventListener("mousemove", throttledGetColor);
    document.addEventListener("mousemove", showTooltip);
    storeLineFlag === false;
  }
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
    const cardWidth = textWidth + padding * 2;
    const cardHeight = fontSize + padding * 2;
    // let colorSet;

    switch (colorSpaceValue) {
      // case "hsl+l":
      //   colorSet = [
      //     [colorList.hsl.h, colorList.hsl.h, colorList.hsl.h, 0],
      //     [100, colorList.hsl.s, colorList.hsl.s, 0],
      //     [50, 50, colorList.hsl.l, colorList.lab.labL],
      //   ];
      //   context.fillStyle = `hsl(${colorSet[0][i]} ${colorSet[1][i]}% ${colorSet[2][i]}%)`;
      //   break;
      case "hsl50":
        context.fillStyle = `hsl(${colorList.hsl.h} ${colorList.hsl50}% 50%)`;
        break;
      case "l":
        context.fillStyle = `lab(${colorList.lab.labL}% 0 0)`;
        break;
      default:
        context.fillStyle = `rgb(${colorList.rgb[0]} ${colorList.rgb[1]} ${colorList.rgb[2]})`;
        break;
    }

    if (textPositionX === "left") {
      xOffset = -maxWidth;
    } else if (textPositionX === "middle") {
      xOffset = -maxWidth / 2;
    } else {
      xOffset = 0;
    }
    if (textPositionY === "top") {
      yOffset =
        -(cardHeight + margin) *
          Math.ceil(colorElements.length / columnNumber) +
        margin;
    } else if (textPositionY === "middle") {
      yOffset =
        (-(cardHeight + margin) *
          Math.ceil(colorElements.length / columnNumber) +
          margin) /
        2;
    } else {
      yOffset = 0;
    }

    drawRoundedRectangle(
      context,
      pointX * scaleValue + drawingPositionX + xOffset,
      pointY * scaleValue + drawingPositionY + yOffset,
      cardWidth,
      cardHeight,
      padding,
      false
    );

    switch (colorSpaceValue) {
      // case "hsl+l":
      //   if (i === 0) {
      //     const baseColorRgb = hslToRgb(colorList.hsl.h, 100, 50);
      //     const contrastColor =
      //       getGreyScaleColorWithHighestContrast(baseColorRgb);
      //     context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
      //     break;
      //   }
      //   if (i === 1) {
      //     const baseColorRgb = hslToRgb(colorList.hsl.h, colorList.hsl.s, 50);
      //     const contrastColor =
      //       getGreyScaleColorWithHighestContrast(baseColorRgb);
      //     context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
      //     break;
      //   }
      //   if (i === 2) {
      //     const contrastColor = getGreyScaleColorWithHighestContrast(
      //       colorList.rgb
      //     );
      //     context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
      //     break;
      //   }
      //   if (i === 3) {
      //     const contrastColor = getGreyScaleColorWithHighestContrast(
      //       colorList.rgb
      //     );
      //     context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
      //     break;
      //   }
      // case "hsl50":
      //   const baseColorRgb = hslToRgb(colorList.hsl.h, colorList.hsl50, 50);
      //   let contrastColor = getGreyScaleColorWithHighestContrast(baseColorRgb);
      //   context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
      //   break;
      default:
        let contrastColor = getGreyScaleColorWithHighestContrast(colorList.rgb);
        context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
        break;
    }

    context.fillText(
      colorElement,
      pointX * scaleValue + drawingPositionX + xOffset + padding,
      pointY * scaleValue +
        drawingPositionY +
        yOffset +
        fontSize +
        fontSize / 12
    );

    if ((i + 1) % columnNumber === 0) {
      drawingPositionY += cardHeight + margin;
      drawingPositionX = 0;
    } else {
      drawingPositionX += cardWidth + margin;
    }
  }
}

function positionTooltipFixed(x, y) {
  // ツールチップを表示する位置を設定
  tooltip.style.top = y + 12 + "px";
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
      case "l":
        computedWidth = "33.2812";
        break;
      case "hsl50":
        computedWidth = "82.61";
        break;
      case "l+hsl50":
        computedWidth = "82.31";
        break;
      default:
        break;
    }
  }
  // console.log(computedWidth);
  const computedWidthInNumber = parseFloat(computedWidth) / 2;

  tooltip.style.left = x - computedWidthInNumber + "px";
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
  positionTooltipFixed(x, y);

  // ツールチップを表示する
  tooltip.style.display = "block";
}

function changeColorSpaceForTooltip(ColorSpaceValue) {
  switch (ColorSpaceValue) {
    case "rgb":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `R:-- G:-- B:--`;
        break;
      }
      tooltip.textContent = `R:${rgbForTooltip[0]} G:${rgbForTooltip[1]} B:${rgbForTooltip[2]}`;
      break;
    case "hex":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `#------`;
        break;
      }
      2;
      tooltip.textContent = hexForTooltip;
      break;
    case "hsv":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `H:-- S:-- V:--`;
        break;
      }
      tooltip.textContent = `H:${hsvForTooltip.hsvH} S:${hsvForTooltip.hsvS} V:${hsvForTooltip.hsvB}`;
      break;
    case "hsl":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `H:-- S:-- L:--`;
        break;
      }
      tooltip.textContent = `H:${hslForTooltip.h} S:${hslForTooltip.s} L:${hslForTooltip.l}`;
      break;
    case "lab":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `L:-- a:-- b:--`;
        break;
      }
      tooltip.textContent = `L:${labForTooltip.labL} a:${labForTooltip.labA} b:${labForTooltip.labB}`;
      // tooltip.style.setProperty(
      //   "--background-color",
      //   `lab(${labForTooltip.labL}% ${labForTooltip.labA} ${labForTooltip.labB})`
      // );
      break;
    case "lch":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `L:-- C:-- H:--`;
        break;
      }
      tooltip.textContent = `L:${lchForTooltip.lchL} C:${lchForTooltip.lchC} H:${lchForTooltip.lchH}`;
      break;
    case "oklab":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `l:-- a:-- b:--`;
        break;
      }
      tooltip.textContent = `l:${oklabForTooltip.oklabLRounded} a:${oklabForTooltip.oklabARounded} b:${oklabForTooltip.oklabBRounded}`;
      break;
    case "oklch":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `l:-- c:-- h:--`;
        break;
      }
      tooltip.textContent = `l:${oklchForTooltip.oklchL} c:${oklchForTooltip.oklchC} h:${oklchForTooltip.oklchH}`;
      break;
    case "l":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `L:--`;
        break;
      }
      tooltip.textContent = `L:${labForTooltip.labL}`;
      tooltip.style.setProperty(
        "--background-color",
        `lab(${labForTooltip.labL}% 0 0)`
      );
      break;
    case "hsl50":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `h:-- s:-- l:50`;
        break;
      }
      tooltip.textContent = `H:${hslForTooltip.h} S:${hsl50ForTooltip} L:50`;
      tooltip.style.setProperty(
        "--background-color",
        `hsl(${hslForTooltip.h} ${hsl50ForTooltip} 50)`
      );
      break;
    case "l+hsl50":
      if (isInitialValueForTooltip) {
        tooltip.textContent = `L:-- h:-- s:--`;
        break;
      }
      tooltip.textContent = `L:${labForTooltip.labL} h:${hslForTooltip.h} s:${hsl50ForTooltip}`;
      // ツールチップの背景色を白黒から元に戻す
      tooltip.style.setProperty(
        "--background-color",
        `lab(${labForTooltip.labL}% ${labForTooltip.labA} ${labForTooltip.labB})`
      );
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
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
      break;
    case "hex":
      if (isInitialValue) {
        colorInfoElement.textContent = `#------`;
        break;
      }
      colorCode = hex;
      colorInfoElement.textContent = hex;
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
      break;
    case "hsv":
      if (isInitialValue) {
        colorInfoElement.textContent = `H:-- S:-- V:--`;
        break;
      }
      colorCode = `h:${hsv.hsvH} s:${hsv.hsvS} v:${hsv.hsvB}`;
      colorInfoElement.textContent = `H:${hsv.hsvH} S:${hsv.hsvS} V:${hsv.hsvB}`;
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
      break;
    case "hsl":
      if (isInitialValue) {
        colorInfoElement.textContent = `H:-- S:-- L:--`;
        break;
      }
      colorCode = `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
      colorInfoElement.textContent = `H:${hsl.h} S:${hsl.s} L:${hsl.l}`;
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
      break;
    case "lab":
      if (isInitialValue) {
        colorInfoElement.textContent = `L:-- a:-- b:--`;
        break;
      }
      colorCode = `lab(${lab.labL}% ${lab.labA} ${lab.labB})`;
      colorInfoElement.textContent = `L:${lab.labL} a:${lab.labA} b:${lab.labB}`;
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
      break;
    case "lch":
      if (isInitialValue) {
        colorInfoElement.textContent = `L:-- C:-- H:--`;
        break;
      }
      colorCode = `lch(${lch.lchL}% ${lch.lchC} ${lch.lchH})`;
      colorInfoElement.textContent = `L:${lch.lchL} C:${lch.lchC} H:${lch.lchH}`;
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
      break;
    case "oklab":
      if (isInitialValue) {
        colorInfoElement.textContent = `l:-- a:-- b:--`;
        break;
      }
      colorCode = `oklab(${oklab.oklabLRounded}% ${oklab.oklabARounded} ${oklab.oklabBRounded})`;
      colorInfoElement.textContent = `l:${oklab.oklabLRounded} a:${oklab.oklabARounded} b:${oklab.oklabBRounded}`;
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
      break;
    case "oklch":
      if (isInitialValue) {
        colorInfoElement.textContent = `l:-- c:-- h:--`;
        break;
      }
      colorCode = `oklch(${oklch.oklchL}% ${oklch.oklchC} ${oklch.oklchH})`;
      colorInfoElement.textContent = `l:${oklch.oklchL} c:${oklch.oklchC} h:${oklch.oklchH}`;
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
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
    case "hsl50":
      if (isInitialValue) {
        colorInfoElement.textContent = `h:-- s:-- l:50`;
        break;
      }
      colorCode = `hsl(${hsl.h} ${hsl50}% 50%)`;
      colorInfoElement.textContent = `h:${hsl.h} s:${hsl50} l:50`;
      colorBlockElement.style.setProperty(
        "background-color",
        `hsl(${hsl.h} ${hsl50} 50)`
      );
      break;
    case "l+hsl50":
      if (isInitialValue) {
        colorInfoElement.textContent = `L:-- h:-- s:--`;
        break;
      }
      colorCode = `hsl(${hsl.h} ${hsl50}% 50%)`;
      colorInfoElement.textContent = `L:${lab.labL} h:${hsl.h} s:${hsl50}`;
      colorBlockElement.style.setProperty(
        "background-color",
        `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
      );
      break;
    default:
      break;
  }
}
function getColorForTooltip(event) {
  const x = event.offsetX + clickPointAdjustmentX;
  const y = event.offsetY + clickPointAdjustmentY;
  const color = ctxBase.getImageData(x, y, 1, 1).data;
  rgbForTooltip = [color[0], color[1], color[2]];
  hexForTooltip = rgbToHex(color[0], color[1], color[2]);
  hslForTooltip = rgbToHsl(color[0], color[1], color[2]);
  hsvForTooltip = rgbToHsv(color[0], color[1], color[2]);
  xyzForTooltip = rgbToXyzD65(color[0], color[1], color[2]);
  xyzD50ForTooltip = bradfordTransformationD65toD50(xyzForTooltip);
  labForTooltip = xyzToLab(
    xyzD50ForTooltip[0],
    xyzD50ForTooltip[1],
    xyzD50ForTooltip[2]
  );
  lchForTooltip = labToLch(
    labForTooltip.labL,
    labForTooltip.labA,
    labForTooltip.labB
  );
  oklabForTooltip = rgb2oklab(color[0], color[1], color[2]);
  oklchForTooltip = oklab2okLch(
    oklabForTooltip.oklabL,
    oklabForTooltip.oklabA,
    oklabForTooltip.oklabB
  );
  if (colorSpace.selectedOptions[0].value === "hsl50") {
    hsl50ForTooltip = hslToHsl50(hslForTooltip.h, oklchForTooltip.oklchC);
  }
  if (colorSpace.selectedOptions[0].value === "l+hsl50") {
    hsl50ForTooltip = hslToHsl50(hslForTooltip.h, oklchForTooltip.oklchC);
  }
}
function getColor(posX, posY) {
  const x = (posX + dragX / scaleValue) * scaleValue;
  const y = (posY + dragY / scaleValue) * scaleValue;
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
  hsl50 = hslToHsl50(hsl.h, oklch.oklchC);
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
    `rgb(${rgbForTooltip[0]}, ${rgbForTooltip[1]}, ${rgbForTooltip[2]})`
  );
  const contrastColor = getGreyScaleColorWithHighestContrast(rgbForTooltip);
  tooltip.style.setProperty(
    "--color",
    `rgb(${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`
  );
}

const throttledGetColor = throttle(function (event) {
  getColorForTooltip(event);
  setTooltipView();
  isInitialValueForTooltip = false;
  changeColorSpaceForTooltip(colorSpace.selectedOptions[0].value);
}, 50);

function storeColor(startX, startY, endX, endY) {
  if (!!isMobile === true) {
    getColor(startX, startY);
  } else {
    rgb = rgbForTooltip;
    hex = hexForTooltip;
    hsv = hsvForTooltip;
    hsl = hslForTooltip;
    lab = labForTooltip;
    lch = lchForTooltip;
    oklab = oklabForTooltip;
    oklch = oklchForTooltip;
    hsl50 = hslToHsl50(hsl.h, oklch.oklchC);
  }
  const colorList = {
    rgb: rgb,
    hex: hex,
    hsv: hsv,
    hsl: hsl,
    lab: lab,
    lch: lch,
    oklab: oklab,
    oklch: oklch,
    hsl50: hsl50,
  };
  colorBlockElement.style.setProperty(
    "background-color",
    `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  );
  isInitialValue = false;
  const colorSpaceValue = colorSpace.selectedOptions[0].value;
  changeColorSpaceForMenu(colorSpaceValue);
  const pointX = endX;
  const pointY = endY;
  const colorText = `${colorInfoElement.textContent}`;
  const fontSize = parseInt(fontInput.value);
  const textPositionX = positionX.selectedOptions[0].value;
  const textPositionY = positionY.selectedOptions[0].value;
  const columnNumberValue = parseInt(columnNumber.value);
  const colorChecked = color.checked;
  colors.push({
    colorList,
    colorText,
    colorSpaceValue,
    pointX,
    pointY,
    fontSize,
    textPositionX,
    textPositionY,
    columnNumberValue,
    colorChecked,
  });
}

function drawColors() {
  if (colors.length === false) return;
  colors.forEach((color) => {
    if (color.colorChecked === true) {
      drawMultilineText(
        ctx,
        color.colorText,
        color.pointX,
        color.pointY,
        color.textPositionX,
        color.textPositionY,
        color.fontSize * scaleValue,
        color.columnNumberValue,
        color.colorList,
        color.colorSpaceValue,
        color.pointerChecked
      );
    }
  });
}

// function drawPointer(pointX, pointY) {
//   if (lab.labL > 85) {
//     ctx.beginPath();
//     ctx.moveTo(pointX - 7.5, pointY + clickPointAdjustmentY + 3);
//     ctx.lineTo(pointX - 2.5, pointY + clickPointAdjustmentY + 3);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(pointX + 1.5, pointY + clickPointAdjustmentY + 3);
//     ctx.lineTo(pointX + 7, pointY + clickPointAdjustmentY + 3);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(pointX + clickPointAdjustmentX, pointY - 2.5);
//     ctx.lineTo(pointX + clickPointAdjustmentX + 3.5, pointY - 2.5);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(pointX + clickPointAdjustmentX, pointY + 6.5);
//     ctx.lineTo(pointX + clickPointAdjustmentX + 3.5, pointY + 6.5);
//     ctx.stroke();
//   }

//   ctx.fillRect(pointX - 7.5, pointY + clickPointAdjustmentY, 5, 3);
//   ctx.fillRect(pointX + 1.5, pointY + clickPointAdjustmentY, 5.2, 3);
//   ctx.fillRect(pointX + clickPointAdjustmentX, pointY - 7.5, 3.5, 5);
//   ctx.fillRect(pointX + clickPointAdjustmentX, pointY + 1.5, 3.5, 5);
// }

/// keyboard shortcuts ///
// Add event listeners to track the state of each key
document.addEventListener("keydown", (event) => {
  if (event.key === "r") {
    if (keyMeta) return;

    fileInput.click();
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
  if (event.key === "Escape") {
    navToggle();
  }
  if (event.key === "v") {
    if (keyMeta) return;
    changeSelectedElement(colorSpace);
    if (colorSpace.selectedOptions[0].value === "hsl50") {
      hsl50ForTooltip = hslToHsl50(hslForTooltip.h, oklchForTooltip.oklchC);
      changeColorSpaceForTooltip("hsl50");
    }
    positionTooltipFixed(pointerX, pointerY);
  }
  if (event.key === "f") {
    if (keyMeta) return;
    changeSelectedElement(filter);
    filterCanvas();
  }
  // if (event.key === "q") {
  //   if (keyMeta) return;
  //   changeCheckedPan();
  // }
  if (event.key === "1") {
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
  reset();
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
  const fileName = removeExtension(file.name);
  switch (format.selectedOptions[0].value) {
    case "png":
      downloadLink.download = `${fileName}-color.png`;
      break;
    case "jpeg":
      downloadLink.download = `${fileName}-color.jpg`;
      break;
    case "webp":
      downloadLink.download = `${fileName}-color.webp`;
      break;
    default:
      downloadLink.download = `${fileName}-color.png`;
  }
  // リンクをクリックすることでダウンロードを実行する
  downloadLink.click();
  ctxComposite.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
}
const debouncedDownload = debounce(download, 2000, true);

function removeExtension(filename) {
  // 最後のドットの位置を見つける
  let lastDotIndex = filename.lastIndexOf(".");

  // ドットが見つからなければ、元のファイル名を返す
  if (lastDotIndex === -1) return filename;

  // ドットの位置から拡張子を除いた部分を返す
  return filename.substring(0, lastDotIndex);
}

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

fontInput.addEventListener("change", function () {
  changeFontSize(ctx, fontInput.value);
});

// function updateOutput(inputField, outputField) {
//   const inputValue = inputField.value; // 入力値を取得
//   outputField.textContent = inputValue; // 出力要素に処理後の値を表示
// }

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
overlay.addEventListener("click", function () {
  navToggle();
});
fileButton.addEventListener("click", function () {
  if (!!isMobile) {
    navToggle();
  }
});
format.addEventListener("change", function (event) {
  localStorage.setItem(`${format.name}`, format.selectedOptions[0].value);
  // format.blur();
});
filter.addEventListener("change", function (event) {
  localStorage.setItem(`${filter.name}`, filter.selectedOptions[0].value);
  filterCanvas();
});
zoomElement.addEventListener("change", function (event) {
  localStorage.setItem(`${zoom.name}`, zoomElement.selectedOptions[0].value);
  zoom();
});
lineOpacityElement.addEventListener("change", function (event) {
  localStorage.setItem(
    `${lineOpacityElement.name}`,
    lineOpacityElement.selectedOptions[0].value
  );
});
lineWidthElement.addEventListener("change", function (event) {
  localStorage.setItem(
    `${lineWidthElement.name}`,
    lineWidthElement.selectedOptions[0].value
  );
});
fontInput.addEventListener("change", function (event) {
  localStorage.setItem(`${fontInput.name}`, fontInput.selectedOptions[0].value);
});
columnNumber.addEventListener("change", function (event) {
  localStorage.setItem(
    `${columnNumber.name}`,
    columnNumber.selectedOptions[0].value
  );
});
lineColorElement.addEventListener("change", function (event) {
  localStorage.setItem(`${lineColorElement.name}`, lineColorElement.value);
});
lineColorBtn.addEventListener("click", function (event) {
  lineColorElement.click();
});
lineColorBtn.addEventListener("keydown", function (event) {
  lineColorElement.click();
});
colorSpace.addEventListener("change", function () {
  changeColorSpaceForMenu(colorSpace.selectedOptions[0].value);
  if (
    colorSpace.selectedOptions[0].value === "hsl50" &&
    hsl50ForTooltip === undefined
  ) {
    changeColorSpaceForTooltip("hsl50");
  } else if (colorSpace.selectedOptions[0].value === "hsl50") {
    hsl50ForTooltip = hslToHsl50(hslForTooltip.h, oklchForTooltip.oklchC);
    changeColorSpaceForTooltip("hsl50");
  } else {
    changeColorSpaceForTooltip(colorSpace.selectedOptions[0].value);
  }
  localStorage.setItem(
    `${colorSpace.name}`,
    colorSpace.selectedOptions[0].value
  );
  positionTooltipFixed(pointerX, pointerY);
  // colorSpace.blur();
});
clear.addEventListener("click", function () {
  if (!!isMobile) {
    navToggle();
  }
});
positionX.addEventListener("change", function () {
  localStorage.setItem(`${positionX.name}`, positionX.selectedOptions[0].value);
  // positionTooltip(pointerX, pointerY);
  // positionX.blur();
});
positionY.addEventListener("change", function () {
  localStorage.setItem(`${positionY.name}`, positionY.selectedOptions[0].value);
  // positionTooltip(pointerX, pointerY);
  // positionY.blur();
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
  if (!!isMobile === true) {
    overlay.classList.toggle("close");
    body[0].classList.toggle("close");
  }
}

function changeCheckedColor() {
  color.checked = !color.checked;
  localStorage.setItem(`color`, color.checked);
}
function changeCheckedPointer() {
  pointer.checked = !pointer.checked;
  localStorage.setItem(`pointer`, pointer.checked);
}
function changeCheckedLine() {
  line.checked = !line.checked;
  localStorage.setItem(`line`, line.checked);
}
function changeCheckedColorsOnly() {
  colorsOnlyElement.checked = !colorsOnlyElement.checked;
  localStorage.setItem(`colors-only`, colorsOnlyElement.checked);
}
function changeCheckedAngleConstraint() {
  angleConstraintElement.checked = !angleConstraintElement.checked;
  localStorage.setItem(`angle-constraint`, angleConstraintElement.checked);
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

// function changeCheckedPan() {
//   pan.checked = !pan.checked;
//   if (pan.checked === true) {
//     tooltip.style.display = "none";
//     html[0].style.cursor = "grab";
//     removeEventListenerTooltip();
//     canvas.removeEventListener("mousedown", throttledStoreLine);
//     canvas.addEventListener("mousedown", panMode);
//   } else {
//     html[0].style.cursor = "crosshair";
//     canvas.removeEventListener("mousedown", panMode);
//     canvas.addEventListener("mousemove", throttledGetColor);
//     document.addEventListener("mousemove", showTooltip);
//     canvas.addEventListener("mousedown", throttledStoreLine);
//   }
// }
function removeEventListenerTooltip() {
  canvas.removeEventListener("mousemove", throttledGetColor);
  document.removeEventListener("mousemove", showTooltip);
  // canvas.removeEventListener("mouseup", removeEventListenerTooltip);
  // canvas.removeEventListener("mouseout", removeEventListenerTooltip);
}
// function panMode(event) {
//   html[0].style.cursor = "grabbing";
//   startDragOffset.x = event.clientX - canvas.offsetLeft - dragX;
//   startDragOffset.y = event.clientY - canvas.offsetTop - dragY;
//   canvas.addEventListener("mousemove", onMouseMove);
//   canvas.addEventListener("mouseup", onMouseUp);
//   canvas.addEventListener("mouseout", onMouseUp);
// }

// function onMouseMove(event) {
//   dragX = event.clientX - canvas.offsetLeft - startDragOffset.x;
//   dragY = event.clientY - canvas.offsetTop - startDragOffset.y;
//   drawImage();
// }

// function onMouseUp() {
//   html[0].style.cursor = "grab";
//   canvas.removeEventListener("mousemove", onMouseMove);
//   canvas.removeEventListener("mouseup", onMouseUp);
//   canvas.removeEventListener("mouseout", onMouseUp);
// }

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

  moveX = window.scrollX;
  moveY = window.scrollY;
  prevCanvasWidth = canvas.width;
  prevCanvasHeight = canvas.height;
  dividedDrawImage(1 / scaleValue);
  scaleDiffX = (canvas.width - prevCanvasWidth) / 2;
  scaleDiffY = (canvas.height - prevCanvasHeight) / 2;
  window.scrollTo(moveX + scaleDiffX, moveY + scaleDiffY);
  ctxBase.drawImage(image, 0, 0, canvas.width, canvas.height);
  drawLines();
  drawColors();
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
  drawLines();
  drawColors();
  ctxBase.restore();
  ctx.restore();
}

function zoom() {
  const zoomValue = zoomElement.value / 100;
  scaleValue = zoomValue;
  drawImage();
}

function reset() {
  if (!!initialState === false) {
    return;
  }
  dragX = 0;
  dragY = 0;
  moveX = 0;
  moveY = 0;
  scaleDiffX = 0;
  scaleDiffY = 0;
  prevCanvasWidth = 0;
  prevCanvasHeight = 0;
  scaleValue = 1;
  zoomElement.value = String(100);
  dividedDrawImage(1 / scaleValue);
  drawImageDefault();
  window.scrollTo(0, 0);
}

///// Draw a line /////

function drawLineOnMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const startX = checkedPoints[0].x;
  const startY = checkedPoints[0].y;
  let currentX = event.clientX - rect.left + clickPointAdjustmentX;
  let currentY = event.clientY - rect.top + clickPointAdjustmentY;
  let lineWidth = parseInt(lineWidthElement.value);
  if (!lineWidth) {
    lineWidth = 1;
  }
  ctx.lineWidth = parseInt(lineWidth);
  const opacity = lineOpacityElement.value;
  const lineColor = lineColorElement.value;
  let currentColor = hexToRgba(lineColor, opacity);
  drawImage();
  drawCross(
    (startX + dragX / scaleValue) * scaleValue,
    (startY + dragY / scaleValue) * scaleValue,
    currentColor,
    lineWidth
  );
  ctx.beginPath();
  ctx.moveTo(
    (startX + dragX / scaleValue) * scaleValue,
    (startY + dragY / scaleValue) * scaleValue
  );
  if (angleConstraintElement.checked === true) {
    const angle = calculateAngle(
      (startX + dragX / scaleValue) * scaleValue,
      (startY + dragY / scaleValue) * scaleValue,
      currentX,
      currentY
    );
    const shiftAngle = adjustedAngle(angle);
    const adjustedPoint = rotatePoint(
      (startX + dragX / scaleValue) * scaleValue,
      (startY + dragY / scaleValue) * scaleValue,
      currentX,
      currentY,
      shiftAngle
    );
    ctx.lineTo(adjustedPoint[0], adjustedPoint[1]);
  } else {
    ctx.lineTo(currentX, currentY);
  }
  ctx.stroke();
}

function storeLine(event) {
  storeLineFlag = true;
  const rect = canvas.getBoundingClientRect();
  let x =
    (event.clientX - rect.left + clickPointAdjustmentX - dragX) / scaleValue;
  let y =
    (event.clientY - rect.top + clickPointAdjustmentY - dragY) / scaleValue;
  let lineWidth = parseInt(lineWidthElement.value);
  if (!lineWidth) {
    lineWidth = 1;
  }
  ctx.lineWidth = lineWidth;
  const opacity = lineOpacityElement.value;
  const lineColor = lineColorElement.value;
  const pointerChecked = pointer.checked;
  const lineChecked = line.checked;

  if (!x || !y) {
    return;
  }

  let currentColor = hexToRgba(lineColor, opacity);
  drawCross(
    event.clientX - rect.left,
    event.clientY - rect.top,
    currentColor,
    lineWidth
  );
  checkedPoints.push({
    x,
    y,
    lineColor,
    lineWidth,
    opacity,
    pointerChecked,
    lineChecked,
  });
  if (!!isMobile === false && !!isTablet === false) {
    canvas.addEventListener("mousemove", drawLineOnMouseMove);
    removeEventListenerTooltip();
    tooltip.style.display = "none";
  }

  if (checkedPoints.length === 2) {
    if (!!isMobile === false && !!isTablet === false) {
      canvas.removeEventListener("mousemove", drawLineOnMouseMove);
    }
    // console.log("checkedPoints:", checkedPoints);
    const angle = parseFloat(
      calculateAngle(
        checkedPoints[0].x,
        checkedPoints[0].y,
        checkedPoints[1].x,
        checkedPoints[1].y
      )
    );
    // console.log("angle:", angle);
    const shiftAngle = adjustedAngle(angle);
    // console.log("shiftAngle:", shiftAngle);
    const adjustedPoint = rotatePoint(
      checkedPoints[0].x,
      checkedPoints[0].y,
      checkedPoints[1].x,
      checkedPoints[1].y,
      shiftAngle
    );
    if (angleConstraintElement.checked === true) {
      checkedPoints[1].x = adjustedPoint[0];
      checkedPoints[1].y = adjustedPoint[1];
    }
    lines.push(checkedPoints);
    storeColor(
      checkedPoints[0].x,
      checkedPoints[0].y,
      checkedPoints[1].x,
      checkedPoints[1].y
    );
    // console.log("colors:", colors);
    updateUndoStates();
    // console.log("undoStates:", undoStates);
    drawImage();
    canvas.addEventListener("mousemove", throttledGetColor);
    document.addEventListener("mousemove", showTooltip);
    checkedPoints = [];
    redoStates = [];
    storeLineFlag = false;
  }
}
function drawLines() {
  lines.forEach((line) => {
    const pointStart = line[0];
    const pointEnd = line[1];
    const lineColor = hexToRgba(line[1].lineColor, line[1].opacity);
    const lineWidth = line[1].lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = parseInt(lineWidth);
    if (line[1].lineChecked === true) {
      ctx.beginPath();
      ctx.moveTo(pointStart.x * scaleValue, pointStart.y * scaleValue);
      ctx.lineTo(pointEnd.x * scaleValue, pointEnd.y * scaleValue);
      ctx.stroke();
    }
    if (line[1].pointerChecked === true) {
      drawCross(
        pointStart.x * scaleValue,
        pointStart.y * scaleValue,
        lineColor,
        lineWidth
      );
      // drawCross(pointEnd.x, pointEnd.y, lineColor, lineWidth);
    }
  });
}
function adjustedAngle(angle) {
  if (0 < angle && angle <= 22.5) {
    return 0;
  }
  if (22.5 < angle && angle <= 67.5) {
    return -45;
  }
  if (67.5 < angle && angle <= 112.5) {
    return -90;
  }
  if (112.5 < angle && angle <= 157.5) {
    return -135;
  }
  if (157.5 < angle && angle <= 202.5) {
    return -180;
  }
  if (202.5 < angle && angle <= 247.5) {
    return 135;
  }
  if (247.5 < angle && angle <= 292.5) {
    return 90;
  }
  if (292.5 < angle && angle <= 337.5) {
    return 45;
  }
  if (337.5 < angle && angle <= 360) {
    return 0;
  }
  return 0;
}
function drawCross(x, y, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = parseInt(lineWidth);
  const crossSize = 3 + parseInt(lineWidth); // Size of the cross arms
  ctx.beginPath();
  ctx.moveTo(x - crossSize, y);
  ctx.lineTo(x + crossSize, y);
  ctx.moveTo(x, y - crossSize);
  ctx.lineTo(x, y + crossSize);
  ctx.stroke();
}
function formatNumber(number) {
  if (Number.isNaN(number)) {
    return "Invalid Number";
  }

  if (Number.isInteger(number)) {
    return number.toString();
  }

  const rounded = Math.round(number * 100) / 100; // Round to 2 decimal places
  const decimalPart = rounded - Math.floor(rounded);

  if (decimalPart === 0) {
    return Math.floor(rounded).toString();
  } else {
    return rounded.toFixed(2);
  }
}
function calculateAngle(x0, y0, x, y) {
  // Adjust the click coordinates to be relative to the custom origin (x0, y0)
  let adjustedX = x - x0;
  let adjustedY = y - y0;

  // Calculate the angle in degrees
  let angleDegrees = (Math.atan2(adjustedY, adjustedX) * 180) / Math.PI;

  // Normalize the angle to be within 0 to 360 degrees
  if (angleDegrees > 0) {
    angleDegrees -= 360;
  }
  return formatNumber(Math.abs(angleDegrees));
}
function rotatePoint(x0, y0, x, y, degree) {
  // Convert degrees to radians
  const rad = degree * (Math.PI / 180);

  // Calculate the distance from the origin to the point
  const distance = Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2));

  // Calculate new coordinates
  const x1 = x0 + distance * Math.cos(rad);
  const y1 = y0 + distance * Math.sin(rad);

  return [x1, y1];
}
function hexToRgba(hex, alpha) {
  // HEX値を正規化（3桁の場合は6桁に拡張）
  let normalizedHex = hex.replace(/^#/, "");
  if (normalizedHex.length === 3) {
    normalizedHex = normalizedHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // 16進数を10進数のRGB値に変換
  const r = parseInt(normalizedHex.substring(0, 2), 16);
  const g = parseInt(normalizedHex.substring(2, 4), 16);
  const b = parseInt(normalizedHex.substring(4, 6), 16);

  // α値を0から1の範囲に変換
  const a = alpha / 100;

  // RGBA値を返す
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
