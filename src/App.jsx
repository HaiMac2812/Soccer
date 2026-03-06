import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MatchDetail from './components/MatchDetail/MatchDetail';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global retry config
      retry: 2,
      retryDelay: (n) => Math.min(1000 * 2 ** n, 10_000),
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-root">
        <Header />
        <div className="app-body">
          <Sidebar />
          <main className="app-main">
            <MatchDetail />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
