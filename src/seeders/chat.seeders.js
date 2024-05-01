import Chat from "../models/chat.models.js";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";
import {faker, simpleFaker }from "@faker-js/faker";

export const createSingleFakeChat = async()=>{
    try {
        const users = await User.find().select("_id");
        let chatPromise = [];

            for(let i=0;i<users.length;i++){
                for(let j=i+1;j<users.length;j++){
                    chatPromise.push(Chat.create({
                        name:faker.lorem.words(2),
                        members:[users[i],users[j]]
                    }))
                }
        }

        await Promise.all(chatPromise);
        console.log("Single Chats created successfully");
        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};


export const createGroupFakeChat = async(numChat)=>{
    try {
        const users = await User.find().select("_id");
        let chatPromise = [];

        for(let i=0;i<numChat;i++){
            const numMembers = simpleFaker.number.int({min:3,max:users.length});
            let members = [];

            for(let j=0;j<numMembers;j++){
                const randomIndex = Math.floor(Math.random() * users.length);
                const randomUser = users[randomIndex];

                if(!members.includes(randomUser))
                    members.push(randomUser);
            }

            const chat = Chat.create({
                isGroupChat:true,name:faker.lorem.words(1),members,creator:members[0]
            });

            chatPromise.push(chat);
        }

        await Promise.all(chatPromise);
        console.log("Group Chat created successfully");
        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};


export  const createMessages = async (numMessages) => {
  try {
    const users = await User.find().select("_id");
    const chats = await Chat.find().select("_id");

    const messagesPromise = [];

    for (let i = 0; i < numMessages; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomChat = chats[Math.floor(Math.random() * chats.length)];

      messagesPromise.push(
        Message.create({
          chat: randomChat,
          sender: randomUser,
          content: faker.lorem.sentence(),
        })
      );
    }

    await Promise.all(messagesPromise);

    console.log("Messages created successfully");
    process.exit();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export const createMessagesInAChat = async (chatId, numMessages) => {
  try {
    const users = await User.find().select("_id");

    const messagesPromise = [];

    for (let i = 0; i < numMessages; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      messagesPromise.push(
        Message.create({
          chat: chatId,
          sender: randomUser,
          content: faker.lorem.sentence(),
        })
      );
    }

    await Promise.all(messagesPromise);

    console.log("Messages created successfully");
    process.exit();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};