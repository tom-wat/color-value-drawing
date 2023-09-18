const board = document.getElementById("board");
const pc = document.getElementsByClassName("pc");
const fileButton = document.getElementById("file-button");
const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const container = document.querySelector(".container");
const dataType = document.getElementById("data-type");
const colorInfoElement = document.getElementById("colorInfo");
const colorMode = document.getElementById("color-mode");
const webp = document.getElementById("webp");
const png = document.getElementById("png");
const clear = document.getElementById("clear-btn");
const scale = document.getElementById("scale");
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
const closeButton = document.getElementById("close-button");
const drawingPositionX = document.getElementById("data-drawing-position-x");
const drawingPositionXLeft = document.getElementById("drawing-position-x-left");
const drawingPositionXRight = document.getElementById(
  "drawing-position-x-right"
);
const drawingPositionY = document.getElementById("data-drawing-position-y");
const drawingPositionYTop = document.getElementById("drawing-position-y-top");
const drawingPositionYBottom = document.getElementById(
  "drawing-position-y-bottom"
);
const offsetX = document.getElementById("offset-x");
const offsetXOutput = document.getElementById("offset-x-output");
const offsetXAdd = document.getElementById("offset-x-add");
const offsetXSubtract = document.getElementById("offset-x-subtract");
const offsetYAdd = document.getElementById("offset-y-add");
const offsetYSubtract = document.getElementById("offset-y-subtract");
const offsetY = document.getElementById("offset-y");
const offsetYOutput = document.getElementById("offset-y-output");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const clickPointAdjustment = -2;
const scaleFull = document.getElementById("scale-full");
const scaleHalf = document.getElementById("scale-half");
const scaleQuarter = document.getElementById("scale-quarter");
const scaleWindow = document.getElementById("scale-window");
const pointer = document.getElementById("pointer");

const isMobile = navigator.userAgent.match(
  /(iPhone|iPod|iPad|Android|BlackBerry)/
);
// const isWindows = /Windows/.test(navigator.userAgent);
const dataTypeRadioNodeList = dataType.type;
const scaleRadioNodeList = scale.scale;
const colorModeNodeList = colorMode.elements.colorMode;
const positionXRadioNodeList = drawingPositionX.positionX;
const positionYRadioNodeList = drawingPositionY.positionY;
const pointerRadioNodeList = pointer.pointer;

const undoStatesLimitNumber = 50;
let rgb;
let hex;
let hsl;
let hsb;
let xyz;
let xyzD50;
let lab;
let lch;
let colorCode;
let isInitialValue = true;
let image;
let undoStates = [];
let redoStates = [];
let initialState;
let currentStates;

