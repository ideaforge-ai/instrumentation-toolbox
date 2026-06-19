function formatNumber(num, digits = 6) {
  if (!Number.isFinite(num)) return "计算错误";
  if (Math.abs(num) >= 1000000 || (Math.abs(num) > 0 && Math.abs(num) < 0.0001)) {
    return num.toExponential(digits);
  }
  return Number(num.toFixed(digits)).toString();
}

function getNumber(el) {
  return Number(el.value);
}

function setOptions(selectEl, dataObj) {
  if (!selectEl || !dataObj) return;
  selectEl.innerHTML = "";
  Object.keys(dataObj).forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = dataObj[key].name;
    selectEl.appendChild(option);
  });
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
  air: { name: "空气", molarMass: 28.965, kappa: 1.4, warning: "" },
  nitrogen: { name: "氮气", molarMass: 28.0134, kappa: 1.4, warning: "" },
  oxygen: { name: "氧气", molarMass: 31.9988, kappa: 1.395, warning: "" },
  hydrogen: { name: "氢气", molarMass: 2.01588, kappa: 1.405, warning: "" },
  methane: { name: "甲烷", molarMass: 16.043, kappa: 1.31, warning: "" },
  ethylene: { name: "乙烯", molarMass: 28.054, kappa: 1.24, warning: "注意：乙烯在高压或低温下可能液化，请确认工况下为气态。" },
  propylene: { name: "丙烯", molarMass: 42.081, kappa: 1.13, warning: "注意：丙烯在高压或低温下可能液化，请确认工况下为气态。" },
  propane: { name: "丙烷", molarMass: 44.097, kappa: 1.13, warning: "注意：丙烷在高压或低温下可能液化，请确认工况下为气态。" },
  co2: { name: "二氧化碳", molarMass: 44.01, kappa: 1.29, warning: "注意：二氧化碳在高压或低温下可能液化，请确认工况下为气态。" },
  steam: { name: "水蒸气", molarMass: 18.015, kappa: 1.33, warning: "注意：水蒸气需核实是否过热或饱和状态，当前工具仅按气体状态方程估算。" },
  vinylacetate: { name: "醋酸乙烯", molarMass: 86.09, kappa: 1.09, warning: "注意：醋酸乙烯在常温下通常为液体，气相计算前请确认工况下为气态。" }
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

/* 标准孔板计算 */
const liquidMediums = {
  water: { name: "水", density: 998.2, warning: "密度按约 20℃ 参考值，精确计算请按实际温度修正。" },
  methanol: { name: "甲醇", density: 791.8, warning: "密度按约 20℃ 参考值，精确计算请按实际温度修正。" },
  ethanol: { name: "乙醇", density: 789.0, warning: "密度按约 20℃ 参考值，精确计算请按实际温度修正。" },
  acetone: { name: "丙酮", density: 784.5, warning: "密度按约 20℃ 参考值，精确计算请按实际温度修正。" },
  vinylacetateLiquid: { name: "醋酸乙烯", density: 932.0, warning: "密度为常温参考值，现场应优先采用工艺物性数据。" },
  propyleneLiquid: { name: "液态丙烯", density: 513.0, warning: "液态丙烯密度随温度、压力变化明显，建议核对工艺物性数据。" },
  propaneLiquid: { name: "液态丙烷", density: 493.0, warning: "液态丙烷密度随温度、压力变化明显，建议核对工艺物性数据。" },
  custom: { name: "自定义", density: 0, warning: "请手动输入工况密度。" }
};

const orificeElementType = document.getElementById("orificeElementType");
const orificeMode = document.getElementById("orificeMode");
const orificeFluidType = document.getElementById("orificeFluidType");
const orificeGasBox = document.getElementById("orificeGasBox");
const orificeLiquidBox = document.getElementById("orificeLiquidBox");
const orificeGasMedium = document.getElementById("orificeGasMedium");
const orificeLiquidMedium = document.getElementById("orificeLiquidMedium");
const orificeLiquidDensity = document.getElementById("orificeLiquidDensity");
const orificePressureG = document.getElementById("orificePressureG");
const orificeTempC = document.getElementById("orificeTempC");
const orificeAtmPressure = document.getElementById("orificeAtmPressure");
const orificeActualZ = document.getElementById("orificeActualZ");
const orificePipeD = document.getElementById("orificePipeD");
const orificeBoreD = document.getElementById("orificeBoreD");
const orificeDpInputBox = document.getElementById("orificeDpInputBox");
const orificeFlowInputBox = document.getElementById("orificeFlowInputBox");
const orificeDpKpa = document.getElementById("orificeDpKpa");
const orificeFlowM3h = document.getElementById("orificeFlowM3h");
const orificeCoeffC = document.getElementById("orificeCoeffC");
const orificeEpsilonMode = document.getElementById("orificeEpsilonMode");
const orificeEpsilon = document.getElementById("orificeEpsilon");
const orificeKappa = document.getElementById("orificeKappa");
const orificeStdPressure = document.getElementById("orificeStdPressure");
const orificeStdTemp = document.getElementById("orificeStdTemp");
const orificeStdZ = document.getElementById("orificeStdZ");
const orificeCalcBtn = document.getElementById("orificeCalcBtn");
const orificeResult = document.getElementById("orificeResult");

function updateOrificeKappaByMedium() {
  const medium = gasMediums[orificeGasMedium.value];
  if (medium && Number.isFinite(medium.kappa)) {
    orificeKappa.value = medium.kappa;
  }
}

function updateOrificeVisibility() {
  const isGas = orificeFluidType.value === "gas";
  const isDpToFlow = orificeMode.value === "dpToFlow";
  const isAutoEpsilon = isGas && orificeEpsilonMode.value === "auto";

  orificeGasBox.classList.toggle("hidden", !isGas);
  orificeLiquidBox.classList.toggle("hidden", isGas);
  orificeDpInputBox.classList.toggle("hidden", !isDpToFlow);
  orificeFlowInputBox.classList.toggle("hidden", isDpToFlow);

  orificeEpsilonMode.disabled = !isGas;
  orificeKappa.disabled = !isAutoEpsilon;
  orificeEpsilon.readOnly = !isGas || isAutoEpsilon;

  if (!isGas) {
    orificeEpsilon.value = "1";
  } else if (isAutoEpsilon && (!Number.isFinite(getNumber(orificeEpsilon)) || getNumber(orificeEpsilon) <= 0)) {
    orificeEpsilon.value = "1";
  }

  orificeResult.textContent = "结果将在这里显示";
}

