import inquirer from 'inquirer';
import Jimp from 'jimp';
import { existsSync } from 'node:fs';

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
    console.log('Success!');
    startApp();
  } catch (error) {
    console.log('Something went wrong... Try again!');
  }
};

const addImageWatermarkToImage = async function (
  inputFile,
  outputFile,
  watermarkFile
) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
    console.log('Success!');
    startApp();
  } catch (error) {
    console.log('Something went wrong... Try again!');
  }
};

/* left this for future testing */

// const changeImageBrightness = async function (inputFile, outputFile, value) {
//   try {
//     const image = await Jimp.read(inputFile);
//     image.brightness(value);
//     // await image.brightness(value).quality(100).writeAsync(outputFile);
//     await image.quality(100).writeAsync(outputFile);
//   } catch (error) {
//     console.log('Something went wrong... Try again TEST!');
//   }
// };

const prepareOutputFileName = (fileName) => {
  const nameSplit = fileName.split('.');
  return nameSplit[0] + '-with-watermark.' + nameSplit[1];
};

const startApp = async () => {
  // Ask if user is ready
  const answer = await inquirer.prompt([
    {
      name: 'start',
      message:
        'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm',
    },
  ]);

  // if answer is no, just quit the app
  if (!answer.start) process.exit();

  // ask about input file and watermark type
  const options = await inquirer.prompt([
    {
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg',
    },
    // {
    //   name: 'moreOptions',
    //   message: 'Would you like to check more options?',
    //   type: 'confirm',
    // },
    {
      name: 'watermarkType',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    },
  ]);
  if (!existsSync(`./img/${options.inputImage}`)) {
    console.log('Something went wrong. Please try again.');
    process.exit();
  }

  /* left this for future testing */

  // more options
  // if (options.moreOptions) {
  //   const otherOptions = await inquirer.prompt([
  //     {
  //       name: 'settings',
  //       type: 'list',
  //       choices: ['Brightness', 'Contrast', 'Black & White', 'Invert'],
  //     },
  //   ]);

  //   // brightness
  //   if (otherOptions.settings === 'Brightness') {
  //     const brightnessValue = await inquirer.prompt([
  //       {
  //         name: 'brightValue',
  //         type: 'input',
  //         message: 'Please choose value between -1 to 1:',
  //       },
  //     ]);
  //     const value = brightnessValue.value;

  //     changeImageBrightness('./img/' + options.inputImage, value);
  //   }
  // }

  // watermarks
  if (options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([
      {
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
      },
    ]);
    options.watermarkText = text.value;
    addTextWatermarkToImage(
      './img/' + options.inputImage,
      './img/' + prepareOutputFileName(options.inputImage),
      options.watermarkText
    );
  } else {
    const image = await inquirer.prompt([
      {
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: 'logo.png',
      },
    ]);
    options.watermarkImage = image.filename;

    if (!existsSync(`./img/${options.watermarkImage}`)) {
      console.log('Something went wrong. Please try again.');
      process.exit();
    }
    addImageWatermarkToImage(
      './img/' + options.inputImage,
      './img/' + prepareOutputFileName(options.inputImage),
      './img/' + options.watermarkImage
    );
  }
};

startApp();
