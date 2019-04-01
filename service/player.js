var config = require('config')
var fs = require('fs')
var { spawn, spawnSync } = require('child_process')

module.exports = {
  start
}

function start () {
  var musicPath = './resources/musics/'
  var randomMusic = musicPath + getRandomFileSync(musicPath)

  var imagePath = './resources/bg/'
  var randomImage = imagePath + getRandomFileSync(imagePath)

  playMusic(randomImage, randomMusic, getRTMPUrl(), { video_encoder: 'h264' })
}

function playMusic (imgPath, musicPath, output, userOptions) {
  var defaults = {
    fps: 3,
    max_rate: '3000k',
    video_encoder: 'h264_omx'
  }

  userOptions = Object.assign({}, defaults, userOptions)

  const { stdout } = spawnSync('ffprobe', [
    '-hide_banner',
    '-print_format', 'json',
    '-show_format',
    musicPath
  ])

  const { format } = JSON.parse(stdout)
  console.info(format.duration)

  var playProcess = spawn('ffmpeg', [
    '-hide_banner',
    '-v', 'warning',
    '-threads', '0',
    '-re',
    '-loop', '1',
    '-r', `${userOptions.fps}`,
    '-t', `${format.duration}`,
    '-f', 'image2',
    `-i`, `${imgPath}`,
    `-i`, `${musicPath}`,
    `-pix_fmt`, 'yuv420p',
    '-preset', 'ultrafast',
    '-maxrate', `${userOptions.max_rate}`,
    '-acodec', 'copy',
    '-c:v', `${userOptions.video_encoder}`,
    `-f`, 'flv',
    `${output}`
  ])

  playProcess.on('exit', (code, signal) => {
    console.info(`play_process exit code: ${code}, signal: ${signal}`)
    start()
  })

  playProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  playProcess.stderr.on('data', (data) => {
    console.warn(`stderr: ${data}`)
  })
}

function getRTMPUrl () {
  var rtmp = config.get('rtmp')
  return rtmp.url + rtmp.code
}

function getRandomFileSync (path) {
  var fileList = fs.readdirSync(path)
  fileList = fileList.filter((filename) => {
    return !filename.startsWith('.')
  })
  if (fileList.length === 0) {
    throw new Error(`no files under ${path}`)
  }
  return fileList[randomInt(0, fileList.length - 1)]
}

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