function updateLiquidDensityByMedium() {
  const medium = liquidMediums[orificeLiquidMedium.value];
  if (!medium) return;
  if (orificeLiquidMedium.value !== "custom") {
    orificeLiquidDensity.value = medium.density;
  } else {
    orificeLiquidDensity.value = "";
    orificeLiquidDensity.placeholder = "请输入工况密度";
  }
}

function calcOrificeExpansionFactor(beta, dpKpa, upstreamPressureKpaA, kappa) {
  if (
    !Number.isFinite(beta) ||
    !Number.isFinite(dpKpa) ||
    !Number.isFinite(upstreamPressureKpaA) ||
    !Number.isFinite(kappa) ||
    beta <= 0 ||
    beta >= 1 ||
    dpKpa <= 0 ||
    upstreamPressureKpaA <= 0 ||
    kappa <= 1
  ) {
    return NaN;
  }

  const pressureRatio = 1 - dpKpa / upstreamPressureKpaA;
  if (pressureRatio <= 0 || pressureRatio >= 1) return NaN;

  const beta4 = Math.pow(beta, 4);
  const beta8 = Math.pow(beta, 8);
  const factor = 0.351 + 0.256 * beta4 + 0.93 * beta8;
  return 1 - factor * (1 - Math.pow(pressureRatio, 1 / kappa));
}

function getOrificeDensityInfo() {
  const fluidType = orificeFluidType.value;

  if (fluidType === "gas") {
    const medium = gasMediums[orificeGasMedium.value];
    const pressureG = getNumber(orificePressureG);
    const tempC = getNumber(orificeTempC);
    const atmPressure = getNumber(orificeAtmPressure);
    const actualZ = getNumber(orificeActualZ);
    const stdPressure = getNumber(orificeStdPressure);
    const stdTempC = getNumber(orificeStdTemp);
    const stdZ = getNumber(orificeStdZ);

    if (
      !Number.isFinite(pressureG) ||
      !Number.isFinite(tempC) ||
      !Number.isFinite(atmPressure) ||
      !Number.isFinite(actualZ) ||
      !Number.isFinite(stdPressure) ||
      !Number.isFinite(stdTempC) ||
      !Number.isFinite(stdZ) ||
      actualZ <= 0 ||
      stdZ <= 0
    ) {
      return { error: "请输入有效的气体工况参数" };
    }

    const actualPressureAbs = pressureG + atmPressure;
    const actualTempK = tempC + 273.15;
    const stdTempK = stdTempC + 273.15;

    if (actualPressureAbs <= 0 || stdPressure <= 0 || actualTempK <= 0 || stdTempK <= 0) {
      return { error: "气体压力或温度参数不合理" };
    }

    const actualDensity = calcGasDensityKgM3(medium.molarMass, actualPressureAbs, actualTempK, actualZ);
    const stdDensity = calcGasDensityKgM3(medium.molarMass, stdPressure, stdTempK, stdZ);

    return {
      fluidType,
      mediumName: medium.name,
      density: actualDensity,
      stdDensity,
      actualPressureAbs,
      mediumWarning: medium.warning
    };
  }

  const liquid = liquidMediums[orificeLiquidMedium.value];
  const density = getNumber(orificeLiquidDensity);
  if (!Number.isFinite(density) || density <= 0) {
    return { error: "请输入有效的液体工况密度" };
  }

  return {
    fluidType,
    mediumName: liquid.name,
    density,
    stdDensity: null,
    actualPressureAbs: null,
    mediumWarning: liquid.warning
  };
}

function getOrificeBasicParams() {
  const pipeDmm = getNumber(orificePipeD);
  const boreDmm = getNumber(orificeBoreD);
  const coeffC = getNumber(orificeCoeffC);
  const manualEpsilon = getNumber(orificeEpsilon);
  const kappa = getNumber(orificeKappa);
  const isGas = orificeFluidType.value === "gas";
  const epsilonMode = isGas ? orificeEpsilonMode.value : "manual";

  if (
    !Number.isFinite(pipeDmm) ||
    !Number.isFinite(boreDmm) ||
    !Number.isFinite(coeffC) ||
    pipeDmm <= 0 ||
    boreDmm <= 0 ||
    coeffC <= 0
  ) {
    return { error: "请输入有效的孔板参数" };
  }

  if (isGas && epsilonMode === "manual") {
    if (!Number.isFinite(manualEpsilon) || manualEpsilon <= 0 || manualEpsilon > 1) {
      return { error: "请输入有效的可膨胀系数 ε，气体 ε 通常应在 0~1 之间" };
    }
  }

  if (isGas && epsilonMode === "auto") {
    if (!Number.isFinite(kappa) || kappa <= 1) {
      return { error: "请输入有效的等熵指数 κ，气体 κ 通常应大于 1" };
    }
  }

  if (boreDmm >= pipeDmm) {
    return { error: "孔板孔径 d 必须小于管道内径 D" };
  }

  const pipeDm = pipeDmm / 1000;
  const boreDm = boreDmm / 1000;
  const beta = boreDm / pipeDm;
  const area = Math.PI * Math.pow(boreDm, 2) / 4;
  const betaFactor = Math.sqrt(1 - Math.pow(beta, 4));

  if (betaFactor <= 0) {
    return { error: "β 值不合理，请检查 D 与 d" };
  }

  return { pipeDmm, boreDmm, coeffC, manualEpsilon, kappa, epsilonMode, beta, area, betaFactor };
}

function resolveOrificeEpsilon(params, densityInfo, dpKpa) {
  if (densityInfo.fluidType !== "gas") {
    return { epsilon: 1, modeText: "液体固定" };
  }

  if (params.epsilonMode === "manual") {
    return { epsilon: params.manualEpsilon, modeText: "手动输入" };
  }

  const epsilon = calcOrificeExpansionFactor(params.beta, dpKpa, densityInfo.actualPressureAbs, params.kappa);
  if (!Number.isFinite(epsilon) || epsilon <= 0 || epsilon > 1) {
    return { error: "自动估算 ε 失败，请检查差压、绝压和 κ，或切换为手动输入 ε" };
  }

  return { epsilon, modeText: "自动估算" };
}

function calcOrificeFlowM3hFromDp(dpKpa, params, densityInfo, epsilon) {
  const dpPa = dpKpa * 1000;
  const qvM3s = params.coeffC * epsilon * params.area * Math.sqrt(2 * dpPa / densityInfo.density) / params.betaFactor;
  return qvM3s * 3600;
}

