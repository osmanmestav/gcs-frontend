export class UserStatusTopicMessage {
    constructor(userCode: string) {
        this.userCode = userCode;
    };

    userCode: string;
    listOfObservingAircrafts: string[] = [];
    listOfControllingAircrafts: string[] = [];
};