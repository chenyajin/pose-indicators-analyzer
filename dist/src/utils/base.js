/*
 * @Author: 陈亚金
 * @Date: 2024-06-11 13:51:39
 * @LastEditors: 陈亚金
 * @LastEditTime: 2024-06-13 16:11:59
 * @Description:
 */

const {
  getDiagnosisPointsData,
  calculateAngleBetweenLines,
  calculateResultText,
} = require('./rules')
const getDiagnosisData = function (points, poseType) {
  const {
    points: targetPoint,
    connections: targeConnections,
    indicatorNames,
  } = getDiagnosisPointsData(points, poseType)
  const rawkeyPoints = targetPoint
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
    points: targetPoint,
    connections: targeConnections,
    indicatorNames,
    indicatorSubGroup,
  }
}
module.exports = getDiagnosisData