function calcOrificeDpKpaFromFlowManualEpsilon(qvM3h, params, densityInfo, epsilon) {
  const qvM3s = qvM3h / 3600;
  const dpPa = Math.pow(qvM3s * params.betaFactor / (params.coeffC * epsilon * params.area), 2) * densityInfo.density / 2;
  return dpPa / 1000;
}

function solveOrificeDpForFlowAutoEpsilon(qvM3h, params, densityInfo) {
  const maxDpKpa = densityInfo.actualPressureAbs * 0.95;
  let low = 0;
  let high = Math.min(1, maxDpKpa);
  let highFlow = 0;
  let highEpsilon = 1;

  for (let i = 0; i < 80; i++) {
    const epsInfo = resolveOrificeEpsilon(params, densityInfo, high);
    if (epsInfo.error) break;
    highEpsilon = epsInfo.epsilon;
    highFlow = calcOrificeFlowM3hFromDp(high, params, densityInfo, highEpsilon);
    if (highFlow >= qvM3h) break;
    if (high >= maxDpKpa) break;
    high = Math.min(high * 2, maxDpKpa);
  }

  if (!Number.isFinite(highFlow) || highFlow < qvM3h) {
    return { error: "目标流量过大，自动估算 ε 时无法反算出合理差压，请检查工况或改用手动 ε" };
  }

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    const epsInfo = resolveOrificeEpsilon(params, densityInfo, mid);
    if (epsInfo.error) {
      high = mid;
      continue;
    }
    const midFlow = calcOrificeFlowM3hFromDp(mid, params, densityInfo, epsInfo.epsilon);
    if (midFlow < qvM3h) low = mid;
    else high = mid;
  }

  const dpKpa = (low + high) / 2;
  const epsInfo = resolveOrificeEpsilon(params, densityInfo, dpKpa);
  if (epsInfo.error) return epsInfo;
  return { dpKpa, epsilon: epsInfo.epsilon, modeText: epsInfo.modeText };
}

function buildOrificeWarnings(params, densityInfo, dpKpa, epsilonInfo) {
  const warnings = [];

  if (params.beta < 0.2 || params.beta > 0.75) {
    warnings.push(`β=${formatNumber(params.beta, 3)}，超出常用工程范围 0.20~0.75，建议核实孔板参数。`);
  } else {
    warnings.push(`β=${formatNumber(params.beta, 3)}，处于常用工程范围。`);
  }

  if (densityInfo.fluidType === "gas" && Number.isFinite(dpKpa) && Number.isFinite(densityInfo.actualPressureAbs)) {
    const ratio = dpKpa / densityInfo.actualPressureAbs;
    if (ratio > 0.25) {
      warnings.push("差压 / 上游绝压比例偏大，自动 ε 仍属于工程估算，建议采用标准计算或核实量程。 ");
    } else if (params.epsilonMode === "auto") {
      warnings.push(`ε 已按气体膨胀修正自动估算，ΔP/P1=${formatNumber(ratio * 100, 2)}%。`);
    }

    if (densityInfo.actualPressureAbs > 1000) {
      warnings.push("操作绝压超过 1 MPaA，建议根据物性数据修正工况压缩因子 Z。");
    }
  }

  if (epsilonInfo && Number.isFinite(epsilonInfo.epsilon) && densityInfo.fluidType === "gas" && epsilonInfo.epsilon < 0.97) {
    warnings.push(`ε=${formatNumber(epsilonInfo.epsilon, 4)}，气体膨胀修正已较明显。`);
  }

  if (densityInfo.mediumWarning) warnings.push(densityInfo.mediumWarning);

  return warnings;
}

function handleOrificeCalc() {
  const densityInfo = getOrificeDensityInfo();
  if (densityInfo.error) {
    orificeResult.textContent = densityInfo.error;
    return;
  }

  const params = getOrificeBasicParams();
  if (params.error) {
    orificeResult.textContent = params.error;
    return;
  }

  let dpKpa;
  let qvM3h;
  let epsilonInfo;

  if (orificeMode.value === "dpToFlow") {
    dpKpa = getNumber(orificeDpKpa);
    if (!Number.isFinite(dpKpa) || dpKpa <= 0) {
      orificeResult.textContent = "请输入有效的差压 ΔP";
      return;
    }

    epsilonInfo = resolveOrificeEpsilon(params, densityInfo, dpKpa);
    if (epsilonInfo.error) {
      orificeResult.textContent = epsilonInfo.error;
      return;
    }

    qvM3h = calcOrificeFlowM3hFromDp(dpKpa, params, densityInfo, epsilonInfo.epsilon);
  } else {
    qvM3h = getNumber(orificeFlowM3h);
    if (!Number.isFinite(qvM3h) || qvM3h <= 0) {
      orificeResult.textContent = "请输入有效的工况体积流量";
      return;
    }

    if (densityInfo.fluidType === "gas" && params.epsilonMode === "auto") {
      const solved = solveOrificeDpForFlowAutoEpsilon(qvM3h, params, densityInfo);
      if (solved.error) {
        orificeResult.textContent = solved.error;
        return;
      }
      dpKpa = solved.dpKpa;
      epsilonInfo = { epsilon: solved.epsilon, modeText: solved.modeText };
    } else {
      epsilonInfo = resolveOrificeEpsilon(params, densityInfo, 1);
      if (epsilonInfo.error) {
        orificeResult.textContent = epsilonInfo.error;
        return;
      }
      dpKpa = calcOrificeDpKpaFromFlowManualEpsilon(qvM3h, params, densityInfo, epsilonInfo.epsilon);
    }
  }

  if (densityInfo.fluidType === "gas" && params.epsilonMode === "auto") {
    orificeEpsilon.value = formatNumber(epsilonInfo.epsilon, 5);
  } else if (densityInfo.fluidType !== "gas") {
    orificeEpsilon.value = "1";
  }

  const massKgH = qvM3h * densityInfo.density;
  const massTH = massKgH / 1000;
  const stdFlowM3h = densityInfo.fluidType === "gas" && densityInfo.stdDensity > 0 ? massKgH / densityInfo.stdDensity : null;
  const warnings = buildOrificeWarnings(params, densityInfo, dpKpa, epsilonInfo);

  const modeTitle = orificeMode.value === "dpToFlow" ? "差压 → 流量" : "流量 → 差压";
  let html = `${modeTitle}（${densityInfo.mediumName}）<br>`;
  html += `工况体积流量：${formatNumber(qvM3h, 4)} m³/h<br>`;
  html += `质量流量：${formatNumber(massKgH, 4)} kg/h（${formatNumber(massTH, 4)} t/h）<br>`;
  if (stdFlowM3h !== null) {
    html += `标况体积流量：${formatNumber(stdFlowM3h, 4)} Nm³/h<br>`;
  }
  html += `差压 ΔP：${formatNumber(dpKpa, 4)} kPa`;

  html += `<div class="result-detail">`;
  html += `β=${formatNumber(params.beta, 4)}，孔板面积=${formatNumber(params.area, 8)} m²，工况密度=${formatNumber(densityInfo.density, 4)} kg/m³`;
  if (densityInfo.fluidType === "gas") {
    html += `，标况密度=${formatNumber(densityInfo.stdDensity, 4)} kg/m³`;
  }
  html += `<br>C=${formatNumber(params.coeffC, 4)}，ε=${formatNumber(epsilonInfo.epsilon, 5)}（${epsilonInfo.modeText}）`;
  if (densityInfo.fluidType === "gas" && params.epsilonMode === "auto") {
    html += `，κ=${formatNumber(params.kappa, 4)}`;
  }
  html += `</div>`;

  if (warnings.length > 0) {
    html += `<div class="result-warning">${warnings.join("<br>")}</div>`;
  }

  orificeResult.innerHTML = html;
}


