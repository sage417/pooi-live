var { spawnSync } = require('child_process')

export { prob }

async function prob (input, opts = []) {
  return spawnSync('ffprobe', [
    '-hide_banner',
    '-print_format', 'json',
    '-show_format',
    ...opts,
    input
  ])
}
