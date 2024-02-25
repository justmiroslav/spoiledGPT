function sortChats(chats) {
    let groupedChats = {
        'Today': [],
        'This week': [],
        'This month': [],
        'This year': [],
        'Long time ago': []
    };

    const day = 24 * 60 * 60 * 1000;

    chats.forEach(chat => {
        let diff = Date.now() - chat.date;
        if (diff < day) {
            groupedChats['Today'].push(chat);
        } else if (day <= diff < 7 * day) {
            groupedChats['This week'].push(chat);
        } else if (7 * day <= diff < 30 * day) {
            groupedChats['This month'].push(chat);
        } else if (30 * day <= diff < 365 * day) {
            groupedChats['This year'].push(chat);
        } else {
            groupedChats['Long time ago'].push(chat);
        }
    });

    return groupedChats;
}

module.exports = sortChats;