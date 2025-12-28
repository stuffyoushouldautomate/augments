// Stub types for Prisma client during build time
// These will be replaced by the actual Prisma client at runtime

export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  NEEDS_HELP = 'NEEDS_HELP',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum Role {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export enum TaskType {
  IMMEDIATE = 'IMMEDIATE',
  SCHEDULED = 'SCHEDULED',
}

export interface Task {
  id: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  control: Role;
  createdAt: Date;
  createdBy: Role;
  scheduledFor?: Date;
  updatedAt: Date;
  executedAt?: Date;
  completedAt?: Date;
  queuedAt?: Date;
  error?: string;
  result?: any;
  model: any;
}

export interface Message {
  id: string;
  content: any;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  summaryId?: string;
}

export interface Summary {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  parentId?: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
}

export namespace Prisma {
  export type InputJsonValue = any;
  export type TaskWhereInput = any;
}
