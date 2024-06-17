/*
 * @Author: 陈亚金
 * @Date: 2024-06-11 13:51:39
 * @LastEditors: 陈亚金
 * @LastEditTime: 2024-06-17 14:24:14
 * @Description:
 */

const {
  getDiagnosisPointsData,
  calculateAngleBetweenLines,
  calculateResultText,
} = require('./rules')

const {
  getDiagnosisResult,
  getDiagnosisResultToServer,
} = require('./serialize')

/** 根据三张体态数据，获取所有诊断数据
 * @param {Array} data 体态数据 [{ points, poseType }]
 */
const getAllDiagnosisData = function (data = []) {
  const result = {}
  const indicators = []
  data.forEach((item) => {
    const itemResult = getDiagnosisData(item.points, item.poseType)
    result[item.poseType] = itemResult
    indicators.push(...itemResult.indicatorSubGroup)
  })
  const diagnosisResult = getDiagnosisResult(indicators)
  const diagnosisResultToServer = getDiagnosisResultToServer(diagnosisResult)
  result['all'] = diagnosisResultToServer
  return result
}
/** 根据体姿方向，获取诊断数据
 * @param {Array} points 体态数据
 * @param {String} poseType 体态类型
 */
const getDiagnosisData = function (points = [], poseType) {
  const {
    points: targetPoints,
    connections: targeConnections,
    indicatorNames,
  } = getDiagnosisPointsData(points, poseType)
  const rawkeyPoints = targetPoints
  const groupNames = indicatorNames
  const indicatorSubGroup = groupNames.map((item, index) => {
    const ruleNumber = 2 * index
    const connectionLength = targeConnections.length
    const targetPoint = [
      ruleNumber,
      ruleNumber + 1,
      ruleNumber + connectionLength,
      ruleNumber + connectionLength + 1,
    ]
    const anglePoints = targetPoint.map((item) => rawkeyPoints[item])
    const textResult = calculateResultText(
      rawkeyPoints[targetPoint[0]],
      rawkeyPoints[targetPoint[1]],
      item,
      rawkeyPoints[targetPoint[3]]
    )
    return {
      name: item.name,
      enName: item.enName,
      visible: true,
      index: index,
      points: targetPoint,
      threshold: item.threshold,
      resultMoreThreshold: item.resultMoreThreshold,
      resultLessThreshold: item.resultLessThreshold,
      thresholdKey: textResult.key,
      angle: calculateAngleBetweenLines(anglePoints),
      resultText: textResult.text,
    }
  })
  return {
    poseType: poseType,
    points: targetPoints,
    connections: targeConnections,
    indicatorNames,
    indicatorSubGroup,
  }
}
module.exports = {
  getDiagnosisData,
  getAllDiagnosisData,
}
