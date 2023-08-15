const fileButton = document.getElementById("file-button");
const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const container = document.querySelector(".container");
const scale = document.getElementById("scale");
const fontInput = document.getElementById("font-size-input");
const fontOutput = document.getElementById("font-size-output");
const fontSizeAdd = document.getElementById("font-size-add");
const fontSizeSubtract = document.getElementById("font-size-subtract");
// const colorInput = document.getElementById("font-color-input");
// const alphaInput = document.getElementById("font-color-alpha-input");
const columnNumber = document.getElementById("column-number");
const columnNumberOutput = document.getElementById("column-number-output");
const columnAdd = document.getElementById("column-add");
const columnSubtract = document.getElementById("column-subtract");
const downloadBtn = document.getElementById("download-btn");
const navigation = document.getElementById("navigation");
const closeButton = document.getElementById("close-button");
const drawingPositionX = document.getElementById("data-drawing-position-x");
const drawingPositionY = document.getElementById("data-drawing-position-y");
const offsetX = document.getElementById("offset-x");
const offsetXOutput = document.getElementById("offset-x-output");
const offsetXadd = document.getElementById("offset-x-add");
const offsetXSubtract = document.getElementById("offset-x-subtract");
const offsetYadd = document.getElementById("offset-y-add");
const offsetYSubtract = document.getElementById("offset-y-subtract");
const offsetY = document.getElementById("offset-y");
const offsetYOutput = document.getElementById("offset-y-output");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const clickPointAdjustment = -2;

// console.log(offsetX);
// console.log(offsetXOutput);
// const tooltip1 = document.getElementById("tooltip1");
// const tooltip2 = document.getElementById("tooltip2");
// const tooltip3 = document.getElementById("tooltip3");
// const tooltip4 = document.getElementById("tooltip4");
// const tooltip5 = document.getElementById("tooltip5");
// const tooltip6 = document.getElementById("tooltip6");
// const tooltip7 = document.getElementById("tooltip7");
// const tooltip8 = document.getElementById("tooltip8");
// const tooltipPositionAdjustmentValueX = 15;
// const tooltipPositionAdjustmentValueY = 15;
// const tooltipInlineMargin = 10;
// const tooltipBlockMargin = 10;

const scaleRadioNodeList = scale.scale;
const positionXRadioNodeList = drawingPositionX.positionX;
const positionYRadioNodeList = drawingPositionY.positionY;

// console.log(scaleRadioNodeList.value);
const undoStatesLimitNumber = 50;
let rgb;
let hsb;
let lab;
let image;
let undoStates = [];
let redoStates = [];
let initialState;
let currentStates;

