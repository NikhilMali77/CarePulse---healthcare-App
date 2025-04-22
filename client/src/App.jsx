import { BrowserRouter as Router } from 'react-router-dom';
import { RoleProvider } from './RoleContext'; // Import RoleProvider
import HomePageContent from './Components/HomePageContent/HomePageContent';// Import the new HomePageContent component

function App() {
  return (
    <Router>
      <RoleProvider>
        <HomePageContent />
      </RoleProvider>
    </Router>
  );
}

export default App;
