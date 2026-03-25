'use client';

import { useEffect } from 'react';

import { socket } from '@/lib/socket';

export function useSocket() {
  useEffect(() => {
    // Connection is managed centrally by `ProtectedRoute` to avoid duplicate sockets.

    const onTaskUpdated = () => {};
    const onNewComment = () => {};
    const onFileUploaded = () => {};

    socket.on('taskUpdated', onTaskUpdated);
    socket.on('newComment', onNewComment);
    socket.on('fileUploaded', onFileUploaded);

    return () => {
      socket.off('taskUpdated', onTaskUpdated);
      socket.off('newComment', onNewComment);
      socket.off('fileUploaded', onFileUploaded);
      // Do not disconnect here; keep global socket alive for the app lifecycle.
    };
  }, []);

  return socket;
}
