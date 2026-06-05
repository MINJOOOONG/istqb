import { NavLink } from 'react-router-dom';
import { getWrongIds } from '../utils/storage';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    const update = () => setWrongCount(getWrongIds().length);
    update();
    window.addEventListener('storage', update);
    // custom event for same-tab updates
    window.addEventListener('wrongUpdated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('wrongUpdated', update);
    };
  }, []);

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="nav-icon">📝</span>
        <span>문제</span>
      </NavLink>
      <NavLink to="/wrong" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="nav-icon">❌</span>
        <span>오답{wrongCount > 0 && <em className="badge">{wrongCount}</em>}</span>
      </NavLink>
      <NavLink to="/summary" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="nav-icon">📖</span>
        <span>요약</span>
      </NavLink>
      <NavLink to="/syllabus" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="nav-icon">📄</span>
        <span>실러버스</span>
      </NavLink>
    </nav>
  );
}
