const diagnosisResultMapping = [
  {
    enName: 'head',
    name: '头颈',
    result: [
      { key: 'rightDeviation', value: '右倾' },
      { key: 'leftDeviation', value: '左倾' },
      { key: 'forward', value: '前伸' },
      { key: 'backwards', value: '后伸' },
    ],
  },
  {
    enName: 'shoulder',
    name: '肩',
    result: [
      { key: 'leftHigh', value: '左高' },
      { key: 'rightHigh', value: '右高' },
      { key: 'forward', value: '前倾' },
      { key: 'backwards', value: '后倾' },
    ],
  },
  {
    enName: 'thoracolumbar',
    name: '胸椎',
    result: [
      { key: 'left', value: '左移' },
      { key: 'right', value: '右移' },
    ],
  },
  {
    enName: 'pelvis',
    name: '盆骨',
    result: [
      { key: 'leftHigh', value: '左高' },
      { key: 'rightHigh', value: '右高' },
      { key: 'toLeft', value: '左移' },
      { key: 'toRight', value: '右移' },
      { key: 'toForward', value: '前移' },
      { key: 'toBackwards', value: '后移' },
      { key: 'forward', value: '前倾' },
      { key: 'backwards', value: '后倾' },
    ],
  },
  {
    enName: 'knee',
    name: '膝盖',
    result: [
      { key: 'x', value: 'X型' },
      { key: 'o', value: 'O型' },
      { key: 'forward', value: '过伸' },
      { key: 'backwards', value: '过屈' },
    ],
  },
  {
    enName: 'foot',
    name: '足踝',
    result: [
      { key: 'out', value: '外翻' },
      { key: 'in', value: '内翻' },
    ],
  },
]

/** 按照结果映射结构 过滤出每项指标结果  用于页面展示*/
const getDiagnosisResult = (data) => {
  const groupList = groupBy(data, 'enName')
  let result = []
  Object.keys(groupList).forEach((item) => {
    const diagnosisResultMap = diagnosisResultMapping.find(
      (el) => el.enName === item
    )
    let part = {
      name: diagnosisResultMap.name,
      enName: diagnosisResultMap.enName,
      result: [],
    }
    ;(diagnosisResultMap.result || []).forEach((el) => {
      const target = groupList[item].filter(
        (elm) =>
          elm.resultText.includes(el.value) &&
          Number(elm.angle) >= elm[elm.thresholdKey]
      )
      const res = { key: el.key, name: el.value, value: !!target.length }
      part.result.push(res)
    })
    result.push(part)
  })
  return result
}

/** 处理服务端结果数据 用于页面展示*/
const getDiagnosisResultFromServer = (data) => {
  let resultList = []
  diagnosisResultMapping.forEach((item) => {
    const resultKeys = data[item.enName] ? Object.keys(data[item.enName]) : []
    const result = resultKeys
      .map((key) => {
        const matchLocalKey = item.result.find((el) => el.key === key)
        if (matchLocalKey) {
          return {
            key: key,
            value: data[item.enName][key],
            name: matchLocalKey.value,
          }
        }
      })
      .filter((elm) => !!elm)
    resultList.push({
      name: item.name,
      enName: item.enName,
      result: result,
    })
  })
  return resultList
}
/** 处理页面指标结果数据 用于服务端交互 */
const getDiagnosisResultToServer = (data) => {
  let resultObj = {}
  data.forEach((item) => {
    const part = {}
    item.result.forEach((el) => {
      part[el.key] = el.value
    })
    resultObj[item.enName] = part
  })
  return resultObj
}

const groupBy = (arr, property) => {
  return arr.reduce((accumulator, currentValue) => {
    if (!accumulator[currentValue[property]]) {
      accumulator[currentValue[property]] = []
    }
    accumulator[currentValue[property]].push(currentValue)
    return accumulator
  }, {})
}

module.exports = {
  getDiagnosisResult,
  getDiagnosisResultFromServer,
  getDiagnosisResultToServer,
}
