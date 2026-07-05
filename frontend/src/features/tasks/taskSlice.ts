import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  assignedEmployeeId: number;
  assignedEmployee?: { id: number; name: string; email: string; department: string };
  filePath: string | null;
  fileOriginalName: string | null;
  createdAt?: string;
}

interface TaskQuery {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

interface TaskState {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetch",
  async (query: TaskQuery, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/tasks", { params: query });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load tasks.");
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/tasks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create task.");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, formData }: { id: number; formData: FormData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/tasks/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update task.");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete task.");
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        state.total -= 1;
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected") && action.type.startsWith("tasks/"),
        (state, action: any) => {
          state.error = action.payload;
        }
      );
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