function setStyles() {
  const settingScale = localStorage.getItem("scale");
  const settingFormat = localStorage.getItem("format");
  const settingColorMode = localStorage.getItem("colorMode");
  const settingPositionX = localStorage.getItem("positionX");
  const settingPositionY = localStorage.getItem("positionY");
  const settingOffsetX = localStorage.getItem("offsetX");
  const settingOffsetY = localStorage.getItem("offsetY");
  const settingFontSize = localStorage.getItem("fontSize");
  const settingColumn = localStorage.getItem("column");
  const settingPointer = localStorage.getItem("pointer");

  setStringValue(scaleRadioNodeList, settingScale);
  setStringValue(dataTypeRadioNodeList, settingFormat);
  setStringValue(colorModeNodeList, settingColorMode);
  changeColorMode(settingColorMode);
  setStringValue(positionXRadioNodeList, settingPositionX);
  setStringValue(positionYRadioNodeList, settingPositionY);
  setStringValue(pointerRadioNodeList, settingPointer);
  setValue(offsetX, settingOffsetX, offsetXOutput);
  setValue(offsetY, settingOffsetY, offsetYOutput);
  setValue(fontInput, settingFontSize, fontOutput);
  changeFontSize(ctx, fontInput);
  setValue(columnNumber, settingColumn, columnNumberOutput);
}
function setValue(element, value, output) {
  if (!value) return;
  element.value = value;
  updateOutput(element, output);
}
function setStringValue(nodeList, stringValue) {
  if (!stringValue) return;
  for (let i = 0; i < nodeList.length; i++) {
    nodeList[i].checked = false;
    if (nodeList[i].value === stringValue) {
      nodeList[i].checked = true;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tabbableElements = document.querySelectorAll("[data-tabindex]");

  tabbableElements.forEach(function (element, index) {
    element.setAttribute("tabindex", index + 1);
  });
  // if (isWindows) {
  //   // Windowsの場合の処理
  // }
  if (isMobile) {
    // fontInput.value = String(12);
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
    Array.from(pc).forEach((element) => (element.style.display = "none"));
  }
  setStyles();
});

const openFile = (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.error("No file selected.");
    return;
  }
  board.style.display = "none";
  const reader = new FileReader();
  reader.onload = function () {
    canvas.style.display = "block";
    image = new Image();
    image.src = reader.result;
    image.onload = function () {
      switch (scaleRadioNodeList.value) {
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
      changeFontSize(ctx, fontInput);
      undoStates = [];
      getCurrentImageState();
      initialState = undoStates[0];
    };
  };

  reader.readAsDataURL(file);
  // 配列のファイルを削除する (インデックス0以降のすべての要素を削除)
};

fileInput.addEventListener("change", openFile);

function dividedDrawImage(divisor) {
  if (!image) return;
  canvas.width = image.width / divisor;
  canvas.height = image.height / divisor;
  // ctx.drawImage(image, 0, 0);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

//ウインドウの幅にキャンバスを合わせる
function adjustedDrawImage() {
  if (!image) return;
  const canvasWidth = Math.min(
    parseInt(window.getComputedStyle(container).width),
    image.width
  );
  canvas.width = canvasWidth;
  canvas.height = image.height * (canvasWidth / image.width);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
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

function rgbToHsb(r, g, b) {
  // Normalize RGB values to be in the range [0, 1]
  r = r / 255;
  g = g / 255;
  b = b / 255;

  let hsbMax = Math.max(r, g, b);
  let hsbMin = Math.min(r, g, b);
  let hsbH,
    hsbS,
    hsbB = hsbMax;

  let delta = hsbMax - hsbMin;

  // Calculate Hue
  if (hsbMax === hsbMin) {
    hsbH = 0; // Achromatic (gray)
  } else {
    if (hsbMax === r) {
      hsbH = ((g - b) / delta) % 6;
    } else if (hsbMax === g) {
      hsbH = (b - r) / delta + 2;
    } else {
      hsbH = (r - g) / delta + 4;
    }
    hsbH = Math.round(hsbH * 60);
    if (hsbH < 0) {
      hsbH += 360;
    }
  }

  // Calculate Saturation
  if (hsbMax === 0) {
    hsbS = 0;
  } else {
    hsbS = Math.round((delta / hsbMax) * 100);
  }

  // Calculate Brightness
  hsbB = Math.round(hsbB * 100);

  return { hsbH, hsbS, hsbB };
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

// function rgbToLab(r, g, b) {
//   // Convert RGB to XYZ using the D65 illuminant
//   let sr = r / 255;
//   let sg = g / 255;
//   let sb = b / 255;

//   sr = sr > 0.04045 ? Math.pow((sr + 0.055) / 1.055, 2.4) : sr / 12.92;
//   sg = sg > 0.04045 ? Math.pow((sg + 0.055) / 1.055, 2.4) : sg / 12.92;
//   sb = sb > 0.04045 ? Math.pow((sb + 0.055) / 1.055, 2.4) : sb / 12.92;

//   sr *= 100;
//   sg *= 100;
//   sb *= 100;

//   const x = sr * 0.4124564 + sg * 0.3575761 + sb * 0.1804375;
//   const y = sr * 0.2126729 + sg * 0.7151522 + sb * 0.072175;
//   const z = sr * 0.0193339 + sg * 0.119192 + sb * 0.9503041;

//   // Normalize XYZ to the reference white point D65
//   let xN = x / 95.047;
//   let yN = y / 100.0;
//   let zN = z / 108.883;

//   xN = xN > 0.008856 ? Math.pow(xN, 1 / 3) : xN * 903.3 + 16 / 116;
//   yN = yN > 0.008856 ? Math.pow(yN, 1 / 3) : yN * 903.3 + 16 / 116;
//   zN = zN > 0.008856 ? Math.pow(zN, 1 / 3) : zN * 903.3 + 16 / 116;

//   const labL = Math.round(Math.max(0, 116 * yN - 16));
//   const labA = Math.round((xN - yN) * 500);
//   const labB = Math.round((yN - zN) * 200);

//   return { labL, labA, labB };
// }
function xyzToLab(x, y, z) {
  // // Convert RGB to XYZ
  // r /= 255;
  // g /= 255;
  // b /= 255;

  // if (r > 0.04045) {
  //   r = Math.pow((r + 0.055) / 1.055, 2.4);
  // } else {
  //   r = r / 12.92;
  // }

  // if (g > 0.04045) {
  //   g = Math.pow((g + 0.055) / 1.055, 2.4);
  // } else {
  //   g = g / 12.92;
  // }

  // if (b > 0.04045) {
  //   b = Math.pow((b + 0.055) / 1.055, 2.4);
  // } else {
  //   b = b / 12.92;
  // }

  // r *= 100;
  // g *= 100;
  // b *= 100;

  // const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  // const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  // const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  // Convert XYZ to CIELAB
  const labX = x * 100;
  const labY = y * 100;
  const labZ = z * 100;

  // D50
  const refX = 96.422;
  const refY = 100.0;
  const refZ = 82.521;

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

function labToLch(L, a, b) {
  // Calculate the chroma (C)
  let chroma = Math.sqrt(a * a + b * b);

  // Calculate the hue (H) in degrees
  let hue = Math.atan2(b, a) * (180 / Math.PI);

  // Ensure the hue is in the range [0, 360]
  if (hue < 0) {
    hue = ((hue % 360) + 360) % 360;
  }

  // Calculate the lightness (L), and round it to 2 decimal places
  L = Math.round(L);

  // Calculate the chroma (C), and round it to 2 decimal places
  chroma = Math.round(chroma);

  // Calculate the hue (H), and round it to 2 decimal places
  hue = Math.round(hue);

  return { lchL: L, lchC: chroma, lchH: hue };
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

function changeColorMode(colorModeValue) {
  switch (colorModeValue) {
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
    case "hsb":
      if (isInitialValue) {
        colorInfoElement.textContent = `H:-- S:-- B:--`;
        break;
      }
      colorCode = `h:${hsb.hsbH} s:${hsb.hsbS} b:${hsb.hsbB}`;
      colorInfoElement.textContent = `H:${hsb.hsbH} S:${hsb.hsbS} B:${hsb.hsbB}`;
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
      break;
    case "lch":
      if (isInitialValue) {
        colorInfoElement.textContent = `L:-- C:-- H:--`;
        break;
      }
      colorCode = `lch(${lch.lchL}% ${lch.lchC} ${lch.lchH})`;
      colorInfoElement.textContent = `L:${lch.lchL} C:${lch.lchC} H:${lch.lchH}`;
      break;
    case "hsl+l":
      if (isInitialValue) {
        colorInfoElement.textContent = `h:-- s:-- l:-- L:--`;
        break;
      }
      colorCode = `h:${hsl.h} s:${hsl.s} l:${hsl.l} L:${lab.labL}`;
      colorInfoElement.textContent = `h:${hsl.h} s:${hsl.s} l:${hsl.l} L:${lab.labL}`;
    default:
      break;
  }
}

function getCurrentImageState() {
  currentStates = ctx.getImageData(0, 0, image.width, image.height);
  undoStates.unshift(currentStates);
}

// function to undo
function undo() {
  if (undoStates.length <= 1) return;
  let firstUndoStates = undoStates.shift();
  redoStates.unshift(firstUndoStates);
  // redraw canvas
  ctx.putImageData(undoStates[0], 0, 0);
}

// function to redo
function redo() {
  // check if there's a next state in the array
  if (redoStates.length === 0) return;
  let firstRedoStates = redoStates.shift();
  undoStates.unshift(firstRedoStates);
  // redraw canvas
  ctx.putImageData(undoStates[0], 0, 0);
}

function clearCanvas() {
  if (!initialState) return;
  if (initialState === undoStates[0]) return;
  undoStates.unshift(initialState);
  redoStates = [];
  ctx.putImageData(initialState, 0, 0);
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
  lineHeight,
  textPositionX,
  textPositionY,
  fontSize,
  offsetX,
  offsetY,
  columnNumber
) {
  const colorElements = colorText.split(" ");
  const padding = 4 + (fontSize * 2) / 15;
  const margin = 4 + (fontSize * 2) / 15;
  const magicNumber = 1;
  let drawingPositionX = 0;
  let drawingPositionY = 0;
  let xOffset = 0;
  let yOffset = 0;
  let maxWidth = 0;

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
    const lineWidth = context.measureText(colorElement).width;
    const offsetXValue = [0, 1, 2, 3, 4];
    const offsetYValue = [0, 0.5, 1, 1.5, 2];
    const textSpaceWidth = lineWidth + padding * 2;
    const textSpaceHeight = lineHeight + padding;
    const offSetXWidth = fontSize * columnNumber;
    let xOffsetAdjustment = fontSize / 3 + fontSize / 2;
    let yOffsetAdjustment = fontSize / 2;
    let colorSet;

    if (document.forms.pointer[1].checked) {
      xOffsetAdjustment = 0;
      yOffsetAdjustment = 0;
    }

    switch (colorMode.elements.colorMode.value) {
      case "hsl+l":
        colorSet = [
          [hsl.h, hsl.h, hsl.h, 0],
          [100, hsl.s, hsl.s, 0],
          [50, 50, hsl.l, lab.labL],
        ];
        context.fillStyle = `hsl(${colorSet[0][i]} ${colorSet[1][i]}% ${colorSet[2][i]}%)`;
        break;
      default:
        context.fillStyle = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
        break;
    }

    if (textPositionX === "left") {
      xOffset =
        -xOffsetAdjustment -
        maxWidth -
        offSetXWidth * offsetXValue[offsetX] -
        magicNumber;
    } else {
      xOffset = xOffsetAdjustment + offSetXWidth * offsetXValue[offsetX];
    }
    if (textPositionY === "top") {
      yOffset =
        -yOffsetAdjustment -
        (textSpaceHeight + margin) *
          Math.ceil(colorElements.length / columnNumber) -
        (textSpaceHeight + margin) *
          Math.ceil(colorElements.length / columnNumber) *
          offsetYValue[offsetY];
    } else {
      yOffset =
        yOffsetAdjustment +
        (textSpaceHeight + margin) *
          Math.ceil(colorElements.length / columnNumber) *
          offsetYValue[offsetY];
    }

    context.textBaseline = "top";

    drawRoundedRectangle(
      context,
      pointX + drawingPositionX + xOffset,
      pointY + drawingPositionY + yOffset,
      textSpaceWidth,
      textSpaceHeight,
      padding,
      false
    );

    switch (colorMode.elements.colorMode.value) {
      case "hsl+l":
        if (i === 0) {
          const baseColorRgb = hslToRgb(hsl.h, 100, 50);
          const contrastColor =
            getGreyScaleColorWithHighestContrast(baseColorRgb);
          context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
          break;
        }
        if (i === 1) {
          const baseColorRgb = hslToRgb(hsl.h, hsl.s, 50);
          const contrastColor =
            getGreyScaleColorWithHighestContrast(baseColorRgb);
          context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
          break;
        }
        if (i === 2) {
          const contrastColor = getGreyScaleColorWithHighestContrast(rgb);
          context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
          break;
        }
        if (i === 3) {
          const contrastColor = getGreyScaleColorWithHighestContrast(rgb);
          context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
          break;
        }
      default:
        const contrastColor = getGreyScaleColorWithHighestContrast(rgb);
        context.fillStyle = `rgb( ${contrastColor[0]}, ${contrastColor[1]}, ${contrastColor[2]})`;
        break;
    }

    context.fillText(
      colorElement,
      pointX + drawingPositionX + xOffset + padding,
      pointY + drawingPositionY + yOffset + padding
    );

    if ((i + 1) % columnNumber === 0) {
      drawingPositionY += textSpaceHeight + margin;
      drawingPositionX = 0;
    } else {
      drawingPositionX += textSpaceWidth + margin;
    }
  }
}

// クリックしたら色データをキャンバスに描画
canvas.addEventListener("click", function (e) {
  const x = e.offsetX + clickPointAdjustment;
  const y = e.offsetY + clickPointAdjustment;
  const color = ctx.getImageData(x, y, 1, 1).data;
  rgb = [color[0], color[1], color[2]];
  hex = rgbToHex(color[0], color[1], color[2]);
  hsl = rgbToHsl(color[0], color[1], color[2]);
  hsb = rgbToHsb(color[0], color[1], color[2]);
  xyz = rgbToXyzD65(color[0], color[1], color[2]);
  xyzD50 = bradfordTransformationD65toD50(xyz);
  lab = xyzToLab(xyzD50[0], xyzD50[1], xyzD50[2]);
  lch = labToLch(lab.labL, lab.labA, lab.labB);
  console.log("xyz:", xyz);
  console.log("xyzD50:", xyzD50);
  console.log("lab:", lab);
  console.log("lch:", lch);
  colorInfoElement.style.setProperty(
    "--background-color",
    `rgb(${color[0]}, ${color[1]}, ${color[2]})`
  );
  isInitialValue = false;
  changeColorMode(colorMode.elements.colorMode.value);
});

canvas.addEventListener("click", function (event) {
  const pointX = event.offsetX;
  const pointY = event.offsetY;
  const colorInfoElement = document.getElementById("colorInfo");
  const colorText = `${colorInfoElement.textContent}`;
  const fontSize = parseInt(fontInput.value);
  const offsetXValue = parseInt(offsetX.value);
  const offsetYValue = parseInt(offsetY.value);
  const lineHeight = fontSize * 1.3;
  const textPositionX = positionXRadioNodeList.value;
  const textPositionY = positionYRadioNodeList.value;
  const columnNumberValue = parseInt(columnNumber.value);

  // 新しい描画を行う
  drawMultilineText(
    ctx,
    colorText,
    pointX,
    pointY,
    lineHeight,
    textPositionX,
    textPositionY,
    fontSize,
    offsetXValue,
    offsetYValue,
    columnNumberValue
  );

  ctx.fillStyle = `hsl( 0, 0%, 100%)`;
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = `hsl( 0, 0%, 0%)`;

  if (pointerRadioNodeList.value === "on") {
    if (lab.labL > 85) {
      ctx.beginPath();
      ctx.moveTo(pointX - 7.5, pointY + clickPointAdjustment + 3);
      ctx.lineTo(pointX - 2.5, pointY + clickPointAdjustment + 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pointX + 1.5, pointY + clickPointAdjustment + 3);
      ctx.lineTo(pointX + 7, pointY + clickPointAdjustment + 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pointX + clickPointAdjustment, pointY - 2.5);
      ctx.lineTo(pointX + clickPointAdjustment + 3.5, pointY - 2.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pointX + clickPointAdjustment, pointY + 6.5);
      ctx.lineTo(pointX + clickPointAdjustment + 3.5, pointY + 6.5);
      ctx.stroke();
    }

    ctx.fillRect(pointX - 7.5, pointY + clickPointAdjustment, 5, 3);
    ctx.fillRect(pointX + 1.5, pointY + clickPointAdjustment, 5.2, 3);
    ctx.fillRect(pointX + clickPointAdjustment, pointY - 7.5, 3.5, 5);
    ctx.fillRect(pointX + clickPointAdjustment, pointY + 1.5, 3.5, 5);
  }

  // update current state
  redoStates = [];
  getCurrentImageState();
  if (undoStates.length > undoStatesLimitNumber) {
    undoStates.length = undoStatesLimitNumber;
  }
});

/// keyboard shortcuts ///

// Add event listeners to track the state of each key
document.addEventListener("keydown", (event) => {
  if (event.key === "r") {
    if (keyMeta) return;

    fileInput.click();
  }
  if (event.key === "w") {
    fontInput.value = (parseInt(fontInput.value) + 1).toString();
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
    localStorage.setItem("fontSize", fontInput.value);
  }
  if (event.key === "q") {
    fontInput.value = (parseInt(fontInput.value) - 1).toString();
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
    localStorage.setItem("fontSize", fontInput.value);
  }
  if (event.key === "h") {
    offsetX.value = (parseInt(offsetX.value) + 1).toString();
    updateOutput(offsetX, offsetXOutput);
    localStorage.setItem("offsetX", offsetX.value);
  }
  if (event.key === "g") {
    offsetX.value = (parseInt(offsetX.value) - 1).toString();
    updateOutput(offsetX, offsetXOutput);
    localStorage.setItem("offsetX", offsetX.value);
  }
  if (event.key === "y") {
    offsetY.value = (parseInt(offsetY.value) + 1).toString();
    updateOutput(offsetY, offsetYOutput);
    localStorage.setItem("offsetY", offsetY.value);
  }
  if (event.key === "t") {
    offsetY.value = (parseInt(offsetY.value) - 1).toString();
    updateOutput(offsetY, offsetYOutput);
    localStorage.setItem("offsetY", offsetY.value);
  }
  if (event.key === "a") {
    if (keyMeta) return;
    changeCheckedPositionX();
  }
  if (event.key === "s") {
    if (keyMeta) return;
    changeCheckedPositionY();
  }
  if (event.key === "p") {
    if (keyMeta) return;

    debouncedDownload();
  }
  if (event.key === "d") {
    if (keyMeta) return;

    changeCheckedScale();
  }
  if (event.key === "l") {
    if (keyMeta) return;

    changeCheckedFormat();
  }
  if (event.key === "e") {
    if (keyMeta) return;

    clearCanvas();
  }
  if (event.key === "x") {
    if (keyMeta) return;

    columnNumber.value = (parseInt(columnNumber.value) + 1).toString();
    updateOutput(columnNumber, columnNumberOutput);
    localStorage.setItem("column", columnNumber.value);
  }
  if (event.key === "z") {
    if (keyMeta) return;

    columnNumber.value = (parseInt(columnNumber.value) - 1).toString();
    updateOutput(columnNumber, columnNumberOutput);
    localStorage.setItem("column", columnNumber.value);
  }
  if (event.key === "Escape") {
    navToggle();
  }
  if (event.key === "u") {
    menu.classList.toggle("show");
  }
  if (event.key === "v") {
    if (keyMeta) return;
    changeCheckedColorMode();
  }
  if (event.key === "i") {
    if (keyMeta) return;
    changeCheckedPointer();
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
  // Canvasのイメージデータを取得する
  let imageData;
  if (png.checked) {
    imageData = canvas.toDataURL("image/png");
  } else {
    imageData = canvas.toDataURL("image/webP", 0.8);
  }

  // ダウンロード用のリンクを作成する
  const downloadLink = document.createElement("a");
  downloadLink.href = imageData;
  if (png.checked) {
    downloadLink.download = "image.png";
  } else {
    downloadLink.download = "image.webp";
  }

  // リンクをクリックすることでダウンロードを実行する
  downloadLink.click();
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

function changeFontSize(context, fontInput) {
  const fontSize = parseInt(fontInput.value);
  context.font = `500 ${fontSize}px 'Inter','Helvetica Neue', Arial, sans-serif `;
}

fontInput.addEventListener("input", function () {
  changeFontSize(ctx, fontInput);
});

function updateOutput(inputField, outputField) {
  const inputValue = inputField.value; // 入力値を取得
  outputField.textContent = inputValue; // 出力要素に処理後の値を表示
}

function changeCheckedColorMode() {
  for (let i = 0; i < colorMode.length; i++) {
    if (colorMode[i].checked) {
      colorMode[i].checked = false;
      if (i + 1 === colorMode.length) {
        colorMode[0].checked = true;
        changeColorMode(colorModeNodeList.value);
        localStorage.setItem("colorMode", colorMode[0].value);
        break;
      } else {
        colorMode[i + 1].checked = true;
        changeColorMode(colorModeNodeList.value);
        localStorage.setItem("colorMode", colorMode[i + 1].value);
        break;
      }
    }
  }
}

function changeCheckedScale() {
  for (let i = 0; i < scaleRadioNodeList.length; i++) {
    if (scaleRadioNodeList[i].checked) {
      scaleRadioNodeList[i].checked = false;
      if (i + 1 === scaleRadioNodeList.length) {
        scaleRadioNodeList[0].checked = true;
        localStorage.setItem("scale", scaleRadioNodeList[0].value);
        break;
      } else {
        scaleRadioNodeList[i + 1].checked = true;
        localStorage.setItem("scale", scaleRadioNodeList[i + 1].value);
        break;
      }
    }
  }
}
function changeCheckedFormat() {
  for (let i = 0; i < dataTypeRadioNodeList.length; i++) {
    if (dataTypeRadioNodeList[i].checked) {
      dataTypeRadioNodeList[i].checked = false;
      if (i + 1 === dataTypeRadioNodeList.length) {
        dataTypeRadioNodeList[0].checked = true;
        localStorage.setItem("format", dataTypeRadioNodeList[0].value);
        break;
      } else {
        dataTypeRadioNodeList[i + 1].checked = true;
        localStorage.setItem("format", dataTypeRadioNodeList[i + 1].value);
        break;
      }
    }
  }
}

function changeCheckedPositionX() {
  for (let i = 0; i < positionXRadioNodeList.length; i++) {
    if (positionXRadioNodeList[i].checked) {
      positionXRadioNodeList[i].checked = false;
      if (i + 1 === positionXRadioNodeList.length) {
        positionXRadioNodeList[0].checked = true;
        localStorage.setItem("positionX", positionXRadioNodeList[0].value);
        break;
      } else {
        positionXRadioNodeList[i + 1].checked = true;
        localStorage.setItem("positionX", positionXRadioNodeList[i + 1].value);
        break;
      }
    }
  }
}

function changeCheckedPositionY() {
  for (let i = 0; i < positionYRadioNodeList.length; i++) {
    if (positionYRadioNodeList[i].checked) {
      positionYRadioNodeList[i].checked = false;
      if (i + 1 === positionYRadioNodeList.length) {
        positionYRadioNodeList[0].checked = true;
        localStorage.setItem("positionY", positionYRadioNodeList[0].value);
        break;
      } else {
        positionYRadioNodeList[i + 1].checked = true;
        localStorage.setItem("positionY", positionYRadioNodeList[i + 1].value);
        break;
      }
    }
  }
}
function changeCheckedPointer() {
  for (let i = 0; i < pointerRadioNodeList.length; i++) {
    if (pointerRadioNodeList[i].checked) {
      pointerRadioNodeList[i].checked = false;
      if (i + 1 === pointerRadioNodeList.length) {
        pointerRadioNodeList[0].checked = true;
        localStorage.setItem("pointer", pointerRadioNodeList[0].value);
        break;
      } else {
        pointerRadioNodeList[i + 1].checked = true;
        localStorage.setItem("pointer", pointerRadioNodeList[i + 1].value);
        break;
      }
    }
  }
}

fileButton.addEventListener("click", function () {
  if (!!isMobile) {
    navToggle();
  }
});
clear.addEventListener("click", function () {
  if (!!isMobile) {
    navToggle();
  }
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
    offsetYSubtract.blur();
  }
});
offsetYSubtract.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetY.value);
    count -= 1;
    offsetY.value = String(count);
    updateOutput(offsetY, offsetYOutput);
    localStorage.setItem("offsetY", offsetY.value);
    offsetYSubtract.blur();
  }
});
fontSizeAdd.addEventListener("click", function () {
  let count = parseInt(fontInput.value);
  count += 1;
  fontInput.value = String(count);
  updateOutput(fontInput, fontOutput);
  changeFontSize(ctx, fontInput);
  localStorage.setItem("fontSize", fontInput.value);
});
fontSizeSubtract.addEventListener("click", function () {
  let count = parseInt(fontInput.value);
  count -= 1;
  fontInput.value = String(count);
  updateOutput(fontInput, fontOutput);
  changeFontSize(ctx, fontInput);
  localStorage.setItem("fontSize", fontInput.value);
});
fontSizeAdd.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(fontInput.value);
    count += 1;
    fontInput.value = String(count);
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
    localStorage.setItem("fontSize", fontInput.value);
  }
});
fontSizeSubtract.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(fontInput.value);
    count -= 1;
    fontInput.value = String(count);
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
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

function navToggle() {
  menu.classList.toggle("close");
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
