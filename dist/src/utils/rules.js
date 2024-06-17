/*
 * @Author: 陈亚金
 * @Date: 2024-04-28 09:48:54
 * @LastEditors: 陈亚金
 * @LastEditTime: 2024-06-17 14:00:43
 * @Description: 指标偏移角度计算-规则
 */
const { getAllPoints } = require('./openPoseRules')

const PoseTypeEnum = {
  front: 'front', // 正面
  back: 'back', // 背面
  left: 'left', // 左面
  right: 'right', // 右面
}

/** 根据体姿模型 获取指标关键点数据 */
const getDiagnosisPointsData = (data, poseType) => {
  const allPoints = getAllPoints(data, poseType)
  return points_data_25(allPoints, poseType)
}

const points_data_25 = (allData, poseType) => {
  let result = { points: [], connections: [], indicatorNames: [] }
  switch (poseType) {
    case PoseTypeEnum.front:
      result = getAllPointsByFront(allData)
      break
    case PoseTypeEnum.left:
      result = getAllPointsByLeft(allData)
      break
    case PoseTypeEnum.right:
      result = getAllPointsByRight(allData)
      break
    case PoseTypeEnum.back:
      result = getAllPointsByBack(allData)
      break
  }
  return result
}

// =====================================  正面指标 ============================
/** 正面指标
 *  基于测量线起始坐标点的比较
 */
// type IIndicatorCompare = {
//   /** 指标名 -中文 */
//   name: string
//   /** 指标名 - 英文 */
//   enName?: string
//   /**  比较线： */
//   compareLine: 'target' | 'base'
//   /**  比较方向： */
//   compareDirect: 'x' | 'y'
//   /** 差值比较：大于0 */
//   compareValue: number
//   /** 比较结果: 正向文案 */
//   compareResultMore: string
//   /** 比较结果: 反向文案 */
//   compareResultLess: string
//   /** 特殊指标文案需要特殊处理的标识值 */
//   specialFlagValue?: string
//   /** 特殊处理后结果为1的文案字段 */
//   specialResultKey?: string
//   /**阀值: 临界值 */
//   threshold?: number
//   /** 正向临界值 */
//   resultMoreThreshold?: number
//   /** 反向临界值 */
//   resultLessThreshold?: number
// }
const diagnosis_front_name = [
  {
    name: '头颈',
    enName: 'head',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '右倾',
    compareResultLess: '左倾',
    threshold: 2,
  },
  {
    name: '肩',
    enName: 'shoulder',
    compareLine: 'target',
    compareDirect: 'y',
    compareValue: 0,
    compareResultMore: '右高',
    compareResultLess: '左高',
    threshold: 0.9,
  },
  {
    name: '胸椎(人工点)',
    enName: 'thoracolumbar',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '右移',
    compareResultLess: '左移',
    threshold: 1,
  },
  {
    name: '骨盆',
    enName: 'pelvis',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '左高',
    compareResultLess: '右高',
    threshold: 2,
  },
  {
    name: '骨盆',
    enName: 'pelvis',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '左移',
    compareResultLess: '右移',
    threshold: 2,
  },
  {
    name: '右膝关节',
    enName: 'knee',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '内翻(O型)',
    compareResultLess: '外翻(X型)',
    specialFlagValue: '1',
    specialResultKey: 'compareResultLess',
    threshold: 3,
  },
  {
    name: '左膝关节',
    enName: 'knee',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '外翻(X型)',
    compareResultLess: '内翻(O型)',
    specialFlagValue: '1',
    specialResultKey: 'compareResultLess',
    threshold: 3,
  },
]

/** 指标对应测量线：确定起始坐标点
 * arr[0]:boolean 开始点坐标是否取中点。true表示取arr[1]和arr[2]中点, 当测量线开始点坐标, false则取arr[2]
 * arr[1]:number 点下标，开始点坐标
 * arr[2]:number 点下标，开始点坐标
 * arr[3]:boolean 结束点坐标是否取中点。true表示取arr[4]和arr[5]中点, 当测量线结束点坐标, false则取arr[5]
 * arr[4]:number 点下标，结束点坐标
 * arr[5]:number 点下标，结束点坐标
 */
