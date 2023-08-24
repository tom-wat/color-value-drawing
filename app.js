const board = document.getElementById("board");
const note = document.querySelector(".note");
const fileButton = document.getElementById("file-button");
const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const container = document.querySelector(".container");
const dataType = document.getElementById("data-type");
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

const isMobile = navigator.userAgent.match(
  /(iPhone|iPod|iPad|Android|BlackBerry)/
);
const dataTypeRadioNodeList = dataType.type;
const scaleRadioNodeList = scale.scale;
const positionXRadioNodeList = drawingPositionX.positionX;
const positionYRadioNodeList = drawingPositionY.positionY;

const undoStatesLimitNumber = 50;
let rgb;
let hsb;
let lab;
let colorCode;
let image;
let undoStates = [];
let redoStates = [];
let initialState;
let currentStates;

document.addEventListener("DOMContentLoaded", function () {
  const tabbableElements = document.querySelectorAll("[data-tabindex]");

  tabbableElements.forEach(function (element, index) {
    element.setAttribute("tabindex", index + 1);
  });

  if (isMobile) {
    fontInput.value = String(12);
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
    scaleQuarter.checked = true;
    note.style.display = "none";
  }
});

function updateOutput(inputField, outputField) {
  const inputValue = inputField.value; // 入力値を取得

  outputField.textContent = inputValue; // 出力要素に処理後の値を表示
}
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

function rgbToLab(r, g, b) {
  // Convert RGB to XYZ
  r /= 255;
  g /= 255;
  b /= 255;

  if (r > 0.04045) {
    r = Math.pow((r + 0.055) / 1.055, 2.4);
  } else {
    r = r / 12.92;
  }

  if (g > 0.04045) {
    g = Math.pow((g + 0.055) / 1.055, 2.4);
  } else {
    g = g / 12.92;
  }

  if (b > 0.04045) {
    b = Math.pow((b + 0.055) / 1.055, 2.4);
  } else {
    b = b / 12.92;
  }

  r *= 100;
  g *= 100;
  b *= 100;

  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  // Convert XYZ to CIELAB
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  let xRatio = x / refX;
  let yRatio = y / refY;
  let zRatio = z / refZ;

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

function download() {
  if (!!initialState === false) {
    return;
  }
  // Canvasのイメージデータを取得する
  let imageData;
  if (png.checked) {
    imageData = canvas.toDataURL("image/png");
  } else {
    imageData = canvas.toDataURL("image/webP", 0.75);
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

function changeCheckedScale() {
  for (let i = 0; i < scaleRadioNodeList.length; i++) {
    if (scaleRadioNodeList[i].checked) {
      scaleRadioNodeList[i].checked = false;
      if (i + 1 === scaleRadioNodeList.length) {
        scaleRadioNodeList[0].checked = true;
        break;
      } else {
        scaleRadioNodeList[i + 1].checked = true;
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
        break;
      } else {
        dataTypeRadioNodeList[i + 1].checked = true;
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
        break;
      } else {
        positionXRadioNodeList[i + 1].checked = true;
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
        break;
      } else {
        positionYRadioNodeList[i + 1].checked = true;
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
});
offsetXSubtract.addEventListener("click", function () {
  let count = parseInt(offsetX.value);
  count -= 1;
  offsetX.value = String(count);
  updateOutput(offsetX, offsetXOutput);
});
offsetXAdd.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetX.value);
    count += 1;
    offsetX.value = String(count);
    updateOutput(offsetX, offsetXOutput);
  }
});
offsetXSubtract.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetX.value);
    count -= 1;
    offsetX.value = String(count);
    updateOutput(offsetX, offsetXOutput);
  }
});
offsetYAdd.addEventListener("click", function () {
  let count = parseInt(offsetY.value);
  count += 1;
  offsetY.value = String(count);
  updateOutput(offsetY, offsetYOutput);
});
offsetYSubtract.addEventListener("click", function () {
  let count = parseInt(offsetY.value);
  count -= 1;
  offsetY.value = String(count);
  updateOutput(offsetY, offsetYOutput);
});
offsetYAdd.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetY.value);
    count += 1;
    offsetY.value = String(count);
    updateOutput(offsetY, offsetYOutput);
    offsetYSubtract.blur();
  }
});
offsetYSubtract.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(offsetY.value);
    count -= 1;
    offsetY.value = String(count);
    updateOutput(offsetY, offsetYOutput);
    offsetYSubtract.blur();
  }
});
fontSizeAdd.addEventListener("click", function () {
  let count = parseInt(fontInput.value);
  count += 1;
  fontInput.value = String(count);
  updateOutput(fontInput, fontOutput);
  changeFontSize(ctx, fontInput);
});
fontSizeSubtract.addEventListener("click", function () {
  let count = parseInt(fontInput.value);
  count -= 1;
  fontInput.value = String(count);
  updateOutput(fontInput, fontOutput);
  changeFontSize(ctx, fontInput);
});
fontSizeAdd.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(fontInput.value);
    count += 1;
    fontInput.value = String(count);
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
  }
});
fontSizeSubtract.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(fontInput.value);
    count -= 1;
    fontInput.value = String(count);
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
  }
});
columnAdd.addEventListener("click", function (event) {
  // event.stopPropagation();
  let count = parseInt(columnNumber.value);
  count += 1;
  columnNumber.value = String(count);
  updateOutput(columnNumber, columnNumberOutput);
});
columnSubtract.addEventListener("click", function (event) {
  // event.stopPropagation();
  let count = parseInt(columnNumber.value);
  count -= 1;
  columnNumber.value = String(count);
  updateOutput(columnNumber, columnNumberOutput);
});
columnAdd.addEventListener("keydown", (event) => {
  // event.stopPropagation();
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(columnNumber.value);
    count += 1;
    columnNumber.value = String(count);
    updateOutput(columnNumber, columnNumberOutput);
  }
});
columnSubtract.addEventListener("keydown", (event) => {
  // event.stopPropagation();
  if (event.key === "Enter" || event.key === " ") {
    let count = parseInt(columnNumber.value);
    count -= 1;
    columnNumber.value = String(count);
    updateOutput(columnNumber, columnNumberOutput);
  }
});

