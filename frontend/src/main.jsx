import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from './router/index'
import { Toaster } from 'react-hot-toast'
import AuthContextProvider from './context-api/AuthContextProvider'
import ThemeContextProvider from './context-api/ThemeContextProvider'
import store from './store/store'
import {AppContextProvider} from './demo/AppContext'

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
    <Provider store={store}>
      <ThemeContextProvider>
        <AuthContextProvider>
         <AppContextProvider>
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
         </AppContextProvider>
        </AuthContextProvider>
      </ThemeContextProvider>
    </Provider>
  </QueryClientProvider>
)
