import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  userId: number | null;
  createdAt?: string;
}

interface EmployeeQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

interface EmployeeState {
  employees: Employee[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  "employees/fetch",
  async (query: EmployeeQuery, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/employees", { params: query });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load employees.");
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/create",
  async (payload: Partial<Employee> & { createLogin?: boolean; password?: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/employees", payload);
      return res.data.employee;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create employee.");
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/update",
  async ({ id, ...payload }: Partial<Employee> & { id: number }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/employees/${id}`, payload);
      return res.data.employee;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update employee.");
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employees/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/employees/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete employee.");
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.employees.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.employees[idx] = action.payload;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((e) => e.id !== action.payload);
        state.total -= 1;
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected") && action.type.startsWith("employees/"),
        (state, action: any) => {
          state.error = action.payload;
        }
      );
  },
});

export const { clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;
