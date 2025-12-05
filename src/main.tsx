import { createRoot } from 'react-dom/client';
import './main.css';
import './i18n';
import App from './ui/App.tsx';

createRoot(document.getElementById('root')!).render(<App />);
