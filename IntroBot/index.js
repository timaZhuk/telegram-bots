const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("/options");
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
const start = () => {
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    bot.setMyCommands([
      { command: "/start", description: "Welcome to the chat" },
      { command: "/info", description: "Get information about user" },
      { command: "/game", description: "Guess a number" },
    ]);

    if (text === "/start") {
      await bot.sendSticker(chatId, "sticker.web");
      return bot.sendMessage(chatId, `Welcome to chat ${msg.from.first_name}`);
    }
    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `From${msg.from.first_name} : ${msg.from.last_name}`
      );
    }

    if (text === "/game") {
      //add startGame()
      return startGame(chatId);
    }
    return bot.sendMessage(chatId, "I don not understand this command");
  });
  // ---callback fro   bot button functionality
  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data == "/again") {
      return startGame;
    }
    if (data === chats[chatId]) {
      return await bot.sendMessage(
        chatId,
        `Great! You choose the right number: ${data}`,
        againOptions
      );
    } else {
      return await bot.sendMessage(
        chatId,
        `It was wrong number, bot guessed this: ${data}`,
        againOptions
      );
    }
  });
}; //start

start();
