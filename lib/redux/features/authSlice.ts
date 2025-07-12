import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type User = {
  id: string;
  email: string;
  // add other user properties
};

type AuthState = {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User }>) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.loading = false
    },
    clearAuth: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setAuth, clearAuth, setLoading } = authSlice.actions
export default authSlice.reducer 