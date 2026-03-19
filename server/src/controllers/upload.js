/**
 * 文件上传控制器
 */

const COS = require('cos-nodejs-sdk-v5');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
  Bucket: process.env.COS_BUCKET,
  Region: process.env.COS_REGION
});

/**
 * 上传图片
 * POST /api/v1/upload/image
 */
async function image(ctx) {
  const file = ctx.request.files?.file;
  
  if (!file) {
    ctx.status = 400;
    ctx.body = { code: 40001, message: '请上传文件', data: null };
    return;
  }
  
  // 验证文件类型
  const ext = path.extname(file.originalFilename || file.name || '').toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  if (!allowedExts.includes(ext)) {
    ctx.status = 400;
    ctx.body = { code: 40002, message: '不支持的图片格式', data: null };
    return;
  }
  
  // 生成文件名
  const filename = `images/${uuidv4()}${ext}`;
  
  try {
    const result = await cos.putObject({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Key: filename,
      Body: require('fs').createReadStream(file.filepath || file.path)
    });
    
    const url = `https://${process.env.COS_BASE_URL}/${filename}`;
    
    ctx.body = {
      code: 0,
      message: '上传成功',
      data: { url }
    };
  } catch (err) {
    console.error('Upload error:', err);
    ctx.status = 500;
    ctx.body = { code: 50002, message: '上传失败', data: null };
  }
}

/**
 * 上传视频
 * POST /api/v1/upload/video
 */
async function video(ctx) {
  const file = ctx.request.files?.file;
  
  if (!file) {
    ctx.status = 400;
    ctx.body = { code: 40001, message: '请上传文件', data: null };
    return;
  }
  
  // 验证文件类型
  const ext = path.extname(file.originalFilename || file.name || '').toLowerCase();
  const allowedExts = ['.mp4', '.mov', '.avi'];
  
  if (!allowedExts.includes(ext)) {
    ctx.status = 400;
    ctx.body = { code: 40002, message: '不支持的视频格式', data: null };
    return;
  }
  
  // 验证文件大小 (50MB)
  const maxSize = 50 * 1024 * 1024;
  const stats = require('fs').statSync(file.filepath || file.path);
  if (stats.size > maxSize) {
    ctx.status = 400;
    ctx.body = { code: 40003, message: '视频大小不能超过 50MB', data: null };
    return;
  }
  
  // 生成文件名
  const filename = `videos/${uuidv4()}${ext}`;
  
  try {
    const result = await cos.putObject({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Key: filename,
      Body: require('fs').createReadStream(file.filepath || file.path)
    });
    
    const url = `https://${process.env.COS_BASE_URL}/${filename}`;
    
    ctx.body = {
      code: 0,
      message: '上传成功',
      data: { url }
    };
  } catch (err) {
    console.error('Upload error:', err);
    ctx.status = 500;
    ctx.body = { code: 50002, message: '上传失败', data: null };
  }
}

module.exports = {
  image,
  video
};