/* 调节阀 Cv / Kv 计算与初选 */
const valveTypes = {
  singleSeat: { name: "单座调节阀", xT: 0.72, hint: "适合小中流量、一般压差和较高控制精度场景。" },
  cage: { name: "套筒调节阀", xT: 0.75, hint: "适合中高压差、抗振动、抗冲刷和气体/蒸汽常见调节场景。" },
  vball: { name: "V 型球阀", xT: 0.55, hint: "适合较大流量、较大可调比、含颗粒或易堵介质。" },
  butterfly: { name: "蝶阀", xT: 0.35, hint: "适合大口径、大流量、低压差场景。" },
  custom: { name: "自定义 / 其他", xT: 0.7, hint: "仅计算 Cv/Kv，不做强阀型判断。" }
};

const valveIdealUtilization = { min: 0.4, max: 0.7, target: 0.55 };

// 通用参考阀库：用于工程初选和界面演示，不绑定具体厂家型号。
// 正式采购/设计应以厂家最新样本的额定 Cv、FL、xT、噪声和气蚀校核为准。
const valveCatalog = [
  { valveType: "singleSeat", dn: 15, ratedCv: 3, note: "小流量阀芯参考" },
  { valveType: "singleSeat", dn: 20, ratedCv: 6, note: "小流量阀芯参考" },
  { valveType: "singleSeat", dn: 25, ratedCv: 12, note: "常规流道参考" },
  { valveType: "singleSeat", dn: 40, ratedCv: 30, note: "常规流道参考" },
  { valveType: "singleSeat", dn: 50, ratedCv: 50, note: "常规流道参考" },
  { valveType: "singleSeat", dn: 80, ratedCv: 110, note: "常规流道参考" },
  { valveType: "singleSeat", dn: 100, ratedCv: 180, note: "常规流道参考" },
  { valveType: "singleSeat", dn: 150, ratedCv: 420, note: "较大流量参考" },
  { valveType: "singleSeat", dn: 200, ratedCv: 700, note: "较大流量参考" },

  { valveType: "cage", dn: 25, ratedCv: 15, note: "套筒阀参考" },
  { valveType: "cage", dn: 40, ratedCv: 40, note: "套筒阀参考" },
  { valveType: "cage", dn: 50, ratedCv: 70, note: "套筒阀参考" },
  { valveType: "cage", dn: 80, ratedCv: 160, note: "套筒阀参考" },
  { valveType: "cage", dn: 100, ratedCv: 260, note: "套筒阀参考" },
  { valveType: "cage", dn: 150, ratedCv: 600, note: "套筒阀参考" },
  { valveType: "cage", dn: 200, ratedCv: 1000, note: "套筒阀参考" },
  { valveType: "cage", dn: 250, ratedCv: 1600, note: "套筒阀参考" },
  { valveType: "cage", dn: 300, ratedCv: 2400, note: "套筒阀参考" },

  { valveType: "vball", dn: 25, ratedCv: 20, note: "V 型球阀参考" },
  { valveType: "vball", dn: 40, ratedCv: 55, note: "V 型球阀参考" },
  { valveType: "vball", dn: 50, ratedCv: 90, note: "V 型球阀参考" },
  { valveType: "vball", dn: 80, ratedCv: 230, note: "V 型球阀参考" },
  { valveType: "vball", dn: 100, ratedCv: 380, note: "V 型球阀参考" },
  { valveType: "vball", dn: 150, ratedCv: 900, note: "V 型球阀参考" },
  { valveType: "vball", dn: 200, ratedCv: 1600, note: "V 型球阀参考" },
  { valveType: "vball", dn: 250, ratedCv: 2600, note: "V 型球阀参考" },
  { valveType: "vball", dn: 300, ratedCv: 3800, note: "V 型球阀参考" },

  { valveType: "butterfly", dn: 50, ratedCv: 110, note: "蝶阀参考" },
  { valveType: "butterfly", dn: 80, ratedCv: 300, note: "蝶阀参考" },
  { valveType: "butterfly", dn: 100, ratedCv: 500, note: "蝶阀参考" },
  { valveType: "butterfly", dn: 150, ratedCv: 1200, note: "蝶阀参考" },
  { valveType: "butterfly", dn: 200, ratedCv: 2200, note: "蝶阀参考" },
  { valveType: "butterfly", dn: 250, ratedCv: 3600, note: "蝶阀参考" },
  { valveType: "butterfly", dn: 300, ratedCv: 5200, note: "蝶阀参考" },
  { valveType: "butterfly", dn: 400, ratedCv: 9000, note: "蝶阀参考" },
  { valveType: "butterfly", dn: 500, ratedCv: 14000, note: "蝶阀参考" }
].map((item) => ({
  ...item,
  displayType: valveTypes[item.valveType].name,
  ratedKv: item.ratedCv / 1.156
}));

const liquidVaporPressureKpaA = {
  water: 2.34,
  methanol: 12.3,
  ethanol: 5.95,
  acetone: 24.7,
  vinylacetateLiquid: 11.7,
  propyleneLiquid: "",
  propaneLiquid: "",
  custom: ""
};