function changeFontSize(context, fontInput) {
  const fontSize = parseInt(fontInput.value);

  context.font = `500 ${fontSize}px 'Inter','Helvetica Neue', Arial, sans-serif `;
}

fontInput.addEventListener("input", function () {
  changeFontSize(ctx, fontInput);
});

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
    const xOffsetAdjustment = fontSize / 3 + fontSize / 2;
    const yOffsetAdjustment = fontSize / 2;
    const offSetXWidth = fontSize * columnNumber;

    let colorSet = [
      [hsl.h, hsl.h, hsl.h, 0],
      [100, hsl.s, hsl.s, 0],
      [50, 50, hsl.l, lab.labL],
    ];

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
    context.fillStyle = `hsl( ${colorSet[0][i]} ${colorSet[1][i]}% ${colorSet[2][i]}%`;

    drawRoundedRectangle(
      context,
      pointX + drawingPositionX + xOffset,
      pointY + drawingPositionY + yOffset,
      textSpaceWidth,
      textSpaceHeight,
      padding,
      false
    );

    context.fillStyle = `hsl( 0, 0%, 10%)`;
    if ((i === 0 && hsl.h < 20) || (i === 0 && hsl.h > 200)) {
      context.fillStyle = `hsl( 0, 0%, 94%)`;
    }
    if (
      (i === 1 && hsl.h < 45) ||
      (i === 1 && hsl.h > 200) ||
      (i === 1 && hsl.h > 45 && hsl.s < 60) ||
      (i === 1 && hsl.h < 200 && hsl.s < 60)
    ) {
      context.fillStyle = `hsl( 0, 0%, 94%)`;
    }
    if (i === 2 && hsl.l <= 50) {
      context.fillStyle = `hsl( 0, 0%, 94%)`;
    }
    if (i === 3 && lab.labL < 60) {
      context.fillStyle = `hsl( 0, 0%, 94%)`;
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
  hsl = rgbToHsl(color[0], color[1], color[2]);
  lab = rgbToLab(color[0], color[1], color[2]);
  const colorInfoElement = document.getElementById("colorInfo");
  colorInfoElement.style.setProperty(
    "--background-color",
    `rgb(${color[0]}, ${color[1]}, ${color[2]})`
  );
  colorCode = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  colorInfoElement.textContent = `h:${hsl.h} s:${hsl.s} l:${hsl.l} L:${lab.labL}`;
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
  const cornerRadius = 2;
  // クリックした場所のピクセルカラー情報を取得する
  // const color = ctx.getImageData(x, y, 1, 1).data;

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

  ctx.lineWidth = 1.5;
  // ctx.fillStyle = `hsl( 0, 0%, ${colorInput.value}%, ${alphaInput.value}%)`;
  ctx.fillStyle = `hsl( 0, 0%, 100%)`;
  ctx.strokeStyle = `hsl( 0, 0%, 70%)`;

  // ctx.lineWidth = 2;
  // ctx.strokeStyle = `hsl( 0, 0%, ${colorInput.value}%, ${alphaInput.value}%)`;

  // ctx.strokeRect(
  //   pointX - fontSize / 2,
  //   pointY - fontSize / 2,
  //   fontSize - 2,
  //   fontSize - 2
  // );
  // ctx.fillRect(pointX - 10.5, pointY - 2, 6, 3);
  // ctx.fillRect(pointX + 4.5, pointY - 2, 6, 3);
  // ctx.fillRect(pointX - 1.5, pointY - 10.5, 3.5, 6);
  // ctx.fillRect(pointX - 1.5, pointY + 3.5, 3.5, 6);
  if (lab.labL > 85) {
    ctx.shadowColor = `hsl( 0, 0%, 70%)`; // 影の色
    ctx.shadowOffsetY = 1;
  }
  drawRoundedRectangle(
    ctx,
    pointX - 12.5,
    pointY + clickPointAdjustment,
    10,
    3,
    cornerRadius,
    false
  );
  drawRoundedRectangle(
    ctx,
    pointX + 1.5,
    pointY + clickPointAdjustment,
    10,
    3,
    cornerRadius,
    false
  );
  drawRoundedRectangle(
    ctx,
    pointX + clickPointAdjustment,
    pointY - 12,
    3.5,
    10,
    cornerRadius,
    false
  );
  drawRoundedRectangle(
    ctx,
    pointX + clickPointAdjustment,
    pointY + 1,
    3.5,
    10,
    cornerRadius,
    false
  );
  // ctx.fillRect(pointX - 12.5, pointY + clickPointAdjustment, 10, 3);
  // ctx.fillRect(pointX + 2, pointY + clickPointAdjustment, 10, 3);
  // ctx.fillRect(pointX + clickPointAdjustment, pointY - 12, 3.5, 10);
  // ctx.fillRect(pointX + clickPointAdjustment, pointY + 1.5, 3.5, 10);

  // ctx.fillRect(pointX - 12.5, pointY + clickPointAdjustment, 8, 3);
  // ctx.fillRect(pointX + 3.5, pointY + clickPointAdjustment, 8, 3);
  // ctx.fillRect(pointX + clickPointAdjustment, pointY - 12, 3.5, 8);
  // ctx.fillRect(pointX + clickPointAdjustment, pointY + 3, 3.5, 8);

  // ctx.fillRect(pointX - 12.5, pointY - 2, 8, 1.5);
  // ctx.fillRect(pointX + 3.5, pointY - 2, 8, 1.5);
  // ctx.fillRect(pointX - 1.5, pointY - 12.5, 2, 8);
  // ctx.fillRect(pointX - 1.5, pointY + 2.5, 2, 8);

  // //水平線
  // ctx.beginPath();
  // ctx.moveTo(pointX - 8.5, pointY + clickPointAdjustment);
  // ctx.lineTo(pointX + 4.5, pointY + clickPointAdjustment);
  // ctx.stroke();

  // // 垂直線
  // ctx.beginPath();
  // ctx.moveTo(pointX + clickPointAdjustment, pointY - 8);
  // ctx.lineTo(pointX + clickPointAdjustment, pointY + 4.5);
  // ctx.stroke();

  ctx.shadowOffsetY = 0;

  // update current state
  redoStates = [];
  getCurrentImageState();
  if (undoStates.length > undoStatesLimitNumber) {
    undoStates.length = undoStatesLimitNumber;
  }
});

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

