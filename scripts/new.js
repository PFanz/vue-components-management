const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const configPath = path.resolve(__dirname, '../src/components.js')
const tmplPath = path.resolve(__dirname, './template')
const eslint = require('eslint')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const CLIEngine = eslint.CLIEngine
const cli = new CLIEngine({ ...require('../.eslintrc.js'), fix: true })

const packages = require(configPath)

// process.on("exit", () => {
//   console.log();
// });

/**
 * 创建前检测
 */
const checkBeforeCreate = function(packageName) {
  if (
    !packageName ||
    /[^a-z0-9-]/.test(packageName) ||
    !/.+-vue$/.test(packageName)
  ) {
    console.error('请检查要创建的package name (kebab-case)(end with -vue)')
    return false
  }

  if (!Array.isArray(packages)) {
    console.error('src/components.js文件已被破坏，请恢复数组结构！')
    return false
  }
  // 判断package名是否存在
  if (packages.filter(component => component.name === packageName).length) {
    console.error(`package [${packageName}]已存在`)
    return false
  }
  return true
}

const updateConfig = function(path) {
  return writeFile(path, `module.exports = ${JSON.stringify(packages)}`).then(
    () => {
      console.log('完成更新 components.js')
      // 格式化
      CLIEngine.outputFixes(cli.executeOnFiles([configPath]))
    }
  )
}

const createPackage = function(options = {}) {
  const {
    packageName,
    publishNamespace,
    packageDesc,
    customVueConfig
  } = options
  try {
    const dir = path.resolve(__dirname, `../packages/${packageName}/`)
    const publishPackageName = `@${publishNamespace}/${packageName}`
    // 创建文件夹
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
      console.log(`完成创建 packages/${packageName}文件夹`)
    }
    // 写入README
    if (!fs.existsSync(`${dir}/README.md`)) {
      const tmpl = fs.readFileSync(`${tmplPath}/package/README.md`).toString()
      const fileText = _.template(tmpl)({
        packageName,
        packageDesc,
        publishPackageName
      })

      writeFile(`${dir}/README.md`, fileText).then(() => {
        console.log('完成创建 README')
      })
    }

    // 写入package.json
    if (!fs.existsSync(`${dir}/package.json`)) {
      const tmpl = fs
        .readFileSync(`${tmplPath}/package/package.json`)
        .toString()
      const fileText = _.template(tmpl)({
        publishNamespace,
        packageName,
        packageDesc,
        publishPackageName
      })

      writeFile(`${dir}/package.json`, fileText).then(() => {
        console.log('完成创建 package.json')
      })
    }

    // 写入vue.config.js
    if (customVueConfig && !fs.existsSync(`${dir}/vue.config.js`)) {
      const tmpl = fs
        .readFileSync(`${tmplPath}/package/vue.config.js`)
        .toString()
      const fileText = tmpl

      writeFile(`${dir}/vue.config.js`, fileText).then(() => {
        console.log('完成创建 vue.config.js')
      })
    }

    // 创建index.js
    const indexJSparent = `${dir}/src/`
    const indexJSpath = `${indexJSparent}index.js`
    if (!fs.existsSync(indexJSpath)) {
      fs.mkdirSync(indexJSparent) // 存不存在一把撸 创建src
      writeFile(indexJSpath, 'export {}').then(() => {
        console.log('完成创建 index.js')
        CLIEngine.outputFixes(cli.executeOnFiles([indexJSpath]))
      })
    }
  } catch (err) {
    console.error(err)
  }
}

const createExample = function(packageName, publishNamespace) {
  // 这里可以把尾缀的-vue去掉了
  const packageNameByCamelCase = packageName
    .replace(/-vue$/, '')
    .replace(/-(.)/g, (s, m) => {
      return m.toUpperCase()
    })
  try {
    const dir = path.resolve(__dirname, `../examples/${packageName}/`)
    const publishPackageName = `@${publishNamespace}/${packageName}`
    // 创建文件夹
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
      console.log(`完成创建 examples/${packageName}文件夹`)
    }
    if (!fs.existsSync(`${dir}/index.vue`)) {
      const tmpl = fs.readFileSync(`${tmplPath}/example/index.tmpl`).toString()
      const fileText = _.template(tmpl)({
        packageName,
        packageNameByCamelCase,
        publishPackageName
      })
      return writeFile(`${dir}/index.vue`, fileText).then(() => {
        console.log(`完成创建 examples/${packageName}/index.vue文件`)
        CLIEngine.outputFixes(cli.executeOnFiles([`${dir}/index.vue`]))
      })
    }
  } catch (err) {
    console.error(err)
  }
}

// inquirer.prompt(questions).then(answers => {
//   console.log("answers", answers);

// });

async function main() {
  const packageName = process.argv[2]
  if (!checkBeforeCreate(packageName)) process.exit(1)
  // 选择publish namespace
  const questions = [
    {
      type: 'list',
      name: 'publishNamespace',
      message: `What's publish namespace in HuYou-NPM for this new package[${packageName}]?`,
      choices: ['namespace'],
      filter: function(val) {
        return val.replace(/\(.+/, '')
      }
    },

    {
      type: 'input',
      name: 'packageDesc',
      message: 'Enter a simple package description:',
      validate: function(value) {
        value = value.trim()
        const valid = value.length > 3
        return valid || 'Too short!'
      },
      default: packageName
    },
    {
      type: 'confirm',
      name: 'customVueConfig',
      message: `是否在 /packages/${packageName}/ 下定制build所需要的 vue.config.js \n- (No 会共用根目录下/vue.config.js，后续也可以手动追加) ?`,
      default: true
    }
  ]
  const answers = await inquirer.prompt(questions)
  const { publishNamespace, packageDesc, customVueConfig } = answers
  // 开始创建
  // 添加package
  packages.push({
    label: packageName,
    name: packageName,
    publishNamespace
  })
  Promise.all([
    updateConfig(configPath),
    createPackage({
      packageName,
      packageDesc,
      publishNamespace,
      customVueConfig
    }),
    createExample(packageName, publishNamespace)
  ]).finally(() => {
    console.log(`完成package创建 ${packageName}`)
  })
}

main()
