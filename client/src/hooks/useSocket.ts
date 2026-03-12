'use client';

import { useEffect } from 'react';

import { socket } from '@/lib/socket';

export function useSocket() {
  useEffect(() => {
    socket.connect();

    const onTaskUpdated = (payload: unknown) => {
      console.log('taskUpdated', payload);
    };

    const onNewComment = (payload: unknown) => {
      console.log('newComment', payload);
    };

    const onFileUploaded = (payload: unknown) => {
      console.log('fileUploaded', payload);
    };

    socket.on('taskUpdated', onTaskUpdated);
    socket.on('newComment', onNewComment);
    socket.on('fileUploaded', onFileUploaded);

    return () => {
      socket.off('taskUpdated', onTaskUpdated);
      socket.off('newComment', onNewComment);
      socket.off('fileUploaded', onFileUploaded);
      socket.disconnect();
    };
  }, []);

  return socket;
}

