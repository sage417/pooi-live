var config = require('config')
var fs = require('fs')
var { spawn } = require('child_process')

module.exports = {
  start
}

function start () {
  var musicPath = './res/music/'
  var randomMusic = musicPath + getRandomFileSync(musicPath)

  var imagePath = './res/bg/'
  var randomImage = imagePath + getRandomFileSync(imagePath)

  console.info(randomImage, randomMusic)

  playMusic(randomImage, randomMusic, getRTMPUrl())
}

function playMusic (imgPath, musicPath, output) {
  var playProcess = spawn('ffmpeg', [
    '-threads', '0',
    '-re',
    '-loop', '1',
    '-r', '2',
    // '-t', '200',
    '-f', 'image2',
    `-i`, `${imgPath}`,
    // '-stream_loop', '-1',
    `-i`, `${musicPath}`,
    `-pix_fmt`, 'yuv420p',
    '-preset', 'ultrafast',
    '-maxrate', '3000k',
    '-acodec', 'copy',
    '-c:v', `h264`,
    `-f`, 'flv',
    `${output}`
  ])

  playProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  playProcess.stderr.on('data', (data) => {
    // console.warn(`stderr: ${data}`)
  })

  playProcess.on('exit', (code) => {
    console.info(`play_process exit code:${code}`)
    start()
  })
}

function getRTMPUrl () {
  var rtmp = config.get('rtmp')
  return rtmp.url + rtmp.code
}

function getRandomFileSync (path) {
  var fileList = fs.readdirSync(path)
  if (fileList.length === 0) {
    throw new Error(`no files under ${path}`)
  }
  return fileList[randomInt(0, fileList.length - 1)]
}

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
