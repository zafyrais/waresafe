// Navbar.tsx
import "../../styles/navbar.css";

interface NavbarProps {
  dayString: string;
  timeString: string;
}

export default function Navbar({
  dayString,
  timeString,
}: NavbarProps) {
  return (
    <div className="navbar-container">
      <div></div>

      <div className="navbar-time">
        {dayString}, {timeString}
      </div>

      <div className="navbar-profile">
        👤
      </div>
    </div>
  );
}