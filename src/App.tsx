import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/Home.page';
import AutoPage from './pages/Auto.page';
import { Container } from '@mui/material';

function App() {

  return (
    <Container maxWidth="xl">
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/translate" element={<HomePage />} />
            <Route path="/translate/auto" element={<AutoPage />} />
        </Routes>
    </Container>
  );
}

export default App;
