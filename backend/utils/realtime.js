export const emitRealtime = (eventName, payload) => {
  if (!global.io) return;
  global.io.emit(eventName, payload);
  console.log("Realtime event emitted");
};
