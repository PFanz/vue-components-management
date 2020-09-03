const path = require('path')
const fs = require('fs')
const vueCliService = require('@vue/cli-service')

const root = path.resolve(__dirname, '../')

let components = require('../src/components')

const pkgName = process.argv[2]

if (pkgName) {
  const targetComponents = components.filter(item => item.name === pkgName)

  if (targetComponents.length) {
    components = targetComponents
  } else {
    console.error(`package [${pkgName}]不存在`)
    process.exit(1)
  }
}

async function build() {
  for (let i = 0, len = components.length; i < len; i++) {
    const name = components[i].name
    const publishNamespace = components[i].publishNamespace
    const packagePath = `${root}/packages/${name}`

    // 配置build.js文件
    const selfBuildFile = `${packagePath}/src/build.js`
    if (fs.existsSync(selfBuildFile)) {
      const buildFunc = require(selfBuildFile)
      await buildFunc()
      continue
    }

    // 配置vue.config.js文件
    const packageVueConfigJSPath = `${packagePath}/vue.config.js`

    // cli工作目录，支持package内自定义配置，默认使用根目录下vue.config.js
    const cliWorkDict = fs.existsSync(packageVueConfigJSPath)
      ? packagePath
      : root
    console.log('>> vue.config.js', packageVueConfigJSPath)

    let pkgCliService = new vueCliService(cliWorkDict)
    // let pkgCliService = new vueCliService(root);
    await pkgCliService.run('build', {
      _: ['build', `${root}/packages/${name}/src/index.js`],
      target: 'lib',
      name: `${publishNamespace}-${name}`,
      dest: `${root}/packages/${name}/dist`,
      formats: 'commonjs,umd-min'
      // clean: false
    })
  }
}

build()