// type ITargetLineRule = [boolean, number, number, boolean, number, number]
const diagnosis_front_target_line = [
  [false, 0, 1, true, 15, 16], // 头颈-左右倾
  [false, 0, 5, false, 0, 2], // 肩 - 左右高
  [true, 12, 9, true, 26, 25], // 胸椎 - 左右平移
  [false, 0, 12, false, 0, 9], // 骨盆 - 左右高
  [true, 12, 9, true, 14, 11], // 骨盆 - 左右平移
  [false, 0, 11, false, 0, 10], // 右膝关节 - 外翻内翻
  [false, 0, 14, false, 0, 13], // 左膝关节 - 外翻内翻
]

/** 指标对应基线：确定起始坐标点
 * arr[0]:boolean 开始点坐标是否取中点。true表示取arr[1]和arr[2]中点, false则取arr[2]
 * arr[1]:number 点下标，开始点坐标
 * arr[2]:number 点下标，开始点坐标
 * arr[3]:boolean 结束点坐标是否需要在开始点基础上计算。true表示在arr[4]轴上加上测量线的长度, false则取arr[5]
 * arr[4]:string 计算规则，y表示y轴，x表示x轴
 * arr[5]: 点下标，当arr[1]=false时，此坐标为测量线结束点坐标
 */
// type IBaseLineRule = [boolean, number, number, boolean, 'x' | 'y', number]
const diagnosis_front_base_line = [
  [false, 0, 1, true, 'y', 0], // 头颈-左右倾
  [false, 0, 5, true, 'x', 0], // 肩 - 左右高
  [true, 12, 9, true, 'y', 0], // 胸椎 - 左右平移
  [false, 0, 12, true, 'x', 0], // 骨盆 - 左右高
  [true, 12, 9, true, 'y', 0], // 骨盆 - 左右平移
  [false, 0, 10, false, 'x', 9], // 右膝关节 - 外翻内翻
  [false, 0, 13, false, 'x', 12], // 左膝关节 - 外翻内翻
]

const getAllPointsByFront = (allData) => {
  const points1 = getTargetPointByRules(diagnosis_front_target_line, allData)
  const points2 = getBasePointByRules(
    diagnosis_front_base_line,
    allData,
    points1
  )
  const points = [...points1, ...points2]
  const connections = []
  for (let i = 0; i < points.length; i += 2) {
    connections.push([i, i + 1])
  }
  return {
    points,
    connections,
    indicatorNames: diagnosis_front_name,
  }
}

// =====================================  右侧面指标 ============================
/** 右侧面-测量线 */
const diagnosis_right_target_line = [
  [false, 0, 1, false, 0, 6], // 头颈-头前倾
  [false, 0, 1, false, 0, 2], // 肩部-前后倾
  [false, 0, 2, false, 0, 3], // 骨盆-前后移
  [false, 0, 10, false, 0, 11], // 骨盆-前后倾
  [false, 0, 4, false, 0, 3], // 膝关节-前后倾
]
/** 右侧面-基准线 */
const diagnosis_right_base_line = [
  [false, 0, 1, true, 'y', 0], // 头颈-左右倾
  [false, 0, 1, true, 'y', 0], //  肩部-前后倾
  [false, 0, 2, true, 'y', 0], //  骨盆-前后移
  [false, 0, 10, true, 'x', 0], //  骨盆-前后倾
  [false, 0, 4, false, 'y', 2], //  膝关节-前后倾
]

const diagnosis_right_name = [
  {
    name: '头',
    enName: 'head',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '后伸',
    compareResultLess: '前伸',
    threshold: 5,
  },
  {
    name: '肩部',
    enName: 'shoulder',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '前倾',
    compareResultLess: '后倾',
    threshold: 3,
  },
  {
    name: '骨盆',
    enName: 'pelvis',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '前移',
    compareResultLess: '后移',
    threshold: 2,
  },
  {
    name: '骨盆(人工点)',
    enName: 'pelvis',
    compareLine: 'target',
    compareDirect: 'y',
    compareValue: 0,
    compareResultMore: '后倾',
    compareResultLess: '前倾',
    threshold: 0,
    resultMoreThreshold: 3,
    resultLessThreshold: 10,
  },
  {
    name: '右膝关节',
    enName: 'knee',
    compareLine: 'base',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '膝过伸',
    compareResultLess: '膝过屈',
    threshold: 2,
  },
]

