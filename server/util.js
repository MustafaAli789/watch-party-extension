User = (userId, userName, roomId) => {
    this.userId = userId;
    this.userName = userName;
    this.roomId = roomId;
}   

Room = (roomId, roomName) => {
    this.roomId = roomId;
    this.roomName = roomName
    this.users = []

    addUser = (user) => {
        this.users.push(user)
    }
    removeUser = (userId) => {
        let userToDel;
        let indToDel = this.users.map(user => user.userId).find(id => id == userId)
        if (ind != null && ind != undefined) {
            userToDel = this.users[indToDel]
            this.users.splice(indToDel, 1)
            return userToDel
        } else {
            return null
        }
    }
}

const rooms = []

const addRoom = (roomId, roomName) => {
    rooms.push(new Room(roomId, roomName))
}

const addUserToRoom = (userId, userName, roomId) => {
    userName = userName.trim().toLowerCase();

    const existingRoom = rooms.find(room => room.roomId == roomId)

    if (!existingRoom) {
        return {error:  `Room with id ${roomId} does not exist.`}
    }

    const user = new User(userId, userName, roomId)
    rooms.find(room => room.roomId == roomId).addUser(user)

    return { user }
}

const removeUser = (userId) => {
    let deletedUser
    for (let i =0; i<rooms.length; i++) {
        deletedUser = rooms[i].removeUser(userId)
        if(deletedUser != null) {

            //special check to see if room empty i.e last person in room left
            if (rooms[i].users.length == 0) {
                rooms.splice(i, 1)
            }

            return { deletedUser }
        }
    }

    return {error: `User with id ${userId} does not exist`}
}

const getUsersInRoom = (roomId) => {
    rooms.forEach(room => {
        if (room.roomId == roomId) {
            return room.users
        }
    })
}

module.exports={ addRoom, removeUser, addUserToRoom, getUsersInRoom }