import User from "../models/user.models.js";
import {faker }from "@faker-js/faker";

export const createFakeUser = async(numUser)=>{
    try {
        const userPromise = [];
        for(let i=0;i<numUser;i++){
            const tempUser = await User.create({
                fullName:faker.person.fullName(),
                username:faker.internet.userName(),
                bio:faker.lorem.sentence(10),
                password:"123",
                avatar:{
                    public_id:faker.system.fileName(),
                    url:faker.image.avatar()     
                }
            });
            userPromise.push(tempUser); 
        }
        await Promise.all(userPromise);
        console.log("user created");
        process.exit(1);
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}