function formatNumber(num, digits = 6) {
  if (!Number.isFinite(num)) return "计算错误";
  if (Math.abs(num) >= 1000000 || (Math.abs(num) > 0 && Math.abs(num) < 0.0001)) {
    return num.toExponential(digits);
  }
  return Number(num.toFixed(digits)).toString();
}

/* 页面切换 */
document.querySelectorAll(".tool-btn[data-module]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tool-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tool-section").forEach((section) => {
      section.classList.remove("active");
    });

    const target = document.getElementById(btn.dataset.module);
    if (target) target.classList.add("active");
  });
});

/* 单位换算 */
const unitCategories = {
  pressure: { name: "压力", units: { Pa: 1, kPa: 1000, MPa: 1000000, bar: 100000, mbar: 100, atm: 101325, psi: 6894.757, "kg/cm²": 98066.5 } },
  temperature: { name: "温度", units: { "℃": "celsius", "℉": "fahrenheit", K: "kelvin" } },
  length: { name: "长度", units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048 } },
  mass: { name: "质量", units: { g: 0.001, kg: 1, t: 1000, lb: 0.45359237 } },
  volume: { name: "体积", units: { "m³": 1, L: 0.001, mL: 0.000001, "ft³": 0.0283168466 } },
  area: { name: "面积", units: { "mm²": 0.000001, "cm²": 0.0001, "m²": 1, "km²": 1000000, "in²": 0.00064516, "ft²": 0.09290304 } }
};

const categorySelect = document.getElementById("categorySelect");
const inputValue = document.getElementById("inputValue");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");
const result = document.getElementById("result");

function initCategories() {
  Object.keys(unitCategories).forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = unitCategories[key].name;
    categorySelect.appendChild(option);
  });
}

function updateUnitOptions() {
  const category = unitCategories[categorySelect.value];
  const units = Object.keys(category.units);

  fromUnit.innerHTML = "";
  toUnit.innerHTML = "";

  units.forEach((unit) => {
    const o1 = document.createElement("option");
    o1.value = unit;
    o1.textContent = unit;
    fromUnit.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = unit;
    o2.textContent = unit;
    toUnit.appendChild(o2);
  });

  if (units.length > 1) toUnit.value = units[1];
  handleConvert();
}

function convertTemperature(value, from, to) {
  let celsius;
  if (from === "℃") celsius = value;
  else if (from === "℉") celsius = (value - 32) / 1.8;
  else if (from === "K") celsius = value - 273.15;

  if (to === "℃") return celsius;
  if (to === "℉") return celsius * 1.8 + 32;
  if (to === "K") return celsius + 273.15;
  return NaN;
}

function convertValue(value, categoryKey, from, to) {
  if (categoryKey === "temperature") return convertTemperature(value, from, to);
  const factors = unitCategories[categoryKey].units;
  return value * factors[from] / factors[to];
}

function handleConvert() {
  const value = Number(inputValue.value);
  if (!Number.isFinite(value)) {
    result.textContent = "请输入有效数值";
    return;
  }
  const converted = convertValue(value, categorySelect.value, fromUnit.value, toUnit.value);
  result.textContent = `${value} ${fromUnit.value} = ${formatNumber(converted)} ${toUnit.value}`;
}

function swapUnits() {
  const oldFrom = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = oldFrom;
  handleConvert();
}

/* 热电偶查询 */
const thermocoupleData = {
  K: {
    name: "K型", minT: -270, maxT: 1372,
    ranges: [
      { min: -270, max: 0, coeffs: [0, 0.394501280250e-1, 0.236223735980e-4, -0.328589067840e-6, -0.499048287770e-8, -0.675090591730e-10, -0.574103274280e-12, -0.310888728940e-14, -0.104516093650e-16, -0.198892668780e-19, -0.163226974860e-22] },
      { min: 0, max: 1372, coeffs: [-0.176004136860e-1, 0.389212049750e-1, 0.185587700320e-4, -0.994575928740e-7, 0.318409457190e-9, -0.560728448890e-12, 0.560750590590e-15, -0.320207200030e-18, 0.971511471520e-22, -0.121047212750e-25], exponential: { a0: 0.118597600000, a1: -0.118343200000e-3, a2: 126.9686 } }
    ]
  },
  E: {
    name: "E型", minT: -270, maxT: 1000,
    ranges: [
      { min: -270, max: 0, coeffs: [0, 0.586655087080e-1, 0.454109771240e-4, -0.779980486860e-6, -0.258001608430e-7, -0.594525830570e-9, -0.932140586670e-11, -0.102876055340e-12, -0.803701236210e-15, -0.439794973910e-17, -0.164147763550e-19, -0.396736195160e-22, -0.558273287210e-25, -0.346578420130e-28] },
      { min: 0, max: 1000, coeffs: [0, 0.586655087100e-1, 0.450322755820e-4, 0.289084072120e-7, -0.330568966520e-9, 0.650244032700e-12, -0.191974955040e-15, -0.125366004970e-17, 0.214892175690e-20, -0.143880417820e-23, 0.359608994810e-27] }
    ]
  },
  J: {
    name: "J型", minT: -210, maxT: 1200,
    ranges: [
      { min: -210, max: 760, coeffs: [0, 0.503811878150e-1, 0.304758369300e-4, -0.856810657200e-7, 0.132281952950e-9, -0.170529583370e-12, 0.209480906970e-15, -0.125383953360e-18, 0.156317256970e-22] },
      { min: 760, max: 1200, coeffs: [0.296456256810e3, -0.149761277860e1, 0.317871039240e-2, -0.318476867010e-5, 0.157208190040e-8, -0.306913690560e-12] }
    ]
  },
  T: {
    name: "T型", minT: -270, maxT: 400,
    ranges: [
      { min: -270, max: 0, coeffs: [0, 0.387481063640e-1, 0.441944343470e-4, 0.118443231050e-6, 0.200329735540e-7, 0.901380195590e-9, 0.226511565930e-10, 0.360711542050e-12, 0.384939398830e-14, 0.282135219250e-16, 0.142515947790e-18, 0.487686622860e-21, 0.107955392700e-23, 0.139450270620e-26, 0.797951539270e-30] },
      { min: 0, max: 400, coeffs: [0, 0.387481063640e-1, 0.332922278800e-4, 0.206182434040e-6, -0.218822568460e-8, 0.109968809280e-10, -0.308157587720e-13, 0.454791352900e-16, -0.275129016730e-19] }
    ]
  }
};