const valveFluidType = document.getElementById("valveFluidType");
const valveType = document.getElementById("valveType");
const valveServiceFeature = document.getElementById("valveServiceFeature");
const valveLiquidBox = document.getElementById("valveLiquidBox");
const valveGasBox = document.getElementById("valveGasBox");
const valveLiquidMedium = document.getElementById("valveLiquidMedium");
const valveLiquidFlow = document.getElementById("valveLiquidFlow");
const valveLiquidP1G = document.getElementById("valveLiquidP1G");
const valveLiquidP2G = document.getElementById("valveLiquidP2G");
const valveLiquidTempC = document.getElementById("valveLiquidTempC");
const valveLiquidAtm = document.getElementById("valveLiquidAtm");
const valveLiquidDensity = document.getElementById("valveLiquidDensity");
const valveLiquidVaporPressure = document.getElementById("valveLiquidVaporPressure");
const valveGasMedium = document.getElementById("valveGasMedium");
const valveGasStdFlow = document.getElementById("valveGasStdFlow");
const valveGasP1G = document.getElementById("valveGasP1G");
const valveGasP2G = document.getElementById("valveGasP2G");
const valveGasTempC = document.getElementById("valveGasTempC");
const valveGasAtm = document.getElementById("valveGasAtm");
const valveGasActualZ = document.getElementById("valveGasActualZ");
const valveGasXt = document.getElementById("valveGasXt");
const valveRatedCv = document.getElementById("valveRatedCv");
const valveCatalogMode = document.getElementById("valveCatalogMode");
const valveCatalogDnFilter = document.getElementById("valveCatalogDnFilter");
const valveStdPressure = document.getElementById("valveStdPressure");
const valveStdTemp = document.getElementById("valveStdTemp");
const valveStdZ = document.getElementById("valveStdZ");
const valveCalcBtn = document.getElementById("valveCalcBtn");
const valveResult = document.getElementById("valveResult");

function updateValveVisibility() {
  const isGas = valveFluidType.value === "gas";
  valveLiquidBox.classList.toggle("hidden", isGas);
  valveGasBox.classList.toggle("hidden", !isGas);
  valveGasXt.disabled = !isGas;
  valveStdPressure.disabled = !isGas;
  valveStdTemp.disabled = !isGas;
  valveStdZ.disabled = !isGas;
  valveResult.textContent = "结果将在这里显示";
}

function updateValveLiquidByMedium() {
  const medium = liquidMediums[valveLiquidMedium.value];
  if (!medium) return;
  if (valveLiquidMedium.value !== "custom") {
    valveLiquidDensity.value = medium.density;
    const vp = liquidVaporPressureKpaA[valveLiquidMedium.value];
    valveLiquidVaporPressure.value = vp === undefined ? "" : vp;
  } else {
    valveLiquidDensity.value = "";
    valveLiquidDensity.placeholder = "请输入工况密度";
    valveLiquidVaporPressure.value = "";
  }
}

function updateValveXtByType() {
  const type = valveTypes[valveType.value];
  if (type && Number.isFinite(type.xT)) {
    valveGasXt.value = type.xT;
  }
}

function getValvePressureInfo(p1G, p2G, atm) {
  if (!Number.isFinite(p1G) || !Number.isFinite(p2G) || !Number.isFinite(atm)) {
    return { error: "请输入有效的入口压力、出口压力和大气压" };
  }
  const p1Abs = p1G + atm;
  const p2Abs = p2G + atm;
  const dpKpa = p1G - p2G;
  const dpBar = dpKpa / 100;
  if (p1Abs <= 0 || p2Abs <= 0) return { error: "入口或出口绝压不合理" };
  if (dpKpa <= 0) return { error: "入口压力必须大于出口压力，压差 ΔP 应大于 0" };
  return { p1Abs, p2Abs, dpKpa, dpBar };
}

function calcKvCvFromLiquid(flowM3h, densityKgM3, dpBar) {
  const sg = densityKgM3 / 1000;
  const kv = flowM3h * Math.sqrt(sg / dpBar);
  const cv = kv * 1.156;
  return { kv, cv, sg };
}

function calcValveUtilization(cv, ratedCv) {
  if (!Number.isFinite(ratedCv) || ratedCv <= 0) return null;
  const ratio = cv / ratedCv;
  let text;
  if (ratio < 0.2) text = "阀可能偏大，低开度控制性能较差。";
  else if (ratio < 0.4) text = "阀略偏大，建议关注小流量控制。";
  else if (ratio <= 0.7) text = "Cv 利用率较理想，通常有较好调节余量。";
  else if (ratio <= 0.85) text = "可用，但余量偏小，建议核实最大流量工况。";
  else text = "阀可能偏小或余量不足，建议增大规格或核实工况。";
  return { ratio, text };
}

function getRecommendedRatedCvRange(requiredCv) {
  return {
    min: requiredCv / valveIdealUtilization.max,
    max: requiredCv / valveIdealUtilization.min
  };
}

function getValveUtilizationBadge(ratio) {
  if (ratio < 0.2) return "明显偏大";
  if (ratio < 0.4) return "偏大";
  if (ratio <= 0.7) return "推荐";
  if (ratio <= 0.85) return "余量偏小";
  if (ratio <= 1) return "接近满开";
  return "能力不足";
}

function getAllowedCatalogTypes(selectedType, serviceFeature, fluidType, gasInfo) {
  if (selectedType === "custom") return ["singleSeat", "cage", "vball", "butterfly"];

  const allowed = new Set([selectedType]);
  if (serviceFeature === "particles") allowed.add("vball");
  if (serviceFeature === "largeFlowLowDp") {
    allowed.add("butterfly");
    allowed.add("vball");
  }
  if (serviceFeature === "highDp") allowed.add("cage");
  if (serviceFeature === "normal") {
    allowed.add("singleSeat");
    allowed.add("cage");
  }
  if (fluidType === "gas" && gasInfo && gasInfo.xRatio > 0.18) allowed.add("cage");
  return Array.from(allowed);
}

