export const emitRealtime = (eventName, payload, room) => {
  if (!global.io) return;
  if (room) {
    global.io.to(room).emit(eventName, payload);
  } else {
    global.io.emit(eventName, payload);
  }
};
