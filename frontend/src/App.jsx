// import { useThemeStore } from "./store/useThemeStore";
// import { Toaster } from "react-hot-toast";
// import { Outlet } from 'react-router-dom';
// import Navbar from './components/Navbar';

// const App = () => {
//   const { theme } = useThemeStore();

//   return (
//       <div data-theme={theme}>
//         <Navbar />
//         <Outlet />
//         <Toaster />
//       </div>
//   );
// };

// export default App;

import { useThemeStore } from "./store/useThemeStore";
import { Toaster } from "react-hot-toast";
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CallProvider } from './components/CallProvider';
import  CallInterface  from './components/CallInterface';

const App = () => {
  const { theme } = useThemeStore();

  return (
      // <CallProvider>
        <div data-theme={theme}>
          <Navbar />
          <Outlet />
          <Toaster />
          {/* <CallInterface /> */}
        </div>
     //{/* </CallProvider>  */}
  );
};

export default App;