function scoreValveCatalogItem(item, requiredCv, selectedType, serviceFeature, fluidType, gasInfo) {
  const util = requiredCv / item.ratedCv;
  const targetDistance = Math.abs(util - valveIdealUtilization.target);
  let penalty = 0;

  if (item.valveType !== selectedType && selectedType !== "custom") penalty += 0.08;
  if (serviceFeature === "particles" && item.valveType !== "vball") penalty += 0.35;
  if (serviceFeature === "largeFlowLowDp" && !["butterfly", "vball"].includes(item.valveType)) penalty += 0.2;
  if (serviceFeature === "highDp" && item.valveType !== "cage") penalty += 0.22;
  if (fluidType === "gas" && gasInfo && gasInfo.xRatio > 0.18 && item.valveType === "butterfly") penalty += 0.25;
  if (util > 1) penalty += 1 + (util - 1);
  if (util < 0.2) penalty += 0.45;

  return targetDistance + penalty;
}

function getValveCatalogCandidates(requiredCv, selectedType, serviceFeature, fluidType, gasInfo) {
  if (!valveCatalogMode || valveCatalogMode.value !== "on") return [];

  const dnFilter = valveCatalogDnFilter ? valveCatalogDnFilter.value : "all";
  const allowedTypes = getAllowedCatalogTypes(selectedType, serviceFeature, fluidType, gasInfo);

  return valveCatalog
    .filter((item) => allowedTypes.includes(item.valveType))
    .filter((item) => dnFilter === "all" || String(item.dn) === dnFilter)
    .map((item) => {
      const ratio = requiredCv / item.ratedCv;
      return {
        ...item,
        ratio,
        badge: getValveUtilizationBadge(ratio),
        score: scoreValveCatalogItem(item, requiredCv, selectedType, serviceFeature, fluidType, gasInfo)
      };
    })
    .sort((a, b) => a.score - b.score || Math.abs(a.ratio - valveIdealUtilization.target) - Math.abs(b.ratio - valveIdealUtilization.target))
    .slice(0, 6);
}

function renderValveRatedCvRange(requiredCv) {
  const range = getRecommendedRatedCvRange(requiredCv);
  return `<div class="result-ok">推荐额定 Cv 范围：${formatNumber(range.min, 2)} ～ ${formatNumber(range.max, 2)}（按所需 Cv 占额定 Cv 40%～70% 估算）</div>`;
}

