
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './webpages/home/home';
import Category from './webpages/thirdscreen/category'


function App() {
  return (
    <Router>
        <Routes>
          <Route path='/' element={<Home/>}  />
          <Route path='/category' element={<Category/>} />
</Routes>
</Router>
  );
}

export default App;
