/*
 * @Author: 陈亚金
 * @Date: 2024-04-24 09:03:17
 * @LastEditors: 陈亚金
 * @LastEditTime: 2024-06-17 14:08:16
 * @Description: 姿势识别 模型取值工具
 */

const PoseTypeEnum = {
  front: 'front', // 正面
  back: 'back', // 背面
  left: 'left', // 左面
  right: 'right', // 右面
}
// ===================================== 25点模型 =============================
/** 25点模型 关节点顺序名 */
const point_names_25_front = [
  /** 0 */ 'nose' /** 鼻子 */,
  /** 1*/ 'neck' /** 胸骨切迹*/,
  /** 2*/ 'right_shoulder' /** 右肩锁关节*/,
  /** 3*/ 'right_elbow' /** 右肘关节*/,
  /** 4*/ 'right_wrist' /** 右腕关节*/,
  /** 5*/ 'left_shoulder' /** 左肩锁关节*/,
  /** 6*/ 'left_elbow' /** 左肘关节 */,
  /** 7*/ 'left_wrist' /**左腕关节 */,
  /** 8*/ 'middle_hip' /**股骨大转子中心 */,
  /** 9*/ 'right_hip' /** 右股骨大转子*/,
  /** 10*/ 'right_knee' /** 右膝关节*/,
  /** 11*/ 'right_ankle' /**右脚踝关节 */,
  /** 12*/ 'left_hip' /** 左股骨大转子*/,
  /** 13*/ 'left_knee' /**左膝关节 */,
  /** 14*/ 'left_ankle' /** 左脚踝关节*/,
  /** 15*/ 'right_eye' /**右眼 */,
  /** 16*/ 'left_eye' /** 左眼*/,
  /** 17*/ 'right_ear' /** 右耳*/,
  /** 18*/ 'left_ear' /** 左耳*/,
  /** 19*/ 'left_big_toe' /** 左大脚趾*/,
  /** 20*/ 'left_small_toe' /** 左小脚趾*/,
  /** 21*/ 'left_heel' /**左脚跟 */,
  /** 22*/ 'right_big_toe' /**右大脚趾 */,
  /** 23*/ 'right_small_toe' /**右小脚趾 */,
  /** 24*/ 'right_heel' /**右脚跟 */,
  /** 25*/ 'right_ribs' /** 右第八根肋骨*/,
  /** 26*/ 'left_ribs' /**左第八根肋骨 */,
  /** 27*/ 'right_back_spine' /** 右髂后上棘*/,
  /** 28*/ 'left_back_spine' /**左髂后上棘 */,
  /** 29*/ 'right_front_spine' /** 右髂前上棘 */,
  /** 30*/ 'left_front_spine' /** 左髂前上棘 */,
]

/** 25点模型中正面 的关节点下标*/
const front_half_points_25 = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26,
]
/** */ /** 25点模型中 右侧的关节点下标 */
const right_half_points_25 = [0, 2, 9, 10, 11, 15, 17, 22, 23, 24, 27, 29]
/** 25点模型中 左侧的关节点下标 */
const left_half_points_25 = [0, 5, 12, 13, 14, 16, 18, 19, 20, 21, 28, 30]
/** 18点模型中 背面 的关节点下标 todo*/
const back_half_points_25 = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 21, 24, 25, 26, 27, 28,
]

const getAllPoints = (allData, poseType) => {
  const allPoints = getAllPointPlusManual(allData, poseType)
  return {
    front: allPoints.filter((_, i) => front_half_points_25.includes(i)),
    left: allPoints.filter((_, i) => left_half_points_25.includes(i)),
    right: allPoints.filter((_, i) => right_half_points_25.includes(i)),
    back: allPoints.filter((_, i) => back_half_points_25.includes(i)),
  }[poseType]
}
/** 所有点：加上需要人工打的点 */
const getAllPointPlusManual = (allData, poseType) => {
  const leftShoulderLine = [allData[5], allData[12]]
  const rightShoulderLine = [allData[2], allData[9]]
  const leftHip = [allData[8], allData[12]]
  const rightHip = [allData[8], allData[9]]
  /** 第八根肋骨 */
  const { line1: leftRibs, line2: rightRibs } = findPointsAtOneThird(
    leftShoulderLine,
    rightShoulderLine
  )
  /** 髂后上棘 */
  const { line1: leftBackSpine, line2: rightBackSpine } = findPointsAtOneThird(
    leftHip,
    rightHip
  )
  const { line1, line2 } = findPointsAtOneThird(
    leftShoulderLine.reverse(),
    rightShoulderLine.reverse(),
    6
  )
  leftBackSpine[1] = line1[1]
  rightBackSpine[1] = line2[1]
  /** 髂前上棘 */
  const leftFrontSpine = [0, 0, 1]
  const rightFrontSpine = [0, 0, 1]
  /** 侧面 预估算法（暂无算法） */
  if (poseType === PoseTypeEnum.left) {
    leftBackSpine[0] = allData[12][0] + 30
    leftBackSpine[1] = allData[12][1] - 10
    leftFrontSpine[0] = allData[12][0] - 30
    leftFrontSpine[1] = allData[12][1] - 10
  } else if (poseType === PoseTypeEnum.right) {
    rightBackSpine[0] = allData[9][0] - 30
    rightBackSpine[1] = allData[9][1] - 10
    rightFrontSpine[0] = allData[9][0] + 30
    rightFrontSpine[1] = allData[9][1] - 10
  }
  return [
    ...allData,
    rightRibs,
    leftRibs,
    rightBackSpine,
    leftBackSpine,
    rightFrontSpine,
    leftFrontSpine,
  ]
}

/** 根据原始打点数据，处理成坐标轴点数据 */
const dealOriginPoints = (points = []) => {
  const data = []
  for (let i = 0; i < points.length; i += 3) {
    const targe = points.slice(i, i + 3)
    targe[2] = 1
    data.push(targe)
  }
  return data || []
}

/** 根据肩两点，髂前上棘两点计算出第八根肋骨的两点坐标点 */
const findPointsAtOneThird = (line1, line2, denominator = 3) => {
  const [line1StartX, line1StartY] = line1[0]
  const [line1EndX, line1EndY] = line1[1]
  const [line2StartX, line2StartY] = line2[0]
  const [line2EndX, line2EndY] = line2[1]
  /**
   * 计算一条直线上，距离起点1/3处的点的坐标。
   * @param {number} startX - 直线起点的x坐标
   * @param {number} startY - 直线起点的y坐标
   * @param {number} endX - 直线终点的x坐标
   * @param {number} endY - 直线终点的y坐标
   * @return {{x: number, y: number}} - 距离起点1/3处的点的坐标对象
   */
  const calculatePoint = (startX, startY, endX, endY) => {
    // 向量的x分量和y分量
    const vectorX = (endX - startX) / denominator
    const vectorY = (endY - startY) / denominator

    // 新点的坐标
    const newX = startX + vectorX
    const newY = startY + vectorY

    return [newX, newY, 1]
  }

  // 计算line1上距离起点1/3处的点
  const pointOnLine1 = calculatePoint(
    line1StartX,
    line1StartY,
    line1EndX,
    line1EndY
  )

  // 计算line2上距离起点1/3处的点
  const pointOnLine2 = calculatePoint(
    line2StartX,
    line2StartY,
    line2EndX,
    line2EndY
  )
  return { line1: pointOnLine1, line2: pointOnLine2 }
}

module.exports = {
  getAllPoints,
  dealOriginPoints,
}
