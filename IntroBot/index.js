const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("/options");
const sequelize = require("./db");
const UserModel = require("./models");
const token = "token_from_telegram";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

//-- game function
const startGame = async (chatId) => {
  await bot.sendMessage(chatId, "You can guess number between 0 to 9");
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Guess number", gameOptions);
};

//function start our application
const start = async () => {
  // ----  connection to DB -------
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log("Error with connection to DB");
  }
  //-------MyCommands---------------
  bot.setMyCommands([
    { command: "/start", description: "Welcome to the chat" },
    { command: "/info", description: "Get information about user" },
    { command: "/game", description: "Guess a number" },
  ]);
  //-----event listener ----------
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    try {
      //start
      if (text === "/start") {
        await UserModel.create({ chatId });
        await bot.sendSticker(chatId, "sticker.web");
        return bot.sendMessage(
          chatId,
          `Welcome to chat ${msg.from.first_name}`
        );
      }
      //----info
      if (text === "/info") {
        const user = await UserModel.findOne({ chatId });
        return bot.sendMessage(
          chatId,
          `From${msg.from.first_name} : ${msg.from.last_name}. You have ${user.right} rignt answers and wrong: ${user.wrong}`
        );
      }
      //-----game
      if (text === "/game") {
        //add startGame()
        return startGame(chatId);
      }
      return bot.sendMessage(chatId, "I don not understand this command");
    } catch (error) {
      return bot.sendMessage(chatId, "Error in DB operations");
    }
  });
  // ---callback fro   bot button functionality
  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data == "/again") {
      return startGame;
    }
    //get user from DB
    const user = await UserModel.findOne({ chatId });
    if (data == chats[chatId]) {
      user.right += 1;
      await bot.sendMessage(
        chatId,
        `Great! You choose the right number: ${data}`,
        againOptions
      );
    } else {
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `It was wrong number, bot guessed this: ${data}`,
        againOptions
      );
    }
    await user.save();
  });
}; //start

start();
