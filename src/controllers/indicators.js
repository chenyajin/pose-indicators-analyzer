// import { getDiagnosisData } from '../utils/base'
const express = require('express')
const router = express.Router()
const { getDiagnosisData, getAllDiagnosisData } = require('../utils/base')

/**
 * @description 测试接口
 */
router.get('/test', function (req, res, next) {
  try {
    res.send({
      code: 200,
      message: '操作成功',
      data: [],
    })
  } catch (error) {
    res.send({
      code: 500,
      message: '操作失败',
      data: error.message,
    })
  }
})

/** 解析多张图片数据 */
router.post('/getAnalysisData/multiple', function (req, res, next) {
  try {
    const { data } = req.body
    const result = getAllDiagnosisData(data)
    res.send({
      code: 200,
      message: '操作成功',
      data: result,
    })
  } catch (error) {
    console.log('error', error)
    res.send({
      code: 500,
      message: '操作失败',
      data: error.message,
    })
  }
})

/** 解析单张图片数据 */
router.post('/getAnalysisData/single', function (req, res, next) {
  try {
    const { points, poseType } = req.body
    const result = getDiagnosisData(points, poseType)
    res.send({
      code: 200,
      message: '操作成功',
      data: result,
    })
  } catch (error) {
    res.send({
      code: 500,
      message: '操作失败',
      data: error.message,
    })
  }
})

module.exports = router
