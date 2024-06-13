// import { getDiagnosisData } from '../utils/base'
const express = require('express')
const router = express.Router()
const getDiagnosisData = require('../utils/base')
/**
 * @description 获取解析结果
 */
router.get('/test', function (req, res, next) {
  try {
    res.send({
      code: '0',
      message: '操作成功',
      data: [],
    })
  } catch (error) {
    res.send({
      code: '500',
      message: '操作失败',
      data: error.message,
    })
  }
})

router.post('/getAnalysisData', function (req, res, next) {
  try {
    const { points, poseType } = req.body
    const diagnosisData = getDiagnosisData(points, poseType)
    res.send({
      code: '200',
      message: '操作成功',
      data: diagnosisData,
    })
  } catch (error) {
    res.send({
      code: '500',
      message: '操作失败',
      data: error.message,
    })
  }
})

module.exports = router
