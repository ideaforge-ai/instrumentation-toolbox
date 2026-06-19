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

if (valveCalcBtn) valveCalcBtn.addEventListener("click", handleValveCalc);
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
].filter(Boolean).forEach((el) => {
  el.addEventListener("input", handleValveCalc);
  el.addEventListener("change", handleValveCalc);
});

if (valveFluidType) valveFluidType.addEventListener("change", updateValveVisibility);
if (valveType) valveType.addEventListener("change", () => {
  updateValveXtByType();
  handleValveCalc();
});
if (valveLiquidMedium) valveLiquidMedium.addEventListener("change", () => {
  updateValveLiquidByMedium();
  handleValveCalc();
});



/* 规格书生成：压力 / 差压变送器 / 科里奥利质量流量计 / 电磁流量计 / 调节阀 V1.6-E */
const specFieldIds = [
  "specType",
  "specProjectNo", "specFileNo", "specProjectName", "specPlantName", "specDesignStage", "specRev",
  "specTag", "specPid", "specService", "specFunction", "specHazardClass", "specHazardCert",
  "specFluid", "specFluidState", "specDensity", "specViscosity", "specPMin", "specPNormal", "specPMax",
  "specTMin", "specTNormal", "specTMax", "specDesignPressure", "specDesignTemp",
  "specDpFlowRange", "specDpMax", "specStaticPressure", "specHpLpSize", "specHpLpRating", "specHpLpFacing", "specFlushingConnection", "specDpManifold",
  "specTxType", "specOutput", "specProtocol", "specSupply", "specInstrRange", "specCalibRange", "specDcsRange",
  "specDamping", "specAccuracy", "specProtection", "specMounting", "specProcessConnType", "specProcessConnSize",
  "specProcessConnRating", "specProcessConnFacing", "specProcessConnRoughness", "specElectricalConn", "specGrounding",
  "specWettedMaterial", "specHousing", "specBracketMaterial", "specPaint", "specSeparatorMode", "specSeparatorType",
  "specRemoteCapillary", "specCapillaryLength", "specCapillaryArmour", "specFillingFluid", "specFlushingRing",
  "specLocalMeter", "specManifold", "specTracing", "specNe43", "specManufacturer", "specModel", "specSupplier", "specNotes",
  "specLineNumber", "specLineSize", "specLineRating", "specLineClass", "specLineMaterial",
  "specFoaming", "specEntrainedSolid", "specCorrosiveAbrasive", "specBuildUp", "specPulsatingFlow", "specVibration",
  "specFlowMin", "specFlowNormal", "specFlowMax", "specFlowRange", "specMaxPressureDrop", "specMolecularMass", "specSpecificGravity",
  "specMeterTubeType", "specCalculatedPressureDrop", "specFlowDirection", "specMeterConnType", "specMeterRoughness", "specMeterSize", "specMeterRating", "specMeterFacing", "specLiningCoating", "specMeterTubeMaterial", "specFlangeMaterial", "specMeterTubeModel", "specMeterHazardExecution",
  "specCoriolisMounting", "specDistanceFromMeter", "specCoriolisPower", "specMaxLoad", "specZeroStability", "specCoriolisAccuracy", "specTxHazardExecution", "specTxHousingMaterial", "specTxModel", "specTransmitterHolder", "specInterconnectionCable", "specTransmitterConfigurator", "specDiagnostic",
  "specMagLineNumber", "specMagLineSize", "specMagLineRating", "specMagLineClass", "specMagLineMaterial", "specMagFoaming", "specMagEntrainedSolid", "specMagCorrosiveAbrasive", "specMagBuildUp", "specMagPulsatingFlow", "specMagVibration", "specMagFlowMin", "specMagFlowNormal", "specMagFlowMax", "specMagFlowRange", "specMagMaxPressureDrop", "specMagSpecificGravity", "specMagMolecularMass", "specMagTransducerType", "specMagInstrumentRange", "specMagInstrumentAccuracy", "specMagProcessConnection", "specMagFlangeMaterial", "specMagBodyMaterial", "specMagLiningMaterial", "specMagElectrodeType", "specMagElectrodeMaterial", "specMagGroundingRing", "specMagSpecialCableLength", "specMagSpecialCableEntry", "specMagMounting", "specMagMeasuringRange", "specMagMeasuringAccuracy", "specMagCableEntry", "specMagPowerSupply", "specMagPowerCableEntry", "specMagHousingMaterial", "specMagIntegralIndicator", "specMagTotalizerUnit", "specMagMountingBracket", "specMagBracketMaterial",
  "specCvAllowNoise", "specCvAirSupply", "specCvAirDesign", "specCvLineInlet", "specCvLineOutlet", "specCvLineClass", "specCvPipeMaterial", "specCvDesignPressure", "specCvDesignTemp", "specCvFailurePosition", "specCvDensity", "specCvSpecificGravity", "specCvVaporPressure", "specCvHeatRatio", "specCvMolecularMass", "specCvViscosity", "specCvFlow", "specCvInletPressure", "specCvPressureDrop", "specCvInletTemperature", "specCvShutoffDp", "specCvLeakageClass", "specCvFlowCoefficient", "specCvSoundPressure", "specCvTravel", "specCvValveType", "specCvRatedCvRangeability", "specCvEndConnection", "specCvRoughness", "specCvBodySize", "specCvBodyRatingFacing", "specCvFlowAction", "specCvBonnet", "specCvTrim", "specCvSealing", "specCvMatBodyBonnet", "specCvMatPlugSeat", "specCvMatStemGuides", "specCvPacking", "specCvYokeHousing", "specCvBellows", "specCvActuator", "specCvActuatorAction", "specCvActuatorSizeSpring", "specCvPositioner", "specCvPositionerSignalAction", "specCvPneumaticConnection", "specCvPositionerProtection", "specCvAirSet", "specCvLimitSwitch", "specCvSolenoid", "specCvTracing", "specCvBoosterAirLock", "specCvManufacturer", "specCvModel", "specCvSupplier"
];