const tcType = document.getElementById("tcType");
const tcMode = document.getElementById("tcMode");
const tcInput = document.getElementById("tcInput");
const tcCalcBtn = document.getElementById("tcCalcBtn");
const tcResult = document.getElementById("tcResult");

function polynomial(x, coeffs) {
  return coeffs.reduce((sum, coeff, index) => sum + coeff * Math.pow(x, index), 0);
}

function thermocoupleTempToMv(type, temp) {
  const data = thermocoupleData[type];
  if (temp < data.minT || temp > data.maxT) return null;
  const range = data.ranges.find((r) => temp >= r.min && temp <= r.max);
  if (!range) return null;

  let mv = polynomial(temp, range.coeffs);
  if (range.exponential) {
    const { a0, a1, a2 } = range.exponential;
    mv += a0 * Math.exp(a1 * Math.pow(temp - a2, 2));
  }
  return mv;
}

function thermocoupleMvToTemp(type, mv) {
  const data = thermocoupleData[type];
  const minMv = thermocoupleTempToMv(type, data.minT);
  const maxMv = thermocoupleTempToMv(type, data.maxT);
  if (mv < minMv || mv > maxMv) return null;

  let low = data.minT;
  let high = data.maxT;
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    const midMv = thermocoupleTempToMv(type, mid);
    if (midMv < mv) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function handleThermocoupleCalc() {
  const type = tcType.value;
  const mode = tcMode.value;
  const value = Number(tcInput.value);
  const data = thermocoupleData[type];

  if (!Number.isFinite(value)) {
    tcResult.textContent = "请输入有效数值";
    return;
  }

  if (mode === "tempToMv") {
    const mv = thermocoupleTempToMv(type, value);
    if (mv === null) {
      tcResult.textContent = `${data.name}温度范围：${data.minT}℃ ~ ${data.maxT}℃`;
      return;
    }
    tcResult.textContent = `${data.name}：${value} ℃ ≈ ${formatNumber(mv, 4)} mV`;
  } else {
    const temp = thermocoupleMvToTemp(type, value);
    if (temp === null) {
      const minMv = thermocoupleTempToMv(type, data.minT);
      const maxMv = thermocoupleTempToMv(type, data.maxT);
      tcResult.textContent = `${data.name}热电势范围：${formatNumber(minMv, 4)} mV ~ ${formatNumber(maxMv, 4)} mV`;
      return;
    }
    tcResult.textContent = `${data.name}：${value} mV ≈ ${formatNumber(temp, 2)} ℃`;
  }
}

/* 温压补偿 */
const gasMediums = {
  air: { name: "空气", molarMass: 28.965, warning: "" },
  nitrogen: { name: "氮气", molarMass: 28.0134, warning: "" },
  oxygen: { name: "氧气", molarMass: 31.9988, warning: "" },
  hydrogen: { name: "氢气", molarMass: 2.01588, warning: "" },
  methane: { name: "甲烷", molarMass: 16.043, warning: "" },
  ethylene: { name: "乙烯", molarMass: 28.054, warning: "注意：乙烯在高压或低温下可能液化，请确认工况下为气态。" },
  propylene: { name: "丙烯", molarMass: 42.081, warning: "注意：丙烯在高压或低温下可能液化，请确认工况下为气态。" },
  propane: { name: "丙烷", molarMass: 44.097, warning: "注意：丙烷在高压或低温下可能液化，请确认工况下为气态。" },
  co2: { name: "二氧化碳", molarMass: 44.01, warning: "注意：二氧化碳在高压或低温下可能液化，请确认工况下为气态。" },
  steam: { name: "水蒸气", molarMass: 18.015, warning: "注意：水蒸气需核实是否过热或饱和状态，当前工具仅按气体状态方程估算。" },
  vinylacetate: { name: "醋酸乙烯", molarMass: 86.09, warning: "注意：醋酸乙烯在常温下通常为液体，气相计算前请确认工况下为气态。" }
};

const ptMedium = document.getElementById("ptMedium");
const ptMode = document.getElementById("ptMode");
const ptFlow = document.getElementById("ptFlow");
const ptPressureG = document.getElementById("ptPressureG");
const ptTempC = document.getElementById("ptTempC");
const ptAtmPressure = document.getElementById("ptAtmPressure");
const ptStdPressure = document.getElementById("ptStdPressure");
const ptStdTemp = document.getElementById("ptStdTemp");
const ptActualZ = document.getElementById("ptActualZ");
const ptStdZ = document.getElementById("ptStdZ");
const ptCalcBtn = document.getElementById("ptCalcBtn");
const ptResult = document.getElementById("ptResult");

function calcGasDensityKgM3(molarMassGmol, pressureKpaA, tempK, z) {
  const r = 8.314462618;
  const pressurePa = pressureKpaA * 1000;
  const molarMassKgMol = molarMassGmol / 1000;
  return pressurePa * molarMassKgMol / (z * r * tempK);
}

function handlePtCompensation() {
  const flow = Number(ptFlow.value);
  const pressureG = Number(ptPressureG.value);
  const tempC = Number(ptTempC.value);
  const atmPressure = Number(ptAtmPressure.value);
  const stdPressure = Number(ptStdPressure.value);
  const stdTempC = Number(ptStdTemp.value);
  const actualZ = Number(ptActualZ.value);
  const stdZ = Number(ptStdZ.value);

  if (
    !Number.isFinite(flow) ||
    !Number.isFinite(pressureG) ||
    !Number.isFinite(tempC) ||
    !Number.isFinite(atmPressure) ||
    !Number.isFinite(stdPressure) ||
    !Number.isFinite(stdTempC) ||
    !Number.isFinite(actualZ) ||
    !Number.isFinite(stdZ) ||
    actualZ <= 0 ||
    stdZ <= 0
  ) {
    ptResult.textContent = "请输入有效参数";
    return;
  }

  const actualPressureAbs = pressureG + atmPressure;
  const actualTempK = tempC + 273.15;
  const stdTempK = stdTempC + 273.15;

  if (actualPressureAbs <= 0 || stdPressure <= 0 || actualTempK <= 0 || stdTempK <= 0) {
    ptResult.textContent = "压力或温度参数不合理";
    return;
  }

  let convertedFlow;
  if (ptMode.value === "actualToStandard") {
    convertedFlow = flow * (actualPressureAbs / stdPressure) * (stdTempK / actualTempK) * (stdZ / actualZ);
  } else {
    convertedFlow = flow * (stdPressure / actualPressureAbs) * (actualTempK / stdTempK) * (actualZ / stdZ);
  }

  const medium = gasMediums[ptMedium.value];
  const actualDensity = calcGasDensityKgM3(medium.molarMass, actualPressureAbs, actualTempK, actualZ);
  const stdDensity = calcGasDensityKgM3(medium.molarMass, stdPressure, stdTempK, stdZ);
  const directionText = ptMode.value === "actualToStandard" ? "标况体积流量" : "工况体积流量";

  ptResult.innerHTML =
    `${medium.name}：${formatNumber(convertedFlow)} ${directionText}<br>` +
    `工况密度≈${formatNumber(actualDensity, 4)} kg/m³，标况密度≈${formatNumber(stdDensity, 4)} kg/m³` +
    (medium.warning ? `<br><span style="font-size:14px;font-weight:700;color:#9a3412;">${medium.warning}</span>` : "");
}

/* 初始化 */
initCategories();
updateUnitOptions();
inputValue.value = 1;
handleConvert();

categorySelect.addEventListener("change", updateUnitOptions);
convertBtn.addEventListener("click", handleConvert);
swapBtn.addEventListener("click", swapUnits);
inputValue.addEventListener("input", handleConvert);
fromUnit.addEventListener("change", handleConvert);
toUnit.addEventListener("change", handleConvert);

tcCalcBtn.addEventListener("click", handleThermocoupleCalc);
tcInput.addEventListener("input", handleThermocoupleCalc);
tcType.addEventListener("change", handleThermocoupleCalc);
tcMode.addEventListener("change", () => {
  tcInput.value = "";
  tcResult.textContent = "结果将在这里显示";
});

ptCalcBtn.addEventListener("click", handlePtCompensation);
[ptMedium, ptMode, ptFlow, ptPressureG, ptTempC, ptAtmPressure, ptStdPressure, ptStdTemp, ptActualZ, ptStdZ].forEach((el) => {
  el.addEventListener("input", handlePtCompensation);
  el.addEventListener("change", handlePtCompensation);
});