function renderValveCatalogTable(requiredCv, selectedType, serviceFeature, fluidType, gasInfo) {
  const candidates = getValveCatalogCandidates(requiredCv, selectedType, serviceFeature, fluidType, gasInfo);
  if (!valveCatalogMode || valveCatalogMode.value !== "on") return "";

  if (candidates.length === 0) {
    return `<div class="result-warning">参考阀库未找到合适候选项，可关闭口径过滤或手动输入候选额定 Cv。</div>`;
  }

  let html = `<div class="result-detail">参考阀库候选（通用参考，非厂家正式样本）：</div>`;
  html += `<div class="catalog-scroll"><table class="catalog-table">`;
  html += `<thead><tr><th>阀型</th><th>DN</th><th>参考额定 Cv</th><th>利用率</th><th>判断</th></tr></thead><tbody>`;
  candidates.forEach((item) => {
    const ratioText = `${formatNumber(item.ratio * 100, 1)}%`;
    html += `<tr>`;
    html += `<td>${item.displayType}</td>`;
    html += `<td>DN${item.dn}</td>`;
    html += `<td>${formatNumber(item.ratedCv, 2)}</td>`;
    html += `<td>${ratioText}</td>`;
    html += `<td><span class="catalog-badge">${item.badge}</span></td>`;
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  return html;
}

function initValveCatalogDnFilter() {
  if (!valveCatalogDnFilter) return;
  const current = valveCatalogDnFilter.value || "all";
  const dns = Array.from(new Set(valveCatalog.map((item) => item.dn))).sort((a, b) => a - b);
  valveCatalogDnFilter.innerHTML = `<option value="all">全部口径</option>`;
  dns.forEach((dn) => {
    const option = document.createElement("option");
    option.value = String(dn);
    option.textContent = `DN${dn}`;
    valveCatalogDnFilter.appendChild(option);
  });
  valveCatalogDnFilter.value = Array.from(valveCatalogDnFilter.options).some((o) => o.value === current) ? current : "all";
}

function getValveTypeSuggestion(fluidType, selectedType, serviceFeature, dpKpa, flow, gasInfo) {
  const notes = [];
  let recommended = "单座调节阀 / 套筒调节阀";

  if (serviceFeature === "particles") {
    recommended = "V 型球阀";
    notes.push("介质含颗粒、易结晶或易堵时，优先考虑 V 型球阀等不易堵结构。 ");
  } else if (serviceFeature === "largeFlowLowDp") {
    recommended = "蝶阀 / V 型球阀";
    notes.push("大流量、低压差场景可优先考虑蝶阀或 V 型球阀。 ");
  } else if (serviceFeature === "highDp" || dpKpa > 1000 || (gasInfo && gasInfo.xRatio > 0.25)) {
    recommended = "套筒调节阀 / 多级降压结构";
    notes.push("高压差场景优先考虑套筒阀、多级降压或抗噪声/抗气蚀结构。 ");
  } else if (serviceFeature === "corrosive") {
    recommended = "按材质优先选型，必要时考虑衬氟阀或耐腐蚀结构";
    notes.push("腐蚀性介质应优先核对阀体、阀芯、阀座、填料及垫片材质。 ");
  } else if (fluidType === "gas" && gasInfo && gasInfo.xRatio > 0.18) {
    recommended = "套筒调节阀";
    notes.push("气体压差比较高时，应关注噪声、振动和临界流风险。 ");
  }

  if (selectedType === "butterfly" && (dpKpa > 300 || serviceFeature === "highDp")) {
    notes.push("当前选择蝶阀，但压差不低；蝶阀更适合大流量、低压差工况。 ");
  }
  if (selectedType === "singleSeat" && (dpKpa > 1000 || serviceFeature === "highDp")) {
    notes.push("当前选择单座阀，高压差下需重点核实执行机构推力、阀芯稳定性和冲刷。 ");
  }
  if (selectedType === "vball" && serviceFeature === "normal" && flow < 5) {
    notes.push("小流量精细控制场景，V 型球阀不一定优于直行程调节阀。 ");
  }
  if (selectedType === "cage" && serviceFeature !== "largeFlowLowDp") {
    notes.push("套筒阀适用范围较宽，尤其适合中高压差和抗冲刷场景。 ");
  }

  return { recommended, notes };
}

function buildLiquidValveWarnings(pressure, vaporPressure, mediumWarning) {
  const warnings = [];
  if (Number.isFinite(vaporPressure) && vaporPressure > 0) {
    if (pressure.p2Abs <= vaporPressure) {
      warnings.push("出口绝压低于或接近饱和蒸汽压，存在闪蒸风险。 ");
    } else {
      const cavitationIndex = pressure.dpKpa / Math.max(pressure.p1Abs - vaporPressure, 1e-9);
      if (cavitationIndex > 0.7) warnings.push("液体压降占可用压力比例较高，存在明显气蚀风险，建议做厂家正式气蚀校核。 ");
      else if (cavitationIndex > 0.45) warnings.push("液体压降偏高，建议关注气蚀、噪声和阀内件冲刷。 ");
    }
  }
  if (pressure.dpKpa > 1000) warnings.push("液体压差超过 1 MPa，建议优先核实气蚀、闪蒸和多级降压需求。 ");
  if (mediumWarning) warnings.push(mediumWarning);
  return warnings;
}

function handleValveLiquidCalc() {
  const medium = liquidMediums[valveLiquidMedium.value];
  const flow = getNumber(valveLiquidFlow);
  const p1G = getNumber(valveLiquidP1G);
  const p2G = getNumber(valveLiquidP2G);
  const atm = getNumber(valveLiquidAtm);
  const density = getNumber(valveLiquidDensity);
  const vaporPressure = getNumber(valveLiquidVaporPressure);
  const ratedCv = getNumber(valveRatedCv);

  if (!Number.isFinite(flow) || flow <= 0) {
    valveResult.textContent = "请输入有效的液体体积流量";
    return;
  }
  if (!Number.isFinite(density) || density <= 0) {
    valveResult.textContent = "请输入有效的液体密度";
    return;
  }

  const pressure = getValvePressureInfo(p1G, p2G, atm);
  if (pressure.error) {
    valveResult.textContent = pressure.error;
    return;
  }

  const { kv, cv, sg } = calcKvCvFromLiquid(flow, density, pressure.dpBar);
  const massKgH = flow * density;
  const util = calcValveUtilization(cv, ratedCv);
  const suggestion = getValveTypeSuggestion("liquid", valveType.value, valveServiceFeature.value, pressure.dpKpa, flow, null);
  const warnings = buildLiquidValveWarnings(pressure, vaporPressure, medium.warning).concat(suggestion.notes);

  let html = `液体调节阀初选（${medium.name}）<br>`;
  html += `所需 Kv：${formatNumber(kv, 4)}<br>`;
  html += `所需 Cv：${formatNumber(cv, 4)}<br>`;
  html += `压差 ΔP：${formatNumber(pressure.dpKpa, 4)} kPa（${formatNumber(pressure.dpBar, 4)} bar）<br>`;
  html += `质量流量：${formatNumber(massKgH, 4)} kg/h（${formatNumber(massKgH / 1000, 4)} t/h）`;

  html += `<div class="result-detail">`;
  html += `已选阀型：${valveTypes[valveType.value].name}<br>`;
  html += `建议方向：${suggestion.recommended}<br>`;
  html += `SG=${formatNumber(sg, 4)}，P1=${formatNumber(pressure.p1Abs, 4)} kPaA，P2=${formatNumber(pressure.p2Abs, 4)} kPaA`;
  if (Number.isFinite(vaporPressure) && vaporPressure > 0) html += `，Pv=${formatNumber(vaporPressure, 4)} kPaA`;
  html += `</div>`;

  if (util) {
    const cls = util.ratio >= 0.4 && util.ratio <= 0.7 ? "result-ok" : "result-warning";
    html += `<div class="${cls}">额定 Cv 利用率：${formatNumber(util.ratio * 100, 2)}%。${util.text}</div>`;
  }

  html += renderValveRatedCvRange(cv);
  html += renderValveCatalogTable(cv, valveType.value, valveServiceFeature.value, "liquid", null);

  if (warnings.length > 0) html += `<div class="result-warning">${warnings.join("<br>")}</div>`;

  valveResult.innerHTML = html;
}

function handleValveGasCalc() {
  const medium = gasMediums[valveGasMedium.value];
  const stdFlow = getNumber(valveGasStdFlow);
  const p1G = getNumber(valveGasP1G);
  const p2G = getNumber(valveGasP2G);
  const tempC = getNumber(valveGasTempC);
  const atm = getNumber(valveGasAtm);
  const actualZ = getNumber(valveGasActualZ);
  const xT = getNumber(valveGasXt);
  const stdPressure = getNumber(valveStdPressure);
  const stdTempC = getNumber(valveStdTemp);
  const stdZ = getNumber(valveStdZ);
  const ratedCv = getNumber(valveRatedCv);

  if (!Number.isFinite(stdFlow) || stdFlow <= 0) {
    valveResult.textContent = "请输入有效的气体标况体积流量";
    return;
  }
  if (!Number.isFinite(tempC) || !Number.isFinite(actualZ) || actualZ <= 0 || !Number.isFinite(xT) || xT <= 0 || xT > 1) {
    valveResult.textContent = "请输入有效的气体温度、Z 和 xT";
    return;
  }
  if (!Number.isFinite(stdPressure) || stdPressure <= 0 || !Number.isFinite(stdTempC) || !Number.isFinite(stdZ) || stdZ <= 0) {
    valveResult.textContent = "请输入有效的气体标况参数";
    return;
  }

  const pressure = getValvePressureInfo(p1G, p2G, atm);
  if (pressure.error) {
    valveResult.textContent = pressure.error;
    return;
  }

  const actualTempK = tempC + 273.15;
  const stdTempK = stdTempC + 273.15;
  if (actualTempK <= 0 || stdTempK <= 0) {
    valveResult.textContent = "温度参数不合理";
    return;
  }

  const actualDensity = calcGasDensityKgM3(medium.molarMass, pressure.p1Abs, actualTempK, actualZ);
  const stdDensity = calcGasDensityKgM3(medium.molarMass, stdPressure, stdTempK, stdZ);
  const massKgH = stdFlow * stdDensity;
  const actualFlowM3h = massKgH / actualDensity;
  const xRatio = pressure.dpKpa / pressure.p1Abs;
  const fGamma = (medium.kappa || 1.4) / 1.4;
  const xChoked = Math.max(0.05, Math.min(fGamma * xT, 0.95));
  const isChoked = xRatio >= xChoked;
  const xEffective = Math.min(xRatio, xChoked);
  const dpEffectiveBar = (xEffective * pressure.p1Abs) / 100;
  const y = Math.max(2 / 3, 1 - xEffective / (3 * xChoked));

  if (!Number.isFinite(dpEffectiveBar) || dpEffectiveBar <= 0 || !Number.isFinite(y) || y <= 0) {
    valveResult.textContent = "气体压差参数不合理，无法估算 Cv";
    return;
  }

  const sgActual = actualDensity / 1000;
  const kv = actualFlowM3h * Math.sqrt(sgActual / dpEffectiveBar) / y;
  const cv = kv * 1.156;
  const util = calcValveUtilization(cv, ratedCv);
  const gasInfo = { xRatio, xChoked, isChoked };
  const suggestion = getValveTypeSuggestion("gas", valveType.value, valveServiceFeature.value, pressure.dpKpa, actualFlowM3h, gasInfo);
  const warnings = [];

  if (isChoked) warnings.push("当前压差比已达到或超过临界压差比，气体可能处于临界流/阻塞流状态。 ");
  else if (xRatio > 0.8 * xChoked) warnings.push("当前压差比接近临界压差比，建议关注噪声、振动和临界流风险。 ");
  if (xRatio > 0.3) warnings.push("气体压差比较高，当前 Cv 属于工程估算，建议做厂家正式噪声和阀内件校核。 ");
  if (pressure.p1Abs > 1000) warnings.push("入口绝压超过 1 MPaA，建议根据物性数据修正压缩因子 Z。 ");
  if (medium.warning) warnings.push(medium.warning);
  warnings.push(...suggestion.notes);

  let html = `气体调节阀初选（${medium.name}）<br>`;
  html += `所需 Kv：${formatNumber(kv, 4)}<br>`;
  html += `所需 Cv：${formatNumber(cv, 4)}<br>`;
  html += `工况体积流量：${formatNumber(actualFlowM3h, 4)} m³/h<br>`;
  html += `质量流量：${formatNumber(massKgH, 4)} kg/h（${formatNumber(massKgH / 1000, 4)} t/h）<br>`;
  html += `压差 ΔP：${formatNumber(pressure.dpKpa, 4)} kPa`;

  html += `<div class="result-detail">`;
  html += `已选阀型：${valveTypes[valveType.value].name}<br>`;
  html += `建议方向：${suggestion.recommended}<br>`;
  html += `P1=${formatNumber(pressure.p1Abs, 4)} kPaA，P2=${formatNumber(pressure.p2Abs, 4)} kPaA，x=ΔP/P1=${formatNumber(xRatio, 4)}<br>`;
  html += `xT=${formatNumber(xT, 4)}，Fγ=${formatNumber(fGamma, 4)}，x临界≈${formatNumber(xChoked, 4)}，Y=${formatNumber(y, 4)}<br>`;
  html += `工况密度=${formatNumber(actualDensity, 4)} kg/m³，标况密度=${formatNumber(stdDensity, 4)} kg/m³`;
  html += `</div>`;

  if (util) {
    const cls = util.ratio >= 0.4 && util.ratio <= 0.7 ? "result-ok" : "result-warning";
    html += `<div class="${cls}">额定 Cv 利用率：${formatNumber(util.ratio * 100, 2)}%。${util.text}</div>`;
  }

  html += renderValveRatedCvRange(cv);
  html += renderValveCatalogTable(cv, valveType.value, valveServiceFeature.value, "gas", gasInfo);

  if (warnings.length > 0) html += `<div class="result-warning">${warnings.join("<br>")}</div>`;

  valveResult.innerHTML = html;
}

function handleValveCalc() {
  if (valveFluidType.value === "liquid") handleValveLiquidCalc();
  else handleValveGasCalc();
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

setOptions(orificeGasMedium, gasMediums);
setOptions(orificeLiquidMedium, liquidMediums);
updateOrificeKappaByMedium();
updateLiquidDensityByMedium();
updateOrificeVisibility();

orificeCalcBtn.addEventListener("click", handleOrificeCalc);
[
  orificeMode,
  orificeFluidType,
  orificeGasMedium,
  orificeLiquidMedium,
  orificeLiquidDensity,
  orificePressureG,
  orificeTempC,
  orificeAtmPressure,
  orificeActualZ,
  orificePipeD,
  orificeBoreD,
  orificeDpKpa,
  orificeFlowM3h,
  orificeCoeffC,
  orificeEpsilonMode,
  orificeEpsilon,
  orificeKappa,
  orificeStdPressure,
  orificeStdTemp,
  orificeStdZ
].forEach((el) => {
  el.addEventListener("input", handleOrificeCalc);
  el.addEventListener("change", handleOrificeCalc);
});

orificeMode.addEventListener("change", updateOrificeVisibility);
orificeFluidType.addEventListener("change", updateOrificeVisibility);
orificeEpsilonMode.addEventListener("change", updateOrificeVisibility);
orificeGasMedium.addEventListener("change", () => {
  updateOrificeKappaByMedium();
  handleOrificeCalc();
});
orificeLiquidMedium.addEventListener("change", () => {
  updateLiquidDensityByMedium();
  handleOrificeCalc();
});

setOptions(valveType, valveTypes);
setOptions(valveGasMedium, gasMediums);
setOptions(valveLiquidMedium, liquidMediums);
initValveCatalogDnFilter();
updateValveLiquidByMedium();
updateValveXtByType();
updateValveVisibility();

valveCalcBtn.addEventListener("click", handleValveCalc);
[
  valveFluidType,
  valveType,
  valveServiceFeature,
  valveLiquidMedium,
  valveLiquidFlow,
  valveLiquidP1G,
  valveLiquidP2G,
  valveLiquidTempC,
  valveLiquidAtm,
  valveLiquidDensity,
  valveLiquidVaporPressure,
  valveGasMedium,
  valveGasStdFlow,
  valveGasP1G,
  valveGasP2G,
  valveGasTempC,
  valveGasAtm,
  valveGasActualZ,
  valveGasXt,
  valveRatedCv,
  valveCatalogMode,
  valveCatalogDnFilter,
  valveStdPressure,
  valveStdTemp,
  valveStdZ
].forEach((el) => {
  el.addEventListener("input", handleValveCalc);
  el.addEventListener("change", handleValveCalc);
});

valveFluidType.addEventListener("change", updateValveVisibility);
valveType.addEventListener("change", () => {
  updateValveXtByType();
  handleValveCalc();
});
valveLiquidMedium.addEventListener("change", () => {
  updateValveLiquidByMedium();
  handleValveCalc();
});