// keyboard shortcuts

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
    //   tooltip1.textContent = `font-size: ${fontInput.value}`;
    //   tooltip1.style.width = `${tooltip1.textContent.length * 7}px`;
  }
  if (event.key === "q") {
    fontInput.value = (parseInt(fontInput.value) - 1).toString();
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
    // tooltip1.textContent = `font-size: ${fontInput.value}`;
    // tooltip1.style.width = `${tooltip1.textContent.length * 7}px`;
  }
  if (event.key === "h") {
    offsetX.value = (parseInt(offsetX.value) + 1).toString();
    updateOutput(offsetX, offsetXOutput);
  }
  if (event.key === "g") {
    offsetX.value = (parseInt(offsetX.value) - 1).toString();
    updateOutput(offsetX, offsetXOutput);
  }
  if (event.key === "y") {
    offsetY.value = (parseInt(offsetY.value) + 1).toString();
    updateOutput(offsetY, offsetYOutput);
  }
  if (event.key === "t") {
    offsetY.value = (parseInt(offsetY.value) - 1).toString();
    updateOutput(offsetY, offsetYOutput);
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
  }
  if (event.key === "z") {
    if (keyMeta) return;

    columnNumber.value = (parseInt(columnNumber.value) - 1).toString();
    updateOutput(columnNumber, columnNumberOutput);
  }
  if (event.key === "Escape") {
    navToggle();
  }
  if (event.key === "v") {
    menu.classList.toggle("show");
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
  // if (keyShift) {
  //   if (keyArrowUp) {
  //     fontInput.value = (parseInt(fontInput.value) + 1).toString();
  //     fontInput.nextElementSibling.value = fontInput.value;
  //     changeFontSize(ctx, fontInput);
  //     keyArrowUp = false;
  //   }
  //   if (keyArrowLeft) {
  //     colorInput.value = (parseInt(colorInput.value) - 10).toString();
  //     colorInput.nextElementSibling.value = colorInput.value;
  //     changeColor(ctx, colorInput, alphaInput);
  //     keyArrowLeft = false;
  //   }
  //   if (keyArrowDown) {
  //     fontInput.value = (parseInt(fontInput.value) - 1).toString();
  //     fontInput.nextElementSibling.value = fontInput.value;
  //     changeFontSize(ctx, fontInput);
  //     keyArrowDown = false;
  //   }
  //   if (keyArrowRight) {
  //     colorInput.value = (parseInt(colorInput.value) + 10).toString();
  //     colorInput.nextElementSibling.value = colorInput.value;
  //     changeColor(ctx, colorInput, alphaInput);
  //     keyArrowRight = false;
  //   }
  // }
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

function navToggle() {
  menu.classList.toggle("close");
}

async function copyToClipboard() {
  if (!colorCode) {
    return;
  }
  try {
    await navigator.clipboard.writeText(colorCode);
  } catch (err) {
    console.error("テキストのコピーに失敗しました:", err);
  }
}
