// Stub Prisma client for build time
module.exports = {
  TaskStatus: {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    NEEDS_HELP: 'NEEDS_HELP',
    NEEDS_REVIEW: 'NEEDS_REVIEW',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
  },
  TaskPriority: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
  Role: {
    USER: 'USER',
    ASSISTANT: 'ASSISTANT',
  },
  TaskType: {
    IMMEDIATE: 'IMMEDIATE',
    SCHEDULED: 'SCHEDULED',
  },
  Prisma: {
    InputJsonValue: Object,
    TaskWhereInput: Object,
  },
};