const specBaseDefaults = {
  specType: "pressure",
  specProjectNo: "",
  specFileNo: "",
  specProjectName: "",
  specPlantName: "",
  specDesignStage: "详细设计",
  specRev: "C00",
  specTag: "",
  specPid: "",
  specService: "",
  specFunction: "Pressure Transmitter Gauge",
  specHazardClass: "Zone 2, Gr. IIC, T6",
  specHazardCert: "EEx-i / ATEX",
  specFluid: "",
  specFluidState: "Gas",
  specDensity: "",
  specViscosity: "",
  specPMin: "",
  specPNormal: "",
  specPMax: "",
  specTMin: "",
  specTNormal: "",
  specTMax: "",
  specDesignPressure: "",
  specDesignTemp: "",
  specDpFlowRange: "",
  specDpMax: "",
  specStaticPressure: "",
  specHpLpSize: "1/2\" NPT (F)",
  specHpLpRating: "",
  specHpLpFacing: "",
  specFlushingConnection: "",
  specDpManifold: "3 Valve Manifold",
  specTxType: "Smart / 2 Wire",
  specOutput: "4 - 20 mA",
  specProtocol: "HART",
  specSupply: "24 VDC",
  specInstrRange: "",
  specCalibRange: "",
  specDcsRange: "",
  specDamping: "Set",
  specAccuracy: "± 0.065% Span",
  specProtection: "IP 65",
  specMounting: "Bracket For On Equipment Tag / 2” Pipe Mounting",
  specProcessConnType: "Threaded",
  specProcessConnSize: "1/2\" NPT (F)",
  specProcessConnRating: "",
  specProcessConnFacing: "",
  specProcessConnRoughness: "",
  specElectricalConn: "1/2\" NPT(F), 2 Nos. min.",
  specGrounding: "Internal and External",
  specWettedMaterial: "SS316L",
  specHousing: "Die-Cast Aluminium",
  specBracketMaterial: "SS",
  specPaint: "Manufacturer Std.",
  specSeparatorMode: "none",
  specSeparatorType: "Diaphragm seal type",
  specRemoteCapillary: "Yes",
  specCapillaryLength: "",
  specCapillaryArmour: "Required",
  specFillingFluid: "Silicon oil",
  specFlushingRing: "",
  specLocalMeter: "Required",
  specManifold: "",
  specTracing: "",
  specNe43: "Yes",
  specManufacturer: "",
  specModel: "",
  specSupplier: "",
  specNotes: "",
  specLineNumber: "", specLineSize: "", specLineRating: "", specLineClass: "", specLineMaterial: "",
  specFoaming: "", specEntrainedSolid: "", specCorrosiveAbrasive: "", specBuildUp: "", specPulsatingFlow: "", specVibration: "",
  specFlowMin: "", specFlowNormal: "", specFlowMax: "", specFlowRange: "", specMaxPressureDrop: "", specMolecularMass: "", specSpecificGravity: "",
  specMeterTubeType: "Double Tube", specCalculatedPressureDrop: "", specFlowDirection: "Uni-Directional", specMeterConnType: "Flanged", specMeterRoughness: "125 - 250 AARH", specMeterSize: "", specMeterRating: "", specMeterFacing: "RF", specLiningCoating: "", specMeterTubeMaterial: "316LSS", specFlangeMaterial: "F316/F316L", specMeterTubeModel: "", specMeterHazardExecution: "EEx-i",
  specCoriolisMounting: "分体式安装", specDistanceFromMeter: "", specCoriolisPower: "220 VAC, 50Hz U.P.S", specMaxLoad: "MFR.STD", specZeroStability: "MFR.STD", specCoriolisAccuracy: "± 0.1 %", specTxHazardExecution: "EEx-i (Signal) & EEx-d (Power Supply)", specTxHousingMaterial: "Die Cast Aluminium", specTxModel: "1700R15ABFMZZZPK", specTransmitterHolder: "YES", specInterconnectionCable: "YES / MFR.STD", specTransmitterConfigurator: "Not Required", specDiagnostic: "Required",
  specMagLineNumber: "", specMagLineSize: "", specMagLineRating: "", specMagLineClass: "", specMagLineMaterial: "", specMagFoaming: "", specMagEntrainedSolid: "", specMagCorrosiveAbrasive: "", specMagBuildUp: "", specMagPulsatingFlow: "", specMagVibration: "", specMagFlowMin: "", specMagFlowNormal: "", specMagFlowMax: "", specMagFlowRange: "", specMagMaxPressureDrop: "", specMagSpecificGravity: "", specMagMolecularMass: "", specMagTransducerType: "Pipe type", specMagInstrumentRange: "", specMagInstrumentAccuracy: "+/-0.3%", specMagProcessConnection: "", specMagFlangeMaterial: "SS 316", specMagBodyMaterial: "SS 316", specMagLiningMaterial: "PTFE", specMagElectrodeType: "", specMagElectrodeMaterial: "SS 316L", specMagGroundingRing: "YES / SS 316L", specMagSpecialCableLength: "", specMagSpecialCableEntry: "", specMagMounting: "Integral", specMagMeasuringRange: "", specMagMeasuringAccuracy: "+/-0.3%", specMagCableEntry: "1/2\" NPT(F), 2 Nos. min.", specMagPowerSupply: "24VDC", specMagPowerCableEntry: "", specMagHousingMaterial: "Die Cast Aluminium", specMagIntegralIndicator: "YES", specMagTotalizerUnit: "", specMagMountingBracket: "", specMagBracketMaterial: "",
  specCvAllowNoise: "<85 dBA @ 1 m", specCvAirSupply: "0.6 / 0.7 / 0.8 MPag", specCvAirDesign: "0.8 MPag", specCvLineInlet: "", specCvLineOutlet: "", specCvLineClass: "", specCvPipeMaterial: "", specCvDesignPressure: "", specCvDesignTemp: "", specCvFailurePosition: "Close / Close", specCvDensity: "", specCvSpecificGravity: "", specCvVaporPressure: "", specCvHeatRatio: "", specCvMolecularMass: "", specCvViscosity: "", specCvFlow: "", specCvInletPressure: "", specCvPressureDrop: "", specCvInletTemperature: "", specCvShutoffDp: "", specCvLeakageClass: "ANSI IV", specCvFlowCoefficient: "", specCvSoundPressure: "", specCvTravel: "", specCvValveType: "Globe", specCvRatedCvRangeability: "", specCvEndConnection: "Flanged", specCvRoughness: "125 - 250 AARH", specCvBodySize: "", specCvBodyRatingFacing: "", specCvFlowAction: "Open", specCvBonnet: "", specCvTrim: "", specCvSealing: "Metallic", specCvMatBodyBonnet: "", specCvMatPlugSeat: "", specCvMatStemGuides: "", specCvPacking: "", specCvYokeHousing: "", specCvBellows: "", specCvActuator: "", specCvActuatorAction: "", specCvActuatorSizeSpring: "", specCvPositioner: "Smart E/P / SRI986-BIDS6EAANA", specCvPositionerSignalAction: "4~20 mA (HART) / Direct", specCvPneumaticConnection: "SS 316 / 1/4\" NPT(F)", specCvPositionerProtection: "IP 65 / 1/2\" NPT(F), 2 Nos. min.", specCvAirSet: "Yes / SS304 / KZ03-2B-XX", specCvLimitSwitch: "", specCvSolenoid: "", specCvTracing: "", specCvBoosterAirLock: "", specCvManufacturer: "", specCvModel: "", specCvSupplier: ""
};

