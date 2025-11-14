import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import AuthContextProvider from './context-api/AuthContextProvider'
import ThemeContextProvider from './context-api/ThemeContextProvider'
import Router from './router'
import store from './store/store'
import './index.css'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0
    }
  }
})

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
    <ThemeContextProvider>
      <AuthContextProvider>
        <Provider store={store}>
          <Router />
          <Toaster position="top-center" toastOptions={{
            duration: 3000,
            removeDelay: 1000,
            style: {
              textAlign: 'center',
              background: "#ffffff",
              color: "#333",
              padding: "12px",
              borderRadius: "8px",
            },
          }} />
        </Provider>
      </AuthContextProvider>
    </ThemeContextProvider>
  </QueryClientProvider>
)