const getAllPointsByRight = (allData) => {
  const points1 = getTargetPointByRules(diagnosis_right_target_line, allData)
  const points2 = getBasePointByRules(
    diagnosis_right_base_line,
    allData,
    points1
  )
  const points = [...points1, ...points2]
  const connections = []
  for (let i = 0; i < points.length; i += 2) {
    connections.push([i, i + 1])
  }
  return {
    points,
    connections,
    indicatorNames: diagnosis_right_name,
  }
}
// =====================================  左侧面指标 ============================
/** 右侧面-测量线 */
const diagnosis_left_target_line = [
  [false, 0, 1, false, 0, 6], // 头颈-头前倾
  [false, 0, 1, false, 0, 2], // 肩部-前后倾
  [false, 0, 2, false, 0, 3], // 骨盆-前后移
  [false, 0, 10, false, 0, 11], // 骨盆-前后倾
  [false, 0, 4, false, 0, 3], // 膝关节-前后倾
]
/** 右侧面-基准线 */
const diagnosis_left_base_line = [
  [false, 0, 1, true, 'y', 0], // 头颈-左右倾
  [false, 0, 1, true, 'y', 0], //  肩部-前后倾
  [false, 0, 2, true, 'y', 0], //  骨盆-前后移
  [false, 0, 10, true, 'x', 0], //  骨盆-前后倾
  [false, 0, 4, false, 'y', 2], //  膝关节-前后倾
]

const diagnosis_left_name = [
  {
    name: '头',
    enName: 'head',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '前伸',
    compareResultLess: '后伸',
    threshold: 5,
  },
  {
    name: '肩部',
    enName: 'shoulder',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '后倾',
    compareResultLess: '前倾',
    threshold: 3,
  },
  {
    name: '骨盆',
    enName: 'pelvis',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '后移',
    compareResultLess: '前移',
    threshold: 2,
  },
  {
    name: '骨盆(人工点)',
    enName: 'pelvis',
    compareLine: 'target',
    compareDirect: 'y',
    compareValue: 0,
    compareResultMore: '后倾',
    compareResultLess: '前倾',
    threshold: 0,
    resultMoreThreshold: 3,
    resultLessThreshold: 10,
  },
  {
    name: '左膝关节',
    enName: 'knee',
    compareLine: 'base',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '膝过屈',
    compareResultLess: '膝过伸',
    threshold: 3,
  },
]

const getAllPointsByLeft = (allData) => {
  const points1 = getTargetPointByRules(diagnosis_left_target_line, allData)
  const points2 = getBasePointByRules(
    diagnosis_left_base_line,
    allData,
    points1
  )
  const points = [...points1, ...points2]
  const connections = []
  for (let i = 0; i < points.length; i += 2) {
    connections.push([i, i + 1])
  }
  return {
    points,
    connections,
    indicatorNames: diagnosis_left_name,
  }
}
// =====================================  后面指标 ============================
const diagnosis_back_target_line = [
  [true, 4, 1, true, 14, 15], // 头颈-左右倾
  [false, 0, 1, false, 0, 4], // 肩 - 左右高
  [true, 18, 19, true, 20, 21], // 胸椎 - 左右平移
  [true, 16, 17, true, 20, 21], // 骨盆 - 左右平移
  [false, 0, 13, false, 0, 16], // 左足踝 - 内外翻
  [false, 0, 10, false, 0, 17], // 右足踝 - 内外翻
]

const diagnosis_back_base_line = [
  [true, 4, 1, true, 'y', 0], // 头颈-左右倾
  [false, 0, 1, true, 'x', 0], // 肩 - 左右高
  [true, 18, 19, true, 'y', 0], // 胸椎 - 左右平移
  [true, 16, 17, true, 'y', 0], // 骨盆 - 左右平移
  [false, 0, 11, false, 'y', 13], //  左足踝 - 内外翻
  [false, 0, 8, false, 'y', 10], //  右足踝 - 内外翻
]

