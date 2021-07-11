import * as inquirer from "inquirer";
import * as fs from "fs";
import { ncp } from "ncp";

const copy = (source: string, destination: string) =>
  new Promise((resolve, reject) =>
    ncp(source, destination, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    })
  );

const templateFolder = `${__dirname}/../templates`;
const frontendChoices = fs.readdirSync(`${templateFolder}/frontend`);
const backendChoices = fs.readdirSync(`${templateFolder}/backend`);
const extraChoices = fs.readdirSync(`${templateFolder}/extras`);

const QUESTIONS = [
  {
    name: "frontendChoice",
    type: "list",
    message: "What frontend would you like to generate?",
    choices: frontendChoices,
  },
  {
    name: "backendChoice",
    type: "list",
    message: "What backend would you like to generate?",
    choices: backendChoices,
  },
  {
    name: "extraChoice",
    type: "checkbox",
    message: "Any extra packages?",
    choices: extraChoices,
  },
  {
    name: "projectName",
    type: "input",
    message: "Project name:",
    validate: (input: string) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and hashes.";
    },
  },
];

const extraNameMapping = {
  docz: "ui",
};

const CURR_DIR = process.cwd();

inquirer
  .prompt(QUESTIONS)
  .then(async ({ frontendChoice, extraChoice, backendChoice, projectName }) => {
    const rootDest = `${CURR_DIR}/${projectName}`;
    fs.mkdirSync(rootDest);

    await copy(`${templateFolder}/root`, rootDest);

    const destination = `${rootDest}/packages`;
    fs.mkdirSync(destination);

    const serverDestination = `${destination}/server`;
    const webDestination = `${destination}/web`;

    await copy(`${templateFolder}/backend/${backendChoice}`, serverDestination);
    await copy(`${templateFolder}/frontend/${frontendChoice}`, webDestination);

    await Promise.all(
      extraChoice.map((extra: keyof typeof extraNameMapping) => {
        const dest = `${destination}/${extraNameMapping[extra]}`;

        copy(`${templateFolder}/extras/${extra}`, dest);
      })
    );
  });