function getEl(id) {
  return document.getElementById(id);
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function specVal(id, fallback = "-") {
  const el = getEl(id);
  if (!el) return fallback;
  const value = String(el.value || "").trim();
  return value ? value : fallback;
}

function setSpecValues(values) {
  specFieldIds.forEach((id) => {
    const el = getEl(id);
    if (!el) return;
    if (Object.prototype.hasOwnProperty.call(values, id)) el.value = values[id];
  });
  updateSpecVisibility();
  handleSpecGenerate();
}

function getSpecType() {
  return specVal("specType", "pressure");
}

function resetSpecDefaults() {
  const type = getSpecType();
  const defaults = { ...specBaseDefaults, specType: type };
  if (type === "differential") {
    defaults.specFileNo = "";
    defaults.specFunction = "Diff. Pressure Transmitter";
    defaults.specManifold = "3 Valve Manifold";
    defaults.specProcessConnSize = "1/2\" NPT (F)";
    defaults.specHpLpSize = "1/2\" NPT (F)";
  }
  if (type === "coriolis") {
    defaults.specFileNo = "";
    defaults.specFunction = "Coriolis Flow Transmitter";
    defaults.specOutput = "4~20mA (HART)";
    defaults.specProtocol = "HART";
    defaults.specSupply = "220 VAC, 50Hz U.P.S";
    defaults.specAccuracy = "± 0.1 %";
    defaults.specProtection = "IP 65";
    defaults.specProcessConnType = "Flanged";
    defaults.specProcessConnFacing = "RF";
    defaults.specProcessConnRoughness = "125 - 250 AARH";
    defaults.specTracing = "N/A";
  }
  if (type === "magnetic") {
    defaults.specFileNo = "";
    defaults.specFunction = "Magnetic Flowmeter";
    defaults.specOutput = "4~20mA (HART)";
    defaults.specProtocol = "HART";
    defaults.specSupply = "24VDC";
    defaults.specAccuracy = "+/-0.3%";
    defaults.specProtection = "IP 67";
    defaults.specFluidState = "Liquid";
  }
  if (type === "controlValve") {
    defaults.specFileNo = "";
    defaults.specFunction = "Control Valve";
    defaults.specOutput = "4~20 mA (HART)";
    defaults.specProtocol = "HART";
    defaults.specSupply = "24VDC";
    defaults.specAccuracy = "";
    defaults.specProtection = "IP 65";
  }
  setSpecValues(defaults);
}

function loadSpecSample() {
  const type = getSpecType();
  if (type === "controlValve") {
    setSpecValues({
      ...specBaseDefaults,
      "specType": "controlValve",
      "specProjectNo": "1332102",
      "specFileNo": "1332102-0000-IA306-7001",
      "specProjectName": "南京扬子石油化工有限公司",
      "specPlantName": "建设10万吨/年EVA装置 / YPC 100kta Lupotech A LDPE/EVA Plant",
      "specDesignStage": "详细设计",
      "specRev": "C00",
      "specTag": "FV-12231",
      "specPid": "1223",
      "specService": "Propane or propylene from D-1223",
      "specFunction": "Control Valve",
      "specHazardClass": "Zone 2, Gr. IIC, T6",
      "specHazardCert": "EEx-i, EEx-d (Solenoid Valve) / ATEX",
      "specFluid": "Propane",
      "specFluidState": "Gas/Vapour",
      "specCvAllowNoise": "<85 dBA @ 1 m",
      "specCvAirSupply": "0.6 / 0.7 / 0.8 MPag",
      "specCvAirDesign": "0.8 MPag",
      "specCvLineInlet": "1 1/2\"-PR-12009-1DL4 (TB)",
      "specCvLineOutlet": "-",
      "specCvLineClass": "1DL4",
      "specCvPipeMaterial": "LT CARBON STEEL",
      "specCvDesignPressure": "4 / 4 MPag",
      "specCvDesignTemp": "-45 / 200 ℃",
      "specCvDensity": "- / 80.6 / 80.6",
      "specCvSpecificGravity": "- / - / -",
      "specCvVaporPressure": "- / - / -",
      "specCvHeatRatio": "1.90",
      "specCvMolecularMass": "44",
      "specCvViscosity": "- / 0.012 / 0.012",
      "specCvFlow": "- / 60 / 500 kg/h",
      "specCvInletPressure": "- / 3 / 3 MPag",
      "specCvPressureDrop": "- / 0.1 / 0.07 MPa",
      "specCvInletTemperature": "- / 85 / 85 ℃",
      "specCvShutoffDp": "4.1 MPa",
      "specCvLeakageClass": "ANSI IV",
      "specCvFailurePosition": "Power: Close / Air: Close",
      "specCvFlowCoefficient": "- / 0.3283 / 3.28",
      "specCvSoundPressure": "- / - / - dBA",
      "specCvTravel": "- / 31 / 94 %",
      "specCvValveType": "Globe",
      "specCvRatedCvRangeability": "4.0 / 4",
      "specCvEndConnection": "Flanged",
      "specCvRoughness": "125 - 250 AARH",
      "specCvBodySize": "1\"",
      "specCvBodyRatingFacing": "300# / RF",
      "specCvFlowAction": "To Open",
      "specCvBonnet": "EXT-1 (-45 to -17 degC)",
      "specCvTrim": "Single / Character / Equal %",
      "specCvSealing": "Metallic",
      "specCvMatBodyBonnet": "A351CF8",
      "specCvMatPlugSeat": "SUS316 STELLITE / SUS316",
      "specCvMatStemGuides": "SUS316 / SUS316",
      "specCvPacking": "Grafoil",
      "specCvYokeHousing": "Ductile Iron",
      "specCvBellows": "-",
      "specCvActuator": "Diaphragm / PSA1R",
      "specCvActuatorAction": "- / Direct",
      "specCvActuatorSizeSpring": "- / -",
      "specCvPositioner": "Smart E/P / SRI986-BIDS6EAANA",
      "specCvPositionerSignalAction": "4~20 mA (HART) / Direct",
      "specCvPneumaticConnection": "SS 316 / 1/4\" NPT(F)",
      "specCvPositionerProtection": "IP 65 / 1/2\" NPT(F), 2 Nos. min.",
      "specCvAirSet": "Yes / SS304 / KZ03-2B-XX",
      "specCvLimitSwitch": "-",
      "specCvSolenoid": "-",
      "specCvTracing": "Required",
      "specCvBoosterAirLock": "- / -",
      "specCvManufacturer": "AZBIL",
      "specCvModel": "AGVM-ACNP",
      "specCvSupplier": "-",
      "specNotes": "(1) Control Valve to be designed for Full Vacuum condition.\n(2) Consider propane case as alternative case.\n(3) Design conditions: Pressure/Temp: -0.1 MPag / -45°C."
    });
    return;
  }
  if (type === "magnetic") {
    setSpecValues({
      ...specBaseDefaults,
      "specType": "magnetic",
      "specProjectNo": "1332102",
      "specFileNo": "1332102-0000-IA306-3009",
      "specProjectName": "南京扬子石油化工有限公司",
      "specPlantName": "建设10万吨/年EVA装置 / YPC 100kta Lupotech A LDPE/EVA Plant",
      "specDesignStage": "详细设计",
      "specRev": "C00",
      "specTag": "FT-11011",
      "specPid": "WS252-0001",
      "specService": "Water",
      "specFunction": "Magnetic Flowmeter",
      "specHazardClass": "Zone 2, Gr. IIC, T6",
      "specHazardCert": "EEx-i / ATEX",
      "specFluid": "Water",
      "specFluidState": "Liquid",
      "specDensity": "1000",
      "specViscosity": "-",
      "specPMin": "-",
      "specPNormal": "1.05",
      "specPMax": "-",
      "specTMin": "-",
      "specTNormal": "AMB",
      "specTMax": "-",
      "specDesignPressure": "-",
      "specDesignTemp": "-",
      "specMagLineNumber": "4\"-FRD-115003-4CC2",
      "specMagLineSize": "4\"",
      "specMagLineRating": "150#",
      "specMagLineClass": "4CC2",
      "specMagLineMaterial": "CARBON STEEL",
      "specMagFoaming": "-",
      "specMagEntrainedSolid": "- / -",
      "specMagCorrosiveAbrasive": "-",
      "specMagBuildUp": "-",
      "specMagPulsatingFlow": "-",
      "specMagVibration": "-",
      "specMagFlowMin": "0",
      "specMagFlowNormal": "30",
      "specMagFlowMax": "-",
      "specMagFlowRange": "0 to 36 m³/h",
      "specMagMaxPressureDrop": "0.05 MPa",
      "specMagSpecificGravity": "-",
      "specMagMolecularMass": "-",
      "specMagTransducerType": "Pipe type",
      "specMagInstrumentRange": "0 - 36 m³/h",
      "specMagInstrumentAccuracy": "+/-0.3%",
      "specMagProcessConnection": "4\" ANSI 150LB RF",
      "specMagFlangeMaterial": "SS 316",
      "specMagBodyMaterial": "SS 316",
      "specMagLiningMaterial": "PTFE",
      "specMagElectrodeType": "-",
      "specMagElectrodeMaterial": "SS 316L",
      "specMagGroundingRing": "YES / SS 316L",
      "specMagSpecialCableLength": "-",
      "specMagSpecialCableEntry": "-",
      "specMagMounting": "Integral",
      "specNe43": "YES",
      "specMagMeasuringRange": "0 - 36 m³/h",
      "specMagMeasuringAccuracy": "+/-0.3%",
      "specOutput": "4~20mA (HART)",
      "specMaxLoad": "-",
      "specMagCableEntry": "1/2\" NPT(F), 2 Nos. min.",
      "specMagPowerSupply": "24VDC",
      "specMagPowerCableEntry": "-",
      "specMagHousingMaterial": "Die Cast Aluminium",
      "specTxHazardExecution": "EEx-i (Signal) & EEx-d (Power Supply)",
      "specProtection": "IP 67",
      "specMagIntegralIndicator": "YES",
      "specMagTotalizerUnit": "-",
      "specMagMountingBracket": "-",
      "specMagBracketMaterial": "-",
      "specManufacturer": "KROHNE",
      "specModel": "OPTIFLUX4300C EX",
      "specSupplier": "-",
      "specNotes": ""
    });
    return;
  }
  if (type === "coriolis") {
    setSpecValues({
      ...specBaseDefaults,
      "specType": "coriolis",
      "specProjectNo": "1332102",
      "specFileNo": "1332102-0000-IA306-3008",
      "specProjectName": "南京扬子石油化工有限公司",
      "specPlantName": "建设10万吨/年EVA装置 / YPC 100kta Lupotech A LDPE/EVA Plant",
      "specDesignStage": "详细设计",
      "specRev": "C00",
      "specTag": "FT-00102",
      "specPid": "0011",
      "specService": "Vinyl Acetate from Battery Limit",
      "specFunction": "Coriolis Flow Transmitter",
      "specLineNumber": "3\"-VAC-00002-7CS4-TD",
      "specLineSize": "3\"",
      "specLineRating": "150#",
      "specLineClass": "7CS4",
      "specLineMaterial": "SS 316/316L DUAL GRADE",
      "specHazardClass": "Zone 2, Gr. IIC, T6",
      "specHazardCert": "EEx-i / ATEX",
      "specFluid": "Fresh Vinyl Acetate",
      "specFluidState": "Liquid",
      "specDensity": "940.8",
      "specViscosity": "0.47",
      "specPMin": "-",
      "specPNormal": "0.28",
      "specPMax": "-",
      "specTMin": "-",
      "specTNormal": "20",
      "specTMax": "43",
      "specDesignPressure": "1",
      "specDesignTemp": "-14 / 90",
      "specFoaming": "-",
      "specEntrainedSolid": "YES / -",
      "specCorrosiveAbrasive": "-",
      "specBuildUp": "-",
      "specPulsatingFlow": "-",
      "specVibration": "-",
      "specFlowMin": "500",
      "specFlowNormal": "5000",
      "specFlowMax": "12000",
      "specFlowRange": "0 to 14500 Kg/h",
      "specMaxPressureDrop": "0.025 MPa",
      "specSpecificGravity": "-",
      "specMolecularMass": "-",
      "specMeterTubeType": "Double Tube",
      "specCalculatedPressureDrop": "4.1 KPa",
      "specMeterConnType": "Flanged",
      "specMeterRoughness": "125 - 250 AARH",
      "specMeterSize": "1 1/2\"",
      "specMeterRating": "300#",
      "specMeterFacing": "RF",
      "specFlowDirection": "Uni-Directional",
      "specLiningCoating": "-",
      "specMeterTubeMaterial": "316LSS",
      "specFlangeMaterial": "F316/F316L",
      "specMeterTubeModel": "CMFS150M342N2BZMKZZTG",
      "specMeterHazardExecution": "EEx-i",
      "specCoriolisMounting": "分体式安装",
      "specDistanceFromMeter": "-",
      "specCoriolisPower": "220 VAC, 50Hz U.P.S",
      "specOutput": "4~20mA (HART)",
      "specMaxLoad": "MFR.STD",
      "specInstrRange": "0 to 14500 Kg/h",
      "specDcsRange": "0 to 14500 Kg/h",
      "specZeroStability": "MFR.STD",
      "specCoriolisAccuracy": "± 0.1 %",
      "specTxHazardExecution": "EEx-i (Signal) & EEx-d (Power Supply)",
      "specProtection": "IP 65",
      "specElectricalConn": "1/2\" NPT(F), 2 Nos. min.",
      "specGrounding": "Internal & External",
      "specTxHousingMaterial": "Die Cast Aluminium",
      "specTxModel": "1700R15ABFMZZZPK",
      "specTransmitterHolder": "YES",
      "specInterconnectionCable": "YES / MFR.STD",
      "specTransmitterConfigurator": "Not Required",
      "specDiagnostic": "Required",
      "specTracing": "Tracing",
      "specManufacturer": "EMERSON",
      "specSupplier": "-",
      "specNotes": "(1) Tracing is required.\n(2) For selected meter size <=2\" the rating shall be 300#."
    });
    return;
  }

  if (type === "differential") {
    setSpecValues({
      ...specBaseDefaults,
      specType: "differential",
      specProjectNo: "1332102",
      specFileNo: "1332102-0000-IA306-5003",
      specProjectName: "南京扬子石油化工有限公司",
      specPlantName: "建设10万吨/年EVA装置 / YPC 100kta Lupotech A LDPE/EVA Plant",
      specDesignStage: "详细设计",
      specRev: "C00",
      specTag: "PDT-03110",
      specPid: "0310",
      specService: "F-0301 filter pressure difference",
      specFunction: "Diff. Pressure Transmitter",
      specHazardClass: "Zone 2, Gr. IIC, T6",
      specHazardCert: "EEx-i / ATEX",
      specFluid: "Isododecane",
      specFluidState: "Liquid",
      specDensity: "754",
      specViscosity: "1.61",
      specPMin: "-",
      specPNormal: "0.37",
      specPMax: "-",
      specTMin: "-",
      specTNormal: "13",
      specTMax: "43",
      specDesignPressure: "0.7",
      specDesignTemp: "90",
      specDpFlowRange: "-",
      specDpMax: "0.05 MPa",
      specStaticPressure: "0.37 MPag",
      specTxType: "SMART / 2 Wire",
      specOutput: "4 - 20 mA",
      specProtocol: "HART",
      specSupply: "24 VDC",
      specInstrRange: "-",
      specCalibRange: "0 - 0.1 MPa",
      specDcsRange: "0 - 0.1 MPa",
      specDamping: "Set",
      specAccuracy: "± 0.065% Span",
      specProtection: "IP 65",
      specMounting: "Bracket For On Equipment Tag / 2” Pipe Mounting",
      specProcessConnType: "Threaded",
      specProcessConnSize: "1/2\" NPT (F)",
      specHpLpSize: "1/2\" NPT (F)",
      specElectricalConn: "1/2\" NPT(F), 2 Nos. min.",
      specGrounding: "Internal and External",
      specWettedMaterial: "SS316L",
      specHousing: "Die-Cast Aluminium",
      specBracketMaterial: "SS",
      specPaint: "Manufacturer Std.",
      specLocalMeter: "Required",
      specManifold: "3 Valve Manifold",
      specDpManifold: "3 Valve Manifold",
      specNe43: "Yes",
      specManufacturer: "HONEYWELL",
      specModel: "STD720-E1HS4AS-1-A-AHC-11C-A-60A0-F1",
      specNotes: "(1) Diff. Pressure(max) = 0.05 MPa."
    });
    return;
  }

  setSpecValues({
    ...specBaseDefaults,
    specType: "pressure",
    specProjectNo: "1332102",
    specFileNo: "1332102-0000-IA306-5004",
    specProjectName: "南京扬子石油化工有限公司",
    specPlantName: "建设10万吨/年EVA装置 / YPC 100kta Lupotech A LDPE/EVA Plant",
    specDesignStage: "详细设计",
    specRev: "C00",
    specTag: "PT-00206A",
    specPid: "0020A",
    specService: "N2 import from battery limit 1-1/2\"-LN-00002-4CC2",
    specFunction: "Pressure Transmitter Gauge",
    specHazardClass: "Zone 2, Gr. IIC, T6",
    specHazardCert: "EEx-i / ATEX",
    specFluid: "Nitrogen",
    specFluidState: "Gas",
    specPMin: "0.2",
    specPNormal: "0.25",
    specPMax: "0.3",
    specTMin: "-14",
    specTNormal: "30",
    specTMax: "43",
    specDesignPressure: "0.45",
    specDesignTemp: "-14 / 90",
    specInstrRange: "0 to 0.5 MPag",
    specCalibRange: "0 to 0.5 MPag",
    specDcsRange: "0 to 0.5 MPag",
    specProcessConnType: "Threaded",
    specProcessConnSize: "1/2\" NPT (F)",
    specManufacturer: "EMERSON",
    specModel: "3051TG2A2B21AHR5M5D4B4K8Q4Q8P1",
    specNotes: "."
  });
}

function updateSpecVisibility() {
  const separatorMode = specVal("specSeparatorMode", "none");
  const separatorBox = getEl("specSeparatorBox");
  if (separatorBox) separatorBox.classList.toggle("hidden", separatorMode === "none");

  const type = getSpecType();
  const isDp = type === "differential";
  const isCoriolis = type === "coriolis";
  const isMagnetic = type === "magnetic";
  const isControlValve = type === "controlValve";
  const dpBox = getEl("specDpBox");
  if (dpBox) dpBox.classList.toggle("hidden", !isDp);
  const coriolisBox = getEl("specCoriolisBox");
  if (coriolisBox) coriolisBox.classList.toggle("hidden", !isCoriolis);
  const magneticBox = getEl("specMagneticBox");
  if (magneticBox) magneticBox.classList.toggle("hidden", !isMagnetic);
  const controlValveBox = getEl("specControlValveBox");
  if (controlValveBox) controlValveBox.classList.toggle("hidden", !isControlValve);

  // 调节阀规格书有独立的阀体、执行机构和附件参数，隐藏压力/差压变送器专用输入区，避免页面混乱。
  ["specTransmitterParamsBox", "specTransmitterConnectionBox", "specTransmitterMaterialBox"].forEach((id) => {
    const box = getEl(id);
    if (box) box.classList.toggle("hidden", isControlValve);
  });

  const specFunction = getEl("specFunction");
  if (specFunction) {
    if (isDp && !specFunction.value.includes("Diff")) specFunction.value = "Diff. Pressure Transmitter";
    if (isCoriolis && !specFunction.value.includes("Coriolis")) specFunction.value = "Coriolis Flow Transmitter";
    if (isMagnetic && !specFunction.value.includes("Magnetic")) specFunction.value = "Magnetic Flowmeter";
    if (isControlValve && !specFunction.value.includes("Control")) specFunction.value = "Control Valve";
    if (!isDp && !isCoriolis && !isMagnetic && !isControlValve && (specFunction.value.includes("Diff") || specFunction.value.includes("Coriolis") || specFunction.value.includes("Magnetic") || specFunction.value.includes("Control"))) specFunction.value = "Pressure Transmitter Gauge";
  }
}

function specCell(value) {
  return escapeHtml(value || "-");
}

function renderSpecRows(section, rows, startNo) {
  return rows.map((row, idx) => `
    <tr>
      ${idx === 0 ? `<th class="section-head" rowspan="${rows.length}">${escapeHtml(section)}</th>` : ""}
      <td class="row-no">${startNo + idx}</td>
      <td class="field-name">${escapeHtml(row[0])}</td>
      <td class="value-cell">${specCell(row[1])}</td>
    </tr>`).join("");
}

function getSeparatorRows() {
  const separatorMode = specVal("specSeparatorMode", "none");
  const separatorText = separatorMode === "none" ? "-" : (separatorMode === "direct" ? "Diaphragm seal type" : "Remote Diaphragm with Capillary");
  return [
    ["Type", separatorText],
    ["Remote Diaphragm with Capillary", separatorMode === "capillary" ? specVal("specRemoteCapillary") : "-"],
    ["Capillary: Length / Armour", separatorMode === "capillary" ? `${specVal("specCapillaryLength")} / ${specVal("specCapillaryArmour")}` : "-"],
    ["Filling Fluid", separatorMode === "none" ? "-" : specVal("specFillingFluid")],
    ["Flushing Ring", separatorMode === "none" ? "-" : specVal("specFlushingRing")]
  ];
}



function handleControlValveSpecGenerate(previewWrap, preview) {
  const cnTitle = "调节阀规格书";
  const enTitle = "CONTROL VALVE SPECIFICATION";
  let rowNo = 1;
  const groups = [];
  const addGroup = (section, rows) => {
    groups.push(renderSpecRows(section, rows, rowNo));
    rowNo += rows.length;
  };

  addGroup("GENERAL", [
    ["Tag Number", specVal("specTag")],
    ["P&ID No.", specVal("specPid")],
    ["Service", specVal("specService")],
    ["Allowable Sound Pressure Level", specVal("specCvAllowNoise")],
    ["Air Supply Pressure Min / Norm / Max / Design", `${specVal("specCvAirSupply")} / ${specVal("specCvAirDesign")}`]
  ]);
  addGroup("PIPE LINE", [["Line Size and Schedule: Inlet", specVal("specCvLineInlet")], ["Line Size and Schedule: Outlet", specVal("specCvLineOutlet")], ["Line Class", specVal("specCvLineClass")], ["Pipe Material", specVal("specCvPipeMaterial")]]);
  addGroup("DESIGN", [["Pressure Min / Max", specVal("specCvDesignPressure")], ["Temperature Min / Max", specVal("specCvDesignTemp")]]);
  addGroup("HAZARDOUS AREA", [["Classification", specVal("specHazardClass")], ["Execution / Certification", specVal("specHazardCert")]]);
  addGroup("PROCESS CONDITIONS", [
    ["Fluid", specVal("specFluid")], ["Fluid State", specVal("specFluidState")], ["Inlet Density Min / Norm / Max", specVal("specCvDensity")], ["Specific Gravity Min / Norm / Max", specVal("specCvSpecificGravity")], ["Inlet Vapour Pressure", specVal("specCvVaporPressure")], ["Specific Heat Ratio / Molecular Mass", `${specVal("specCvHeatRatio")} / ${specVal("specCvMolecularMass")}`], ["Inlet Viscosity", specVal("specCvViscosity")], ["Flow Rate", specVal("specCvFlow")], ["Inlet Pressure", specVal("specCvInletPressure")], ["Pressure Drop", specVal("specCvPressureDrop")], ["Inlet Temperature", specVal("specCvInletTemperature")], ["Max Shut-off Differential Pressure", specVal("specCvShutoffDp")], ["Leakage Class", specVal("specCvLeakageClass")], ["Power / Air Failure Position", specVal("specCvFailurePosition")]
  ]);
  addGroup("CALCULATION DATA", [["Flow Coefficient Cv", specVal("specCvFlowCoefficient")], ["Sound Pressure Level", specVal("specCvSoundPressure")], ["Travel %", specVal("specCvTravel")]]);
  addGroup("SELECTED VALVE", [["Type", specVal("specCvValveType")], ["Cv / Rangeability", specVal("specCvRatedCvRangeability")]]);
  addGroup("BODY", [["End Connection Type", specVal("specCvEndConnection")], ["Roughness", specVal("specCvRoughness")], ["Size", specVal("specCvBodySize")], ["Rating / Facing", specVal("specCvBodyRatingFacing")], ["Flow Action To", specVal("specCvFlowAction")], ["Bonnet Type / Lubricat.", specVal("specCvBonnet")]]);
  addGroup("TRIM", [["Port / Plug / Character", specVal("specCvTrim")], ["Sealing Seat / Plug", specVal("specCvSealing")]]);
  addGroup("ACTUATOR", [["Type / Model", specVal("specCvActuator")], ["Action / Handwheel Location", specVal("specCvActuatorAction")], ["Size / Spring Range", specVal("specCvActuatorSizeSpring")]]);
  addGroup("MATERIAL", [["Body / Bonnet", specVal("specCvMatBodyBonnet")], ["Plug / Seat", specVal("specCvMatPlugSeat")], ["Stem / Plug Guides", specVal("specCvMatStemGuides")], ["Yoke / Housing", specVal("specCvYokeHousing")], ["Packing", specVal("specCvPacking")], ["Bellows", specVal("specCvBellows")]]);
  addGroup("POSITIONER", [["Type / Model", specVal("specCvPositioner")], ["Input Signal Range / Action", specVal("specCvPositionerSignalAction")], ["Pneumatic Connection", specVal("specCvPneumaticConnection")], ["Protection / Electrical Connection", specVal("specCvPositionerProtection")], ["Grounding Connection", "Required"]]);
  addGroup("AIR SET", [["Filter Regulator & Gauge / Material / Model", specVal("specCvAirSet")]]);
  addGroup("LIMIT SWITCH", [["Tag Number / Quantity / Model", specVal("specCvLimitSwitch")]]);
  addGroup("SOLENOID VALVE", [["Tag Number / Quantity / Model", specVal("specCvSolenoid")]]);
  addGroup("OPTIONS", [["Tracing / Jacketing", specVal("specCvTracing")], ["Booster / Air Lock", specVal("specCvBoosterAirLock")]]);
  addGroup("PURCHASE", [["MR No. / PO No.", "- / -"], ["Manufacturer", specVal("specCvManufacturer")], ["Model", specVal("specCvModel")], ["Supplier", specVal("specCvSupplier")]]);

  preview.innerHTML = `
    <div class="spec-title-box"><h3>${escapeHtml(cnTitle)}</h3><p>${escapeHtml(enTitle)}</p><p>专业 / DISCIPLINE：仪表 / INSTRUMENT</p></div>
    <table class="spec-meta-table"><tr><th>项目号<br>PROJECT NO.</th><td>${specCell(specVal("specProjectNo"))}</td><th>图号<br>FILE NO.</th><td>${specCell(specVal("specFileNo"))}</td><th>版次<br>REV.</th><td>${specCell(specVal("specRev"))}</td></tr><tr><th>项目名称<br>PROJECT</th><td colspan="2">${specCell(specVal("specProjectName"))}</td><th>装置<br>PLANT / UNIT</th><td colspan="2">${specCell(specVal("specPlantName"))}</td></tr><tr><th>设计阶段<br>DESIGN STAGE</th><td colspan="5">${specCell(specVal("specDesignStage"))}</td></tr></table>
    <table class="spec-table control-valve-spec-table"><colgroup><col style="width:27mm" /><col style="width:7mm" /><col style="width:46mm" /><col /></colgroup>${groups.join("")}</table>
    <div class="spec-notes-box"><strong>Notes:</strong><br>${escapeHtml(specVal("specNotes", ""))}</div>
    <div class="spec-footer-box"><div>仪表规格书<br>INSTRUMENT SPECIFICATION</div><div>调节阀<br>Valve Control</div><div>V1.6-E-fix 生成预览，正式归档前需校审</div></div>
    <div class="spec-muted">本预览按上传调节阀模板主要栏目生成，版式为网页打印优化版。</div>`;
  previewWrap.classList.remove("hidden");
}

function handleMagneticSpecGenerate(previewWrap, preview) {
  const cnTitle = "电磁流量计规格书";
  const enTitle = "MAGNETIC FLOWMETER SPECIFICATION";
  const pressureRange = `${specVal("specPMin")} / ${specVal("specPNormal")} / ${specVal("specPMax")} MPag`;
  const tempRange = `${specVal("specTMin")} / ${specVal("specTNormal")} / ${specVal("specTMax")} ℃`;
  let rowNo = 1;
  const groups = [];
  const addGroup = (section, rows) => {
    groups.push(renderSpecRows(section, rows, rowNo));
    rowNo += rows.length;
  };

  addGroup("GENERAL", [
    ["Tag Number", specVal("specTag")],
    ["P&ID No.", specVal("specPid")],
    ["Service", specVal("specService")],
    ["Line Number", specVal("specMagLineNumber")],
    ["Line Size / Rating", `${specVal("specMagLineSize")} / ${specVal("specMagLineRating")}`],
    ["Line Class / Material", `${specVal("specMagLineClass")} / ${specVal("specMagLineMaterial")}`]
  ]);

  addGroup("DESIGN", [
    ["Pressure Min / Max", `${specVal("specDesignPressure")} MPag`],
    ["Temperature Min / Max", `${specVal("specDesignTemp")} ℃`]
  ]);

  addGroup("PROCESS CONDITIONS", [
    ["Fluid", specVal("specFluid")],
    ["Fluid State", specVal("specFluidState")],
    ["Foaming", specVal("specMagFoaming")],
    ["Dynamic Viscosity", `${specVal("specViscosity")} mPa.s`],
    ["Operating Density", `${specVal("specDensity")} kg/m³`],
    ["Specific Gravity / Molecular Mass", `${specVal("specMagSpecificGravity")} / ${specVal("specMagMolecularMass")}`],
    ["Entrained Liquid / Solid", specVal("specMagEntrainedSolid")],
    ["Corrosive / Abrasive", specVal("specMagCorrosiveAbrasive")],
    ["Build-Up Tendency", specVal("specMagBuildUp")],
    ["Pulsating Flow", specVal("specMagPulsatingFlow")],
    ["Vibration at Sensor Location", specVal("specMagVibration")],
    ["Flow Rate Min / Normal / Max", `${specVal("specMagFlowMin")} / ${specVal("specMagFlowNormal")} / ${specVal("specMagFlowMax")} m³/h`],
    ["Flow Rate Range", specVal("specMagFlowRange")],
    ["Pressure Min / Normal / Max", pressureRange],
    ["Max Allowable Pressure Drop", specVal("specMagMaxPressureDrop")],
    ["Temperature Min / Normal / Max", tempRange]
  ]);

  addGroup("TRANSDUCER", [
    ["Tag Number", specVal("specTag")],
    ["Type", specVal("specMagTransducerType")],
    ["Instrument Range / Accuracy", `${specVal("specMagInstrumentRange")} / ${specVal("specMagInstrumentAccuracy")}`],
    ["Process Connection Size/Rating/Facing", specVal("specMagProcessConnection")],
    ["Flange Material", specVal("specMagFlangeMaterial")],
    ["Body Material", specVal("specMagBodyMaterial")],
    ["Lining Material", specVal("specMagLiningMaterial")],
    ["Electrode Type", specVal("specMagElectrodeType")],
    ["Electrode Material", specVal("specMagElectrodeMaterial")],
    ["Grounding Ring / Material", specVal("specMagGroundingRing")],
    ["Special Cable Length", specVal("specMagSpecialCableLength")],
    ["Special Cable Entry", specVal("specMagSpecialCableEntry")],
    ["HAZARDOUS AREA", `${specVal("specHazardClass")} / ${specVal("specHazardCert")}`],
    ["Mechanical Protection", specVal("specProtection")]
  ]);

  addGroup("TRANSMITTER", [
    ["Tag Number", specVal("specTag")],
    ["Mounting", specVal("specMagMounting")],
    ["Namur NE43 Compliant", specVal("specNe43")],
    ["Measuring Range / Accuracy", `${specVal("specMagMeasuringRange")} / ${specVal("specMagMeasuringAccuracy")}`],
    ["Output Signal / Max. Load", `${specVal("specOutput")} / ${specVal("specMaxLoad")}`],
    ["Special Cable Entry", specVal("specMagSpecialCableEntry")],
    ["Cable Entry", specVal("specMagCableEntry")],
    ["Power Supply", specVal("specMagPowerSupply")],
    ["Power Cable Entry", specVal("specMagPowerCableEntry")],
    ["Housing Material", specVal("specMagHousingMaterial")],
    ["HAZARDOUS AREA", `${specVal("specHazardClass")} / ${specVal("specTxHazardExecution")} / ${specVal("specHazardCert")}`],
    ["Mechanical Protection", specVal("specProtection")]
  ]);

  addGroup("OPTIONS", [
    ["Integral Indicator", specVal("specMagIntegralIndicator")],
    ["Totalizer Unit", specVal("specMagTotalizerUnit")],
    ["Mounting Bracket", specVal("specMagMountingBracket")],
    ["Bracket Material", specVal("specMagBracketMaterial")]
  ]);

  addGroup("PURCHASE", [
    ["MR No. / PO No.", "- / -"],
    ["Manufacturer", specVal("specManufacturer")],
    ["Model", specVal("specModel")]
  ]);

  preview.innerHTML = `
    <div class="spec-title-box">
      <h3>${escapeHtml(cnTitle)}</h3>
      <p>${escapeHtml(enTitle)}</p>
      <p>专业 / DISCIPLINE：仪表 / INSTRUMENT</p>
    </div>
    <table class="spec-meta-table">
      <tr>
        <th>项目号<br>PROJECT NO.</th><td>${specCell(specVal("specProjectNo"))}</td>
        <th>图号<br>FILE NO.</th><td>${specCell(specVal("specFileNo"))}</td>
        <th>版次<br>REV.</th><td>${specCell(specVal("specRev"))}</td>
      </tr>
      <tr>
        <th>项目名称<br>PROJECT</th><td colspan="2">${specCell(specVal("specProjectName"))}</td>
        <th>装置<br>PLANT / UNIT</th><td colspan="2">${specCell(specVal("specPlantName"))}</td>
      </tr>
      <tr>
        <th>设计阶段<br>DESIGN STAGE</th><td colspan="5">${specCell(specVal("specDesignStage"))}</td>
      </tr>
    </table>
    <table class="spec-table magnetic-spec-table">
      <colgroup><col style="width:27mm" /><col style="width:7mm" /><col style="width:48mm" /><col /></colgroup>
      ${groups.join("")}
    </table>
    <div class="spec-notes-box"><strong>Notes:</strong><br>${escapeHtml(specVal("specNotes", ""))}</div>
    <div class="spec-footer-box">
      <div>仪表规格书<br>INSTRUMENT SPECIFICATION</div>
      <div>电磁流量计<br>Magnetic Flowmeter</div>
      <div>V1.6-E-fix 生成预览，正式归档前需校审</div>
    </div>
    <div class="spec-muted">本预览按上传电磁流量计模板主要栏目生成，版式为网页打印优化版。</div>
  `;
  previewWrap.classList.remove("hidden");
}

function handleCoriolisSpecGenerate(previewWrap, preview) {
  const cnTitle = "科里奥利质量流量计规格书";
  const enTitle = "CORIOLIS FLOW TRANSMITTER SPECIFICATION";
  const pressureRange = `${specVal("specPMin")} / ${specVal("specPNormal")} / ${specVal("specPMax")} MPag`;
  const tempRange = `${specVal("specTMin")} / ${specVal("specTNormal")} / ${specVal("specTMax")} ℃`;
  let rowNo = 1;
  const groups = [];
  const addGroup = (section, rows) => {
    groups.push(renderSpecRows(section, rows, rowNo));
    rowNo += rows.length;
  };

  addGroup("GENERAL", [
    ["Tag Number", specVal("specTag")],
    ["P&ID No.", specVal("specPid")],
    ["Service", specVal("specService")],
    ["Line Number", specVal("specLineNumber")],
    ["Line Size / Rating", `${specVal("specLineSize")} / ${specVal("specLineRating")}`],
    ["Line Class / Material", `${specVal("specLineClass")} / ${specVal("specLineMaterial")}`]
  ]);

  addGroup("DESIGN", [
    ["Pressure Min / Max", `${specVal("specDesignPressure")} MPag`],
    ["Temperature Min / Max", `${specVal("specDesignTemp")} ℃`]
  ]);

  addGroup("PROCESS CONDITIONS", [
    ["Fluid", specVal("specFluid")],
    ["Fluid State", specVal("specFluidState")],
    ["Foaming", specVal("specFoaming")],
    ["Dynamic Viscosity", `${specVal("specViscosity")} mPa.s`],
    ["Operating Density", `${specVal("specDensity")} kg/m³`],
    ["Specific Gravity / Molecular Mass", `${specVal("specSpecificGravity")} / ${specVal("specMolecularMass")}`],
    ["Entrained Liquid / Solid", specVal("specEntrainedSolid")],
    ["Corrosive / Abrasive", specVal("specCorrosiveAbrasive")],
    ["Build-Up Tendency", specVal("specBuildUp")],
    ["Pulsating Flow", specVal("specPulsatingFlow")],
    ["Vibration at Sensor Location", specVal("specVibration")],
    ["Flow Rate Min / Normal / Max", `${specVal("specFlowMin")} / ${specVal("specFlowNormal")} / ${specVal("specFlowMax")} Kg/h`],
    ["Flow Rate Range", specVal("specFlowRange")],
    ["Pressure Min / Normal / Max", pressureRange],
    ["Max Allowable Pressure Drop", specVal("specMaxPressureDrop")],
    ["Temperature Min / Normal / Max", tempRange]
  ]);

  addGroup("METER TUBE", [
    ["Tag Number", specVal("specTag")],
    ["Type", specVal("specMeterTubeType")],
    ["Calculated Press. Drop", specVal("specCalculatedPressureDrop")],
    ["Connection Type / Roughness", `${specVal("specMeterConnType")} / ${specVal("specMeterRoughness")}`],
    ["Size / Rating / Facing", `${specVal("specMeterSize")} / ${specVal("specMeterRating")} / ${specVal("specMeterFacing")}`],
    ["Flow Direction", specVal("specFlowDirection")],
    ["Lining / Coating", specVal("specLiningCoating")],
    ["Material: Meter Tube", specVal("specMeterTubeMaterial")],
    ["Material: Flanges", specVal("specFlangeMaterial")],
    ["HAZARDOUS AREA", `${specVal("specHazardClass")} / ${specVal("specMeterHazardExecution")} / ${specVal("specHazardCert")}`],
    ["Mechanical Protection", specVal("specProtection")],
    ["Electrical Connection", "-"],
    ["Grounding Connection", "-"],
    ["Model", specVal("specMeterTubeModel")]
  ]);

  addGroup("TRANSMITTER", [
    ["Tag Number", specVal("specTag")],
    ["Mounting", specVal("specCoriolisMounting")],
    ["Namur NE43 Compliant", specVal("specNe43")],
    ["Distance from Meter Tube", specVal("specDistanceFromMeter")],
    ["Power Supply", specVal("specCoriolisPower")],
    ["Output Signal", specVal("specOutput")],
    ["Max Load", specVal("specMaxLoad")],
    ["Instrument Range", specVal("specInstrRange")],
    ["DCS Range", specVal("specDcsRange")],
    ["Zero Stability", specVal("specZeroStability")],
    ["Accuracy", specVal("specCoriolisAccuracy")],
    ["HAZARDOUS AREA", `${specVal("specHazardClass")} / ${specVal("specTxHazardExecution")} / ${specVal("specHazardCert")}`],
    ["Mechanical Protection", specVal("specProtection")],
    ["Electrical Connection", specVal("specElectricalConn")],
    ["Grounding Connection", specVal("specGrounding")],
    ["Housing Material", specVal("specTxHousingMaterial")],
    ["Model", specVal("specTxModel")]
  ]);

  addGroup("OPTIONS", [
    ["Transmitter Holder", specVal("specTransmitterHolder")],
    ["Interconnection Cable / Length", specVal("specInterconnectionCable")],
    ["Transmitter Configurator", specVal("specTransmitterConfigurator")],
    ["Diagnostic", specVal("specDiagnostic")],
    ["Tracing / Jacketing", specVal("specTracing")]
  ]);

  addGroup("PURCHASE", [
    ["MR No. / PO No.", "- / -"],
    ["Manufacturer", specVal("specManufacturer")],
    ["Supplier", specVal("specSupplier")]
  ]);

  preview.innerHTML = `
    <div class="spec-title-box">
      <h3>${escapeHtml(cnTitle)}</h3>
      <p>${escapeHtml(enTitle)}</p>
      <p>专业 / DISCIPLINE：仪表 / INSTRUMENT</p>
    </div>
    <table class="spec-meta-table">
      <tr>
        <th>项目号<br>PROJECT NO.</th><td>${specCell(specVal("specProjectNo"))}</td>
        <th>图号<br>FILE NO.</th><td>${specCell(specVal("specFileNo"))}</td>
        <th>版次<br>REV.</th><td>${specCell(specVal("specRev"))}</td>
      </tr>
      <tr>
        <th>项目名称<br>PROJECT</th><td colspan="2">${specCell(specVal("specProjectName"))}</td>
        <th>装置<br>PLANT / UNIT</th><td colspan="2">${specCell(specVal("specPlantName"))}</td>
      </tr>
      <tr>
        <th>设计阶段<br>DESIGN STAGE</th><td colspan="5">${specCell(specVal("specDesignStage"))}</td>
      </tr>
    </table>
    <table class="spec-table coriolis-spec-table">
      <colgroup><col style="width:27mm" /><col style="width:7mm" /><col style="width:46mm" /><col /></colgroup>
      ${groups.join("")}
    </table>
    <div class="spec-notes-box"><strong>Notes:</strong><br>${escapeHtml(specVal("specNotes", ""))}</div>
    <div class="spec-footer-box">
      <div>仪表规格书<br>INSTRUMENT SPECIFICATION</div>
      <div>科里奥利质量流量计<br>Coriolis Flow Transmitter</div>
      <div>V1.6-E-fix 生成预览，正式归档前需校审</div>
    </div>
    <div class="spec-muted">本预览按上传科里奥利质量流量计模板主要栏目生成，版式为网页打印优化版。</div>
  `;
  previewWrap.classList.remove("hidden");
}

function handleSpecGenerate() {
  const previewWrap = getEl("specPreviewWrap");
  const preview = getEl("specPreview");
  if (!previewWrap || !preview) return;

  updateSpecVisibility();
  const type = getSpecType();
  if (type === "controlValve") {
    handleControlValveSpecGenerate(previewWrap, preview);
    return;
  }
  if (type === "magnetic") {
    handleMagneticSpecGenerate(previewWrap, preview);
    return;
  }
  if (type === "coriolis") {
    handleCoriolisSpecGenerate(previewWrap, preview);
    return;
  }
  const isDp = type === "differential";
  const cnTitle = isDp ? "差压变送器规格书" : "压力变送器规格书";
  const enTitle = isDp ? "DIFF. PRESSURE TRANSMITTER SPECIFICATION" : "PRESSURE TRANSMITTER SPECIFICATION";
  const footerName = isDp ? "差压变送器<br>Diff. Pressure Transmitter" : "压力变送器<br>Pressure Transmitter";
  const pressureRange = `${specVal("specPMin")} / ${specVal("specPNormal")} / ${specVal("specPMax")} MPag`;
  const tempRange = `${specVal("specTMin")} / ${specVal("specTNormal")} / ${specVal("specTMax")} ℃`;

  let rowNo = 1;
  const groups = [];
  const addGroup = (section, rows) => {
    groups.push(renderSpecRows(section, rows, rowNo));
    rowNo += rows.length;
  };

  addGroup("GENERAL", [
    ["Tag Number", specVal("specTag")],
    ["P&ID No.", specVal("specPid")],
    ["Service", specVal("specService")]
  ]);

  if (!isDp) {
    addGroup("FUNCTION", [["Function", specVal("specFunction")]]);
  }

  addGroup("HAZARDOUS AREA", [
    ["Classification", specVal("specHazardClass")],
    ["Execution / Certification", specVal("specHazardCert")]
  ]);

  addGroup("DESIGN", [
    ["Pressure Min / Normal / Max", pressureRange],
    ["Temperature Min / Normal / Max", tempRange],
    ["Design Pressure", `${specVal("specDesignPressure")} MPag`],
    ["Design Temperature Min / Max", `${specVal("specDesignTemp")} ℃`]
  ]);

  addGroup("MOUNTING", [["Mounting", specVal("specMounting")]]);

  const processRows = [
    ["Fluid", specVal("specFluid")],
    ["Fluid State", specVal("specFluidState")],
    ["Oper. Density", `${specVal("specDensity")} kg/m³`],
    ["Operating Viscosity", `${specVal("specViscosity")} mPa·s`],
    ["Pressure Min / Normal / Max", pressureRange],
    ["Temperature Min / Normal / Max", tempRange]
  ];
  if (isDp) {
    processRows.push(["Flow Rate Range", specVal("specDpFlowRange")]);
    processRows.push(["Diff. Pressure(max)", specVal("specDpMax")]);
    processRows.push(["Static Pressure", specVal("specStaticPressure")]);
  }
  addGroup("PROCESS CONDITIONS", processRows);

  addGroup("SENSING ELEMENT", [
    ["Type", isDp ? "(*)" : "Capacitance"],
    ["Sensor", "Diaphragm"]
  ]);

  addGroup("SEPARATOR", getSeparatorRows());

  addGroup("TRANSMITTER", [
    ["Type / System", specVal("specTxType")],
    ["Output Signal", specVal("specOutput")],
    ["Output Digital Format", specVal("specProtocol")],
    ["Supply", specVal("specSupply")],
    ["Instr. Range", specVal("specInstrRange")],
    ["Calib. Range", specVal("specCalibRange")],
    ["DCS Range", specVal("specDcsRange")],
    ["Damp. Time", specVal("specDamping")],
    ["Accuracy", specVal("specAccuracy")],
    ["Mechanical Protection", specVal("specProtection")]
  ]);

  if (isDp) {
    addGroup("PROCESS CONNECTIONS", [
      ["Type", specVal("specProcessConnType")],
      ["Size: HP/LP Side", specVal("specHpLpSize")],
      ["Rating: HP/LP Side", specVal("specHpLpRating")],
      ["Facing: HP/LP Side", specVal("specHpLpFacing")],
      ["Flushing Connection", specVal("specFlushingConnection")],
      ["Roughness: HP/LP Side", specVal("specProcessConnRoughness")]
    ]);
  } else {
    addGroup("PROCESS CONNECTIONS", [
      ["Type", specVal("specProcessConnType")],
      ["Size", specVal("specProcessConnSize")],
      ["Rating", specVal("specProcessConnRating")],
      ["Facing", specVal("specProcessConnFacing")],
      ["Roughness", specVal("specProcessConnRoughness")]
    ]);
  }

  addGroup("ELECTRICAL CONNECTIONS", [
    ["Electrical Connection", specVal("specElectricalConn")],
    ["Grounding Connection", specVal("specGrounding")]
  ]);

  addGroup("DIGITAL FUNCTION", [
    ["Communication", "Digital"],
    ["Protocol", `${specVal("specProtocol")} FSK`],
    ["Configur. & Calibrat.", "Yes (Handheld Device)"],
    ["Diagnostic with Alarm", "Required"],
    ["Namur NE43 Compliant", specVal("specNe43")]
  ]);

  if (isDp) {
    addGroup("MATERIAL", [
      ["Sensing Element", specVal("specWettedMaterial")],
      ["Body & Oval Flanges", specVal("specWettedMaterial")],
      ["Other Wetted Parts", specVal("specWettedMaterial")],
      ["Electronic Housing", specVal("specHousing")],
      ["Bracket & U Bolts", specVal("specBracketMaterial")],
      ["Paint", specVal("specPaint")]
    ]);
  } else {
    addGroup("MATERIAL", [
      ["Sensing Element", specVal("specWettedMaterial")],
      ["Body / Other Wetted Parts", specVal("specWettedMaterial")],
      ["Diaphragm", specVal("specWettedMaterial")],
      ["Electronic Housing", specVal("specHousing")],
      ["Bracket & U Bolts", specVal("specBracketMaterial")],
      ["Paint", specVal("specPaint")]
    ]);
  }

  addGroup("OPTIONS", [
    ["Integrated Output Meter", specVal("specLocalMeter")],
    ["Manifold", isDp ? specVal("specDpManifold") : specVal("specManifold")],
    ["Tracing / Jacketing", specVal("specTracing")]
  ]);

  addGroup("PURCHASE", [
    ["Manufacturer", specVal("specManufacturer")],
    ["Model", specVal("specModel")],
    ["Supplier", specVal("specSupplier")]
  ]);

  preview.innerHTML = `
    <div class="spec-title-box">
      <h3>${escapeHtml(cnTitle)}</h3>
      <p>${escapeHtml(enTitle)}</p>
      <p>专业 / DISCIPLINE：仪表 / INSTRUMENT</p>
    </div>
    <table class="spec-meta-table">
      <tr>
        <th>项目号<br>PROJECT NO.</th><td>${specCell(specVal("specProjectNo"))}</td>
        <th>图号<br>FILE NO.</th><td>${specCell(specVal("specFileNo"))}</td>
        <th>版次<br>REV.</th><td>${specCell(specVal("specRev"))}</td>
      </tr>
      <tr>
        <th>项目名称<br>PROJECT</th><td colspan="2">${specCell(specVal("specProjectName"))}</td>
        <th>装置<br>PLANT / UNIT</th><td colspan="2">${specCell(specVal("specPlantName"))}</td>
      </tr>
      <tr>
        <th>设计阶段<br>DESIGN STAGE</th><td colspan="5">${specCell(specVal("specDesignStage"))}</td>
      </tr>
    </table>
    <table class="spec-table">
      <colgroup>
        <col style="width:27mm" />
        <col style="width:7mm" />
        <col style="width:43mm" />
        <col />
      </colgroup>
      ${groups.join("")}
    </table>
    <div class="spec-notes-box"><strong>Notes:</strong><br>${escapeHtml(specVal("specNotes", ""))}</div>
    <div class="spec-footer-box">
      <div>仪表规格书<br>INSTRUMENT SPECIFICATION</div>
      <div>${footerName}</div>
      <div>V1.6-E-fix 生成预览，正式归档前需校审</div>
    </div>
    <div class="spec-muted">本预览按上传压力/差压/科里奥利/电磁流量计模板主要栏目生成，版式为网页打印优化版。</div>
  `;

  previewWrap.classList.remove("hidden");
}

function printSpecPreview() {
  handleSpecGenerate();
  window.print();
}

const specGenerateBtn = getEl("specGenerateBtn");
const specSampleBtn = getEl("specSampleBtn");
const specResetBtn = getEl("specResetBtn");
const specPrintBtn = getEl("specPrintBtn");
const specSeparatorMode = getEl("specSeparatorMode");
const specType = getEl("specType");

if (specGenerateBtn) specGenerateBtn.addEventListener("click", handleSpecGenerate);
if (specSampleBtn) specSampleBtn.addEventListener("click", loadSpecSample);
if (specResetBtn) specResetBtn.addEventListener("click", resetSpecDefaults);
if (specPrintBtn) specPrintBtn.addEventListener("click", printSpecPreview);
if (specSeparatorMode) specSeparatorMode.addEventListener("change", updateSpecVisibility);
if (specType) specType.addEventListener("change", () => {
  resetSpecDefaults();
  updateSpecVisibility();
  handleSpecGenerate();
});

specFieldIds.forEach((id) => {
  const el = getEl(id);
  if (!el) return;
  el.addEventListener("input", handleSpecGenerate);
  el.addEventListener("change", () => {
    updateSpecVisibility();
    handleSpecGenerate();
  });
});

window.handleSpecGenerate = handleSpecGenerate;
updateSpecVisibility();