const diagnosis_back_name = [
  {
    name: '头',
    enName: 'head',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '左倾',
    compareResultLess: '右倾',
    threshold: 2,
  },
  {
    name: '肩',
    enName: 'shoulder',
    compareLine: 'target',
    compareDirect: 'y',
    compareValue: 0,
    compareResultMore: '左高',
    compareResultLess: '右高',
    threshold: 0.9,
  },
  {
    name: '胸椎(人工点)',
    enName: 'thoracolumbar',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '右移',
    compareResultLess: '左移',
    threshold: 1,
  },
  {
    name: '骨盆(人工点)',
    enName: 'pelvis',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '左移',
    compareResultLess: '右移',
    threshold: 1,
  },
  {
    name: '左足踝',
    enName: 'foot',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '外翻',
    compareResultLess: '内翻',
    threshold: 3,
  },
  {
    name: '右足踝',
    enName: 'foot',
    compareLine: 'target',
    compareDirect: 'x',
    compareValue: 0,
    compareResultMore: '内翻',
    compareResultLess: '外翻',
    threshold: 3,
  },
]
const getAllPointsByBack = (allData) => {
  const points1 = getTargetPointByRules(diagnosis_back_target_line, allData)
  const points2 = getBasePointByRules(
    diagnosis_back_base_line,
    allData,
    points1
  )
  const points = [...points1, ...points2]
  const connections = []
  for (let i = 0; i < points.length; i += 2) {
    connections.push([i, i + 1])
  }
  return {
    points,
    connections,
    indicatorNames: diagnosis_back_name,
  }
}

// =====================================  指标工具函数 ============================

/** 根绝测量线规则 计算出测量线两点坐标点
 * @param data <ITargetLine[]>测量线规则
 * @param allPoints  < [number, number, number][]>25点模型所有坐标点
 */
const getTargetPointByRules = (rules, allPoints) => {
  const points = []
  rules.forEach((item) => {
    const start = item[0]
      ? calculateMidpoint(allPoints[item[1]], allPoints[item[2]])
      : allPoints[item[2]]
    const end = item[3]
      ? calculateMidpoint(allPoints[item[4]], allPoints[item[5]])
      : allPoints[item[5]]
    points.push(start)
    points.push(end)
  })
  return points
}

/** 根绝基准线线规则 计算出基准线两点坐标点
 * @param data <ITargetLine[]>测量线规则
 * @param allPoints  < [number, number, number][]>25点模型所有坐标点
 */
const getBasePointByRules = (rules, allPoints, targetPoints) => {
  const points = []
  rules.forEach((item, index) => {
    const start = item[0]
      ? calculateMidpoint(allPoints[item[1]], allPoints[item[2]])
      : allPoints[item[2]]
    const endItem = calculateTargetPoint(start, item[4], [
      targetPoints[index * 2],
      targetPoints[index * 2 + 1],
    ])
    const end = item[3] ? endItem : allPoints[item[5]]
    points.push(start)
    points.push(end)
  })
  return points
}

/** 根据两点坐标计算出中点的坐标 */
const calculateMidpoint = (point1, point2) => {
  const x1 = point1[0]
  const y1 = point1[1]
  const x2 = point2[0]
  const y2 = point2[1]

  const centerX = (x1 + x2) / 2
  const centerY = (y1 + y2) / 2

  return [centerX, centerY, 1]
}
/** 根据基点坐标计算出目标坐标 */
const calculateTargetPoint = (base, director, targetPoints) => {
  let newX = base[0]
  let newY = base[1]
  // 计算x轴方向的距离,向右为正，向左为负
  const deltaX = targetPoints[1][0] - targetPoints[0][0]
  // 计算y轴方向的距离,向上为正，向下为负
  const deltaY = targetPoints[1][1] - targetPoints[0][1]
  const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))

  if (director === 'x') {
    newX += deltaX < 0 ? -distance : distance
  } else if (director === 'y') {
    newY += deltaY < 0 ? -distance : distance
  } else {
    throw new Error("Invalid director value. Expected 'x' or 'y'.")
  }

  return [Number(newX.toFixed(3)), Number(newY.toFixed(3)), 1]
}

