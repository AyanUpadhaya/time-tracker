import { LogOutIcon, MailIcon, Clock1Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EmailSender from "@/components/EmailSender";
import { Link, Outlet } from "react-router-dom";
import { signOut } from "@/services/authService";

const DashboardLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-900  py-4 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container flex max-w-screen-2xl mx-auto items-center ">
          <div className=" flex justify-between w-full px-4 ">
            <Link className="mr-6 flex items-center space-x-2" to="/">
              <h1 className="text-xl font-bold text-white">
                ⏱ Productivity Tracker
              </h1>
            </Link>

            <div className="flex gap-3 items-center">
              <Button
                onClick={() => signOut()}
                variant="destructive"
                className="flex gap-2"
              >
                <LogOutIcon className="w-4 h-4 text-white"></LogOutIcon>
                <span>Logout</span>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MailIcon className="w-4 h-4"></MailIcon>
                    <span>Send Email</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Send Email</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to send an email.
                    </DialogDescription>
                  </DialogHeader>
                  <EmailSender />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {/* left sidebar */}
        <aside className="hidden md:block w-64 bg-gray-800  border-r">
          <div className="h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4">
            <nav className="space-y-1 text-sm">
              <Link
                className="block px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-400 flex gap-3 items-center"
                to={"/"}
              >
                <span>
                  <Clock1Icon className="w-5 h-5"></Clock1Icon>
                </span>
                <span>Timer</span>
              </Link>
              <Link
                className="block px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-400 flex gap-3 items-center"
                to={"/stopwatch"}
              >
                <span>
                  <Clock1Icon className="w-5 h-5"></Clock1Icon>
                </span>
                <span>Stopwatch</span>
              </Link>
              <Link
                className="block px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-400 flex gap-3 items-center"
                to={"/sessions"}
              >
                <span>
                  <Clock1Icon className="w-5 h-5"></Clock1Icon>
                </span>
                <span>Timesheet</span>
              </Link>
            </nav>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 bg-gray-600">
          <Outlet></Outlet>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
