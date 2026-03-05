export class ChatService {
  static formatTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  static createMessage(username, avatar, room, message, image = null) {
    return {
      room,
      username,
      avatar,
      message,
      image,
      time: this.formatTime()
    };
  }

  static handlePasteImage(event, callback) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.includes('image')) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(blob);
      }
    }
  }
}