/** 根绝两线计算出夹角度数 */
const calculateAngleBetweenLines = (points) => {
  const line1Start = points[0]
  const line1End = points[1]
  const line2Start = points[2]
  const line2End = points[3]
  // 计算方向向量
  const vector1 = [line1End[0] - line1Start[0], line1End[1] - line1Start[1]]
  const vector2 = [line2End[0] - line2Start[0], line2End[1] - line2Start[1]]

  // 计算点积与长度
  const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1]
  const magnitude1 = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2)
  const magnitude2 = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2)

  // 计算夹角余弦值与角度（弧度）
  const cosTheta = dotProduct / (magnitude1 * magnitude2)
  const thetaInRadians = Math.acos(cosTheta)

  // 将弧度转换为度数
  const thetaInDegrees = thetaInRadians * (180 / Math.PI)

  return thetaInDegrees.toFixed(2)
}

/** 根据测量线始终点坐标 计算出部位的指标偏移方向文案 */
const calculateResultText = (pointStart, pointEnd, indicator, targetPoints) => {
  const {
    compareDirect,
    compareResultMore,
    compareResultLess,
    specialFlagValue = '0',
    specialResultKey,
    resultMoreThreshold,
    threshold,
  } = indicator
  /**特殊处理 */
  if (Object.keys(specialIndicators).includes(specialFlagValue)) {
    const resultFunction = Reflect.get(specialIndicators, specialFlagValue)
    const result =
      resultFunction && resultFunction(pointEnd, pointStart, targetPoints)
    const isMoreKey = specialResultKey === 'compareResultMore'
    const leftResult = isMoreKey ? compareResultMore : compareResultLess
    const rightResult = isMoreKey ? compareResultLess : compareResultMore
    const lastResult = result === 1 ? leftResult : rightResult
    const key =
      (result === 1 && isMoreKey) || (result === 2 && !isMoreKey)
        ? 'resultMoreThreshold'
        : 'resultLessThreshold'
    return {
      text: lastResult,
      key: resultMoreThreshold ? key : 'threshold',
    }
  }
  let result = ''
  let key = ''
  // let start = compareLine === 'target' ? compareDirect === 'x' : pointEnd
  if (compareDirect === 'x') {
    if (pointStart[0] > pointEnd[0]) {
      result = compareResultMore
      key = 'resultMoreThreshold'
    } else {
      result = compareResultLess
      key = 'resultLessThreshold'
    }
  } else if (compareDirect === 'y') {
    if (pointStart[1] > pointEnd[1]) {
      result = compareResultMore
      key = 'resultMoreThreshold'
    } else {
      result = compareResultLess
      key = 'resultLessThreshold'
    }
  }
  return {
    text: result,
    key: resultMoreThreshold ? key : 'threshold',
  }
}

/**
 * 计算d点在a和b之间，d点在a的左边还是右边
 * @param a 线的起始点
 * @param b 线的终点
 * @param d 目标点
 * @returns number 1=左侧 2=右侧或线上
 */
const checkPointSide = (a, b, d) => {
  const [ax, ay] = a
  const [bx, by] = b
  const [dx, dy] = d
  // 计算向量AB = B - A
  const abX = bx - ax
  const abY = by - ay

  // 计算向量BD = D - B
  const bdX = dx - bx
  const bdY = dy - by

  // 计算叉积 AB × BD = (abX * bdY) - (abY * bdX)
  const crossProduct = abX * bdY - abY * bdX

  // 根据叉积结果判断D点位置
  return crossProduct > 0 ? 1 : 2
}

/** 特殊指标的文案计算方法映射 */
const specialIndicators = {
  1: checkPointSide,
  2: checkPointSide,
}

module.exports = {
  getDiagnosisPointsData,
  calculateAngleBetweenLines,
  calculateResultText,
}
