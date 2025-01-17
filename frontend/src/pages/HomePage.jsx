import { Outlet, useParams } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";

const HomePage = () => {
  const { chatId } = useParams();
  const { selectedChat } = useChatStore();

  return (
    <div className="h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="bg-base-100 w-full h-full max-w-6xl shadow-cl rounded-lg overflow-hidden flex">
        <div className={`mt-12
          ${chatId ? 'hidden sm:block' : 'w-full'}
          sm:w-[40%] md:w-[35%] lg:w-[30%]
          border-r border-base-300
        `}>
          <Sidebar />
        </div>

        <div className="flex-1 flex mt-12">
          {!chatId ? (
            <div className="hidden sm:flex flex-1">
              <NoChatSelected />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

