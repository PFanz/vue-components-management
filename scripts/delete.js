const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");
const configPath = path.resolve(__dirname, "../src/components.js");
const eslint = require("eslint");
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);
const CLIEngine = eslint.CLIEngine;
const cli = new CLIEngine({ ...require("../.eslintrc.js"), fix: true });

let packages = require(configPath);

// process.on("exit", () => {
//   console.log();
// });

/**
 * 删除前检测
 */
const checkBeforeDelete = function(pkgName) {
  if (!pkgName || /[^a-z0-9-]/.test(pkgName)) {
    console.error("请检查要删除的package name (kebab-case)");
    return false;
  }

  if (!Array.isArray(packages)) {
    console.error("src/components.js文件已被破坏，请恢复数组结构！");
    return false;
  }
  // 判断package名是否存在
  if (packages.filter(component => component.name === pkgName).length == 0) {
    console.error(`package [${pkgName}]不存在`);
    return false;
  }
  return true;
};

const updateConfig = function(path) {
  writeFile(path, `module.exports = ${JSON.stringify(packages)}`).then(() => {
    console.log("完成更新 components.js");
    // 格式化
    CLIEngine.outputFixes(cli.executeOnFiles([configPath]));
  });
};

const removePackage = function(packageName) {
  try {
    const dir = path.resolve(__dirname, `../packages/${packageName}/`);
    // 移除文件夹
    if (fs.existsSync(dir)) {
      childProcess.spawnSync("rm", ["-r", `packages/${packageName}`]);
      console.log(`完成移除 packages/${packageName}文件夹`);
    }
  } catch (err) {
    console.error(err);
  }
};

const removeExample = function(packageName) {
  try {
    const dir = path.resolve(__dirname, `../examples/${packageName}/`);
    // 移除文件夹
    if (fs.existsSync(dir)) {
      childProcess.spawnSync("rm", ["-r", `examples/${packageName}`]);
      console.log(`完成移除 examples/${packageName}文件夹`);
    }
  } catch (err) {
    console.error(err);
  }
};

// inquirer.prompt(questions).then(answers => {
//   console.log("answers", answers);

// });

async function main() {
  const pkgName = process.argv[2];

  if (!checkBeforeDelete(pkgName)) process.exit(1);
  const questions = [
    {
      type: "confirm",
      name: "trueDelete",
      message: `Are you sure to delete the '${pkgName}' package?`,
      default: true,
      validate: function(value) {
        if (value == false) {
          process.exit(0);
          // return `It’s different with '${pkgName}',please check!`;
        }
        return true;
      }
    },
    {
      type: "input",
      name: "pkgName2",
      message: "It's dangerous! Please enter the package name again.",
      validate: function(value) {
        if (value !== pkgName) {
          return `It’s different with '${pkgName}',please check!`;
        }
        return true;
      },
      when: function(answers) {
        return answers.trueDelete === true;
      }
    }
  ];

  const answers = await inquirer.prompt(questions);
  // console.log("answers", answers);
  if (!answers.trueDelete) process.exit(1);

  // 开始创建
  // components中移除
  packages.splice(packages.findIndex(item => item.name === pkgName), 1);
  Promise.all([
    updateConfig(configPath),
    removePackage(pkgName),
    removeExample(pkgName)
  ]).finally(() => {
    console.log(`完成删除package ${pkgName}`);
  });
}

main();
