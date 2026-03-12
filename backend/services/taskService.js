import Task from "../models/Task.js";

export const createTaskService = async (data) => {

  const task = await Task.create(data);

  return task;

};

export const getTasksService = async (query) => {

  const tasks = await Task.find(query);

  return tasks;

};