function updateOutput(inputField, outputField) {
  const inputValue = inputField.value; // 入力値を取得

  outputField.textContent = inputValue; // 出力要素に処理後の値を表示
}
const openFile = (event) => {
  console.log(event.target.files);
  const file = event.target.files[0];
  if (!file) {
    console.error("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    canvas.style.display = "block";
    image = new Image();
    image.src = reader.result;
    image.onload = function () {
      // if (fullScale.checked) {
      //   dividedDrawImage(1);
      // } else {
      //   adjustedDrawImage();
      // }
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
      // changeColor(ctx, colorInput, alphaInput);
      undoStates = [];
      getCurrentImageState();
      initialState = undoStates[0];

      // console.log(undoStates.length);
      // console.log(undoStates);
      // console.log(initialState);
      // console.log(undoStates[0]);
      // console.log(initialState === undoStates[0]);
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

  // console.log(h, s, l);
  return { h, s, l };
}

function rgbToLab(R, G, B) {
  // Convert RGB to XYZ
  const rLinear = R / 255;
  const gLinear = G / 255;
  const bLinear = B / 255;

  const rSrgb =
    rLinear > 0.04045 ? ((rLinear + 0.055) / 1.055) ** 2.4 : rLinear / 12.92;
  const gSrgb =
    gLinear > 0.04045 ? ((gLinear + 0.055) / 1.055) ** 2.4 : gLinear / 12.92;
  const bSrgb =
    bLinear > 0.04045 ? ((bLinear + 0.055) / 1.055) ** 2.4 : bLinear / 12.92;

  const x = rSrgb * 0.4124 + gSrgb * 0.3576 + bSrgb * 0.1805;
  const y = rSrgb * 0.2126 + gSrgb * 0.7152 + bSrgb * 0.0722;
  const z = rSrgb * 0.0193 + gSrgb * 0.1192 + bSrgb * 0.9505;

  // Convert XYZ to Lab
  const xRef = 0.95047;
  const yRef = 1.0;
  const zRef = 1.08883;

  const xRatio = x / xRef;
  const yRatio = y / yRef;
  const zRatio = z / zRef;

  const epsilon = 0.008856;
  const kappa = 903.3;

  const fx = xRatio > epsilon ? xRatio ** (1 / 3) : (kappa * xRatio + 16) / 116;
  const fy = yRatio > epsilon ? yRatio ** (1 / 3) : (kappa * yRatio + 16) / 116;
  const fz = zRatio > epsilon ? zRatio ** (1 / 3) : (kappa * zRatio + 16) / 116;

  const L = Math.round(116 * fy - 16);
  const a = Math.round(500 * (fx - fy));
  const b = Math.round(200 * (fy - fz));

  // console.log(L, a, b);
  return { L, a, b };
}

function download() {
  // Canvasのイメージデータを取得する
  const imageData = canvas.toDataURL("image/png");

  // ダウンロード用のリンクを作成する
  const downloadLink = document.createElement("a");
  downloadLink.href = imageData;
  downloadLink.download = "image.png";

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

// function addCount() {
//   console.log(this.dom.value);
//   let count = parseInt(this.dom.value);
//   count += 1;
//   this.dom.value = String(count);
//   updateOutput(offsetX, offsetXOutput);
// }

// function subtractCount(dom) {
//   console.log(offsetX);
//   dom.value -= 1;
// }

offsetXadd.addEventListener("click", function () {
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
offsetYadd.addEventListener("click", function () {
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
columnAdd.addEventListener("click", function () {
  let count = parseInt(columnNumber.value);
  count += 1;
  columnNumber.value = String(count);
  updateOutput(columnNumber, columnNumberOutput);
});
columnSubtract.addEventListener("click", function () {
  let count = parseInt(columnNumber.value);
  count -= 1;
  columnNumber.value = String(count);
  updateOutput(columnNumber, columnNumberOutput);
});

function changeFontSize(context, fontInput) {
  const fontSize = parseInt(fontInput.value);

  context.font = `500 ${fontSize}px Inter`;
}

fontInput.addEventListener("input", function () {
  changeFontSize(ctx, fontInput);
});

function drawRoundedRectangle(ctx, x, y, width, height, cornerRadius) {
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
  ctx.fill();
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
  const colorElements = colorText.split(",");
  // console.log(colorElements);
  // console.log(colorElements[1]);
  let drawingPositionX = 0;
  let drawingPositionY = 0;
  let xOffset = 0;
  let yOffset = 0;

  for (let i = 0; i < colorElements.length; i++) {
    const colorElement = colorElements[i];
    const lineWidth = context.measureText(colorElement).width;
    const offsetXValue = [0, 1, 2, 3, 4];
    const offsetYValue = [0, 0.5, 1, 1.5, 2];
    const padding = 4 + (fontSize * 2) / 15;
    const margin = 4 + (fontSize * 2) / 15;
    const magicNumber = 2;
    const textSpaceWidth = lineWidth + padding * 2;
    const textSpaceheight = lineHeight + padding;
    const xOffsetAdjustment = fontSize / 3 + fontSize / 2;
    const yOffsetAdjustment = fontSize / 2;
    const offSetXWidth = fontSize * columnNumber;
    // let colorSet = [
    //   [185, 300, 120, 50],
    //   [100, 100, 100, 100],
    //   [85, 95, 85, 80],
    // ];
    let colorSet = [
      [0, hsl.h, hsl.h, hsl.h],
      [0, 100, hsl.s, hsl.s],
      [97, 50, 50, hsl.l],
    ];

    if (textPositionX === "left") {
      xOffset =
        -xOffsetAdjustment -
        textSpaceWidth -
        drawingPositionX * 2 -
        offSetXWidth * offsetXValue[offsetX] -
        magicNumber;
    } else {
      xOffset = xOffsetAdjustment + offSetXWidth * offsetXValue[offsetX];
    }
    if (textPositionY === "top") {
      yOffset =
        -yOffsetAdjustment -
        (textSpaceheight + margin) *
          Math.floor(colorElements.length / columnNumber) -
        (textSpaceheight + margin) *
          Math.floor(colorElements.length / columnNumber) *
          offsetYValue[offsetY];
    } else {
      yOffset =
        yOffsetAdjustment +
        (textSpaceheight + margin) *
          Math.floor(colorElements.length / columnNumber) *
          offsetYValue[offsetY];
    }

    context.textBaseline = "top";
    // context.fillStyle = `hsl( 0, 0%, ${colorInput.value}%, ${alphaInput.value}%)`;
    context.fillStyle = `hsl( ${colorSet[0][i]}, ${colorSet[1][i]}%, ${colorSet[2][i]}%`;

    drawRoundedRectangle(
      context,
      pointX + drawingPositionX + xOffset,
      pointY + drawingPositionY + yOffset,
      textSpaceWidth,
      textSpaceheight,
      padding
    );
    // console.log(colorInput.value === "100");
    // if (colorInput.value === "100") {
    //   context.fillStyle = `hsl( 0, 0%, 10%, ${alphaInput.value}%)`;
    // } else {
    //   context.fillStyle = `hsl( 0, 0%, 100%, ${alphaInput.value}%)`;
    // }
    context.fillStyle = `hsl( 0, 0%, 10%)`;
    if ((i === 1 && hsl.h < 20) || (i === 1 && hsl.h > 200)) {
      context.fillStyle = `hsl( 0, 0%, 94%)`;
    }
    if (
      (i === 2 && hsl.h < 45) ||
      (i === 2 && hsl.h > 200) ||
      (i === 2 && hsl.h > 45 && hsl.s < 60) ||
      (i === 2 && hsl.h < 200 && hsl.s < 60)
    ) {
      context.fillStyle = `hsl( 0, 0%, 94%)`;
    }
    if (i === 3 && hsl.l <= 50) {
      context.fillStyle = `hsl( 0, 0%, 94%)`;
    }
    context.fillText(
      colorElement,
      pointX + drawingPositionX + xOffset + padding,
      pointY + drawingPositionY + yOffset + padding
    );

    if ((i + 1) % columnNumber === 0) {
      drawingPositionY += textSpaceheight + margin;
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
  colorInfoElement.textContent = `L : ${lab.L}, h : ${hsl.h}, s : ${hsl.s}, l : ${hsl.l}`;
});

canvas.addEventListener("click", function (event) {
  const pointX = event.offsetX;
  const pointY = event.offsetY;
  const colorInfoElement = document.getElementById("colorInfo");
  const colorText = `${colorInfoElement.textContent}`;
  const fontSize = parseInt(fontInput.value);
  const offsetXValue = parseInt(offsetX.value);
  const offsetYValue = parseInt(offsetY.value);
  const lineHeight = fontSize + fontSize / 8;
  const textPositionX = positionXRadioNodeList.value;
  const textPositionY = positionYRadioNodeList.value;
  const columnNumberValue = columnNumber.value;

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

  ctx.lineWidth = 0.5;
  // ctx.fillStyle = `hsl( 0, 0%, ${colorInput.value}%, ${alphaInput.value}%)`;
  ctx.fillStyle = `hsl( 0, 0%, 100%)`;
  ctx.strokeStyle = `hsl( 0, 0%, 15%)`;

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
  if (lab.L > 85) {
    ctx.strokeRect(pointX - 12.5, pointY + clickPointAdjustment, 8, 3);
    ctx.strokeRect(pointX + 3.5, pointY + clickPointAdjustment, 8, 3);
    ctx.strokeRect(pointX + clickPointAdjustment, pointY - 12, 3.5, 8);
    ctx.strokeRect(pointX + clickPointAdjustment, pointY + 3, 3.5, 8);
  }
  ctx.fillRect(pointX - 12.5, pointY + clickPointAdjustment, 8, 3);
  ctx.fillRect(pointX + 3.5, pointY + clickPointAdjustment, 8, 3);
  ctx.fillRect(pointX + clickPointAdjustment, pointY - 12, 3.5, 8);
  ctx.fillRect(pointX + clickPointAdjustment, pointY + 3, 3.5, 8);

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

  // update current state
  redoStates = [];
  getCurrentImageState();
  if (undoStates.length > undoStatesLimitNumber) {
    undoStates.length = undoStatesLimitNumber;
  }
  console.log(undoStates);
  // ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  // ctx.fillRect(x - 2, y - 2, 5, 5);
});

// const changeColor = (context, colorInput, alphaInput) => {
//   const colorValue = colorInput.value;
//   const hue = 0; // 色相 (0-360)
//   const saturation = 0; // 彩度 (0-100)
//   const lightness = colorValue; // 明度 (0-100)
//   const alphaValue = alphaInput.value;
//   // console.log(colorInput.value);
//   // console.log(alphaInput.value);
//   context.fillStyle =
//     // "hsl(" + hue + ", " + saturation + "%, " + lightness + "%)";
//     `hsl( ${hue}, ${saturation}%, ${lightness}%, ${alphaValue}%)`;
// };

// colorInput.addEventListener("input", function () {
//   changeColor(ctx, colorInput, alphaInput);
// });

// alphaInput.addEventListener("input", function () {
//   changeColor(ctx, colorInput, alphaInput);
// });

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
  console.log(`undoStates:${undoStates.length}`);
  console.log(`redoStates:${redoStates.length}`);
}

// function to redo
function redo() {
  // check if there's a next state in the array
  if (redoStates.length === 0) return;
  let firstRedoStates = redoStates.shift();
  undoStates.unshift(firstRedoStates);
  // redraw canvas
  ctx.putImageData(undoStates[0], 0, 0);
  console.log(`undoStates:${undoStates.length}`);
  console.log(`redoStates:${redoStates.length}`);
}

function clearCanvas() {
  if (!initialState) return;
  if (initialState === undoStates[0]) return;
  undoStates.unshift(initialState);
  redoStates = [];
  ctx.putImageData(initialState, 0, 0);
  console.log(`undoStates:${undoStates.length}`);
  console.log(`redoStates:${redoStates.length}`);
}

// keyboard shortcuts

// Add event listeners to track the state of each key
document.addEventListener("keydown", (event) => {
  if (event.key === "r") {
    if (keyMeta) return;

    fileInput.click();
  }
  // if (event.key === "w") {
  //   colorInput.value = (parseInt(colorInput.value) + 80).toString();
  //   colorInput.nextElementSibling.value = colorInput.value.padStart(3, "0");
  //   changeColor(ctx, colorInput, alphaInput);
  //   // tooltip2.textContent = `lightness: ${colorInput.value}`;
  //   // tooltip2.style.width = `${tooltip2.textContent.length * 7 + 5}px`;
  // }
  // if (event.key === "q") {
  //   colorInput.value = (parseInt(colorInput.value) - 80).toString();
  //   colorInput.nextElementSibling.value = colorInput.value.padStart(3, "0");
  //   changeColor(ctx, colorInput, alphaInput);
  //   // tooltip2.textContent = `lightness: ${colorInput.value}`;
  //   // tooltip2.style.width = `${tooltip2.textContent.length * 7 + 5}px`;
  // }
  // if (event.key === "n") {
  //   alphaInput.value = (parseInt(alphaInput.value) + 10).toString();
  //   alphaInput.nextElementSibling.value = alphaInput.value.padStart(3, "0");
  //   changeColor(ctx, colorInput, alphaInput);
  //   // tooltip7.textContent = `alpha: ${alphaInput.value}`;
  //   // tooltip7.style.width = `${tooltip7.textContent.length * 8}px`;
  // }
  // if (event.key === "b") {
  //   alphaInput.value = (parseInt(alphaInput.value) - 10).toString();
  //   alphaInput.nextElementSibling.value = alphaInput.value.padStart(3, "0");
  //   changeColor(ctx, colorInput, alphaInput);
  //   // tooltip7.textContent = `alpha: ${alphaInput.value}`;
  //   // tooltip7.style.width = `${tooltip7.textContent.length * 8}px`;
  // }
  if (event.key === "f") {
    fontInput.value = (parseInt(fontInput.value) + 1).toString();
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
    //   tooltip1.textContent = `font-size: ${fontInput.value}`;
    //   tooltip1.style.width = `${tooltip1.textContent.length * 7}px`;
  }
  if (event.key === "d") {
    fontInput.value = (parseInt(fontInput.value) - 1).toString();
    updateOutput(fontInput, fontOutput);
    changeFontSize(ctx, fontInput);
    // tooltip1.textContent = `font-size: ${fontInput.value}`;
    // tooltip1.style.width = `${tooltip1.textContent.length * 7}px`;
  }
  if (event.key === "h") {
    offsetX.value = (parseInt(offsetX.value) + 1).toString();
    updateOutput(offsetX, offsetXOutput);
    console.log(offsetX.value);
    console.log(offsetXOutput.textContent);
    // tooltip5.textContent = `offset-x: ${offsetX.value}`;
    // tooltip5.style.width = `${tooltip5.textContent.length * 7}px`;
  }
  if (event.key === "g") {
    offsetX.value = (parseInt(offsetX.value) - 1).toString();
    updateOutput(offsetX, offsetXOutput);
    console.log(offsetX.value);
    console.log(offsetXOutput.textContent);
    // tooltip5.textContent = `offset-x: ${offsetX.value}`;
    // tooltip5.style.width = `${tooltip5.textContent.length * 7}px`;
  }
  if (event.key === "y") {
    offsetY.value = (parseInt(offsetY.value) + 1).toString();
    updateOutput(offsetY, offsetYOutput);
    // tooltip6.textContent = `offset-y: ${offsetY.value}`;
    // tooltip6.style.width = `${tooltip6.textContent.length * 7}px`;
  }
  if (event.key === "t") {
    offsetY.value = (parseInt(offsetY.value) - 1).toString();
    updateOutput(offsetY, offsetYOutput);
    //   tooltip6.textContent = `offset-y: ${offsetY.value}`;
    //   tooltip6.style.width = `${tooltip6.textContent.length * 7}px`;
  }
  if (event.key === "a") {
    if (keyMeta) return;

    for (let i = 0; i < positionXRadioNodeList.length; i++) {
      if (positionXRadioNodeList[i].checked) {
        // console.log(positionXRadioNodeList[i]);
        // console.log(positionXRadioNodeList.length);
        // console.log(i);
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
    // const previousTextWidth = tooltip3.textContent.length * 7;
    // tooltip3.textContent = `position-x: ${positionXRadioNodeList.value}`;
    // tooltip3.style.width = `${tooltip3.textContent.length * 7}px`;
    // const currentTextWidth = tooltip3.textContent.length * 7;
    // const textWidthDifference = previousTextWidth - currentTextWidth;
    // const tooltip4Style = window.getComputedStyle(tooltip4);
    // const tooltip4LeftValue = parseInt(tooltip4Style.left);
    // tooltip4.style.left = tooltip4LeftValue - textWidthDifference + "px";
  }
  if (event.key === "s") {
    if (keyMeta) return;

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
    // tooltip4.textContent = `position-y: ${positionYRadioNodeList.value}`;
    // tooltip4.style.width = `${tooltip4.textContent.length * 7 + 5}px`;
  }
  if (event.key === "p") {
    if (keyMeta) return;

    debouncedDownload();
  }
  if (event.key === "v") {
    if (keyMeta) return;

    for (let i = 0; i < scaleRadioNodeList.length; i++) {
      if (scaleRadioNodeList[i].checked) {
        scaleRadioNodeList[i].checked = false;
        //最初の要素に戻ってチェック
        if (i + 1 === scaleRadioNodeList.length) {
          scaleRadioNodeList[0].checked = true;
          break;
          //次の要素をチェック
        } else {
          scaleRadioNodeList[i + 1].checked = true;
          break;
        }
      }
    }
  }
  if (event.key === "e") {
    if (keyMeta) return;

    clearCanvas();
  }
  if (event.key === "x") {
    if (keyMeta) return;

    columnNumber.value = (parseInt(columnNumber.value) + 1).toString();
    updateOutput(columnNumber, columnNumberOutput);
    // tooltip8.textContent = `column-number: ${columnNumber.value}`;
    // tooltip8.style.width = `${tooltip8.textContent.length * 8}px`;
  }
  if (event.key === "z") {
    if (keyMeta) return;

    columnNumber.value = (parseInt(columnNumber.value) - 1).toString();
    updateOutput(columnNumber, columnNumberOutput);
    // tooltip8.textContent = `column-number: ${columnNumber.value}`;
    // tooltip8.style.width = `${tooltip8.textContent.length * 8}px`;
  }
  if (event.key === "Escape") {
    navToggle();
  }
});

// Set up an object to track the current state of each key
let keyShift = false;
// let keyArrowUp = false;
// let keyArrowLeft = false;
// let keyArrowDown = false;
// let keyArrowRight = false;
let keyMeta = false;
let keyZ = false;
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
}

// Add event listeners to track the state of each key
document.addEventListener("keydown", (event) => {
  if (event.key === "Shift") {
    keyShift = true;
  }
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
  // if (event.key === "d") {
  //   keyD = true;
  // }
  // console.log(event.key);
  // console.log(`keyShift:${keyShift}`);
  // console.log(`keyMeta:${keyMeta}`);
  // console.log(`keyZ:${keyZ}`);
  handleKeyPress();
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Shift") {
    keyShift = false;
  }
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
  // if (event.key === "d") {
  //   keyD = false;
  // }
});

// // マウス移動時に実行する関数
// function showTooltip(event) {
//   // console.log(event);
//   // ページのスクロール量を取得
//   const scrollTop =
//     document.documentElement.scrollTop || document.body.scrollTop;
//   const scrollLeft =
//     document.documentElement.scrollLeft || document.body.scrollLeft;

//   // マウスポインタの位置を取得
//   const x = event.clientX + scrollLeft;
//   const y = event.clientY + scrollTop;

//   // ツールチップに表示する文字列を設定
//   tooltip1.textContent = `font-size: ${fontInput.value}`;
//   tooltip2.textContent = `lightness: ${colorInput.value}`;
//   tooltip3.textContent = `position-x: ${positionXRadioNodeList.value}`;
//   tooltip4.textContent = `position-y: ${positionYRadioNodeList.value}`;
//   tooltip5.textContent = `offset-x: ${offsetX.value}`;
//   tooltip6.textContent = `offset-y: ${offsetY.value}`;
//   tooltip7.textContent = `alpha: ${alphaInput.value}`;
//   tooltip8.textContent = `column-number: ${columnNumber.value}`;

//   //ツールチップの幅をツールチップの文字数から指定
//   tooltip1.style.width = `${tooltip1.textContent.length * 7}px`;
//   tooltip2.style.width = `${tooltip2.textContent.length * 7 + 5}px`;
//   tooltip3.style.width = `${tooltip3.textContent.length * 7}px`;
//   tooltip4.style.width = `${tooltip4.textContent.length * 7 + 5}px`;
//   tooltip5.style.width = `${tooltip5.textContent.length * 7}px`;
//   tooltip6.style.width = `${tooltip6.textContent.length * 7}px`;
//   tooltip7.style.width = `${tooltip7.textContent.length * 8}px`;
//   tooltip8.style.width = `${tooltip8.textContent.length * 8}px`;

//   //ツールチップの幅と高さを取得（ツールチップの表示位置を指定するときに使用）
//   const tooltip1Width = tooltip1.offsetWidth;
//   const tooltip1Height = tooltip1.offsetHeight;
//   const tooltip3Width = tooltip3.offsetWidth;
//   const tooltip3Height = tooltip3.offsetHeight;
//   const tooltip5Width = tooltip5.offsetWidth;
//   const tooltip5Height = tooltip5.offsetHeight;
//   const tooltip6Width = tooltip6.offsetWidth;

//   // ツールチップを表示する位置を設定
//   tooltip1.style.left = x + tooltipPositionAdjustmentValueX + "px";
//   tooltip1.style.top = y + tooltipPositionAdjustmentValueY + "px";

//   tooltip2.style.left =
//     x +
//     tooltip1Width +
//     tooltipPositionAdjustmentValueX +
//     tooltipInlineMargin +
//     "px";
//   tooltip2.style.top = y + tooltipPositionAdjustmentValueY + "px";

//   tooltip3.style.left = x + tooltipPositionAdjustmentValueX + "px";
//   tooltip3.style.top =
//     y +
//     tooltip1Height +
//     tooltipPositionAdjustmentValueY +
//     tooltipBlockMargin +
//     "px";

//   tooltip4.style.left =
//     x +
//     tooltip3Width +
//     tooltipPositionAdjustmentValueX +
//     tooltipInlineMargin +
//     "px";
//   tooltip4.style.top =
//     y +
//     tooltip1Height +
//     tooltipPositionAdjustmentValueY +
//     tooltipBlockMargin +
//     "px";

//   tooltip5.style.left = x + tooltipPositionAdjustmentValueX + "px";
//   tooltip5.style.top =
//     y +
//     tooltip1Height +
//     tooltip3Height +
//     tooltipPositionAdjustmentValueY +
//     tooltipBlockMargin * 2 +
//     "px";

//   tooltip6.style.left =
//     x +
//     tooltip5Width +
//     tooltipPositionAdjustmentValueX +
//     tooltipInlineMargin +
//     "px";
//   tooltip6.style.top =
//     y +
//     tooltip1Height +
//     tooltip3Height +
//     tooltipPositionAdjustmentValueY +
//     tooltipBlockMargin * 2 +
//     "px";

//   tooltip7.style.left =
//     x +
//     tooltip5Width +
//     tooltip6Width +
//     tooltipPositionAdjustmentValueX +
//     tooltipInlineMargin * 2 +
//     "px";
//   tooltip7.style.top =
//     y +
//     tooltip1Height +
//     tooltip3Height +
//     tooltipPositionAdjustmentValueY +
//     tooltipBlockMargin * 2 +
//     "px";

//   tooltip8.style.left = x + tooltipPositionAdjustmentValueX + "px";
//   tooltip8.style.top =
//     y +
//     tooltip1Height +
//     tooltip3Height +
//     tooltip5Height +
//     tooltipPositionAdjustmentValueY +
//     tooltipBlockMargin * 3 +
//     "px";
//   // // ウィンドウの幅とツールチップの幅を取得
//   // const windowWidth = window.innerWidth;
//   // const tooltipWidth = tooltip.offsetWidth;

//   // // ツールチップがウィンドウの右端を超える場合は left 座標を調整
//   // if (x + tooltipWidth + tooltipPositionAdjustmentValueX > windowWidth) {
//   //   tooltip.style.left =
//   //     x - tooltipWidth - tooltipPositionAdjustmentValueX + "px";
//   // }

//   // ツールチップの高さを取得
//   // const tooltipHeight = tooltip.offsetHeight;

//   // // ツールチップがウィンドウの下端を超える場合は top 座標を調整
//   // if (
//   //   y + tooltipHeight + tooltipPositionAdjustmentValueY >
//   //   document.body.scrollHeight
//   // ) {
//   //   tooltip.style.top =
//   //     y - tooltipHeight - tooltipPositionAdjustmentValueY + "px";
//   // }

//   // ツールチップを表示する
//   tooltip1.style.display = "block";
//   tooltip2.style.display = "block";
//   tooltip3.style.display = "block";
//   tooltip4.style.display = "block";
//   tooltip5.style.display = "block";
//   tooltip6.style.display = "block";
//   tooltip7.style.display = "block";
//   tooltip8.style.display = "block";
// }

// // マウス移動時に実行する関数を登録
// document.addEventListener("mousemove", showTooltip);

// // スマートフォン、タブレットの場合ツールチップを非表示
// const isMobile = navigator.userAgent.match(
//   /(iPhone|iPod|iPad|Android|BlackBerry)/
// );
// if (!!isMobile) {
//   document.removeEventListener("mousemove", showTooltip);
//   tooltip1.style.display = "none";
//   tooltip2.style.display = "none";
//   tooltip3.style.display = "none";
//   tooltip4.style.display = "none";
//   tooltip5.style.display = "none";
//   tooltip6.style.display = "none";
//   tooltip7.style.display = "none";
//   tooltip8.style.display = "none";
// }

function navToggle() {
  navigation.classList.toggle("close");
}
