export const workflowRules = {
  employee: {
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["REVIEW"],
    REVIEW: [],
    COMPLETED: [],
  },

  admin: {
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["REVIEW", "TODO"],
    REVIEW: ["COMPLETED", "IN_PROGRESS"],
    COMPLETED: [],
  },
};
