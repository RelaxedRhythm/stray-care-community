import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive ? 'bg-paw-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/80'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout, isAdmin, isVolunteer, volunteerPending } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-paw-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-paw-500 text-lg text-white shadow-lg shadow-paw-500/25">
              🐾
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-paw-900 leading-tight">PawCircle</p>
              <p className="text-xs text-slate-500">Neighbors helping strays</p>
            </div>
          </Link>
          <nav className="hidden flex-wrap items-center gap-1 md:flex">
            <NavItem to="/cases">Cases</NavItem>
            <NavItem to="/map">Map</NavItem>
            <NavItem to="/ledger">Transparency</NavItem>
            <NavItem to="/community">Community fund</NavItem>
            {user && (
              <>
                <NavItem to="/wallet">Wallet</NavItem>
                {(isVolunteer || isAdmin) && <NavItem to="/volunteer">Volunteer</NavItem>}
                {isAdmin && <NavItem to="/admin">Admin</NavItem>}
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:inline"
                >
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-paw-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-paw-600/20 hover:bg-paw-700"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
        {volunteerPending && (
          <div className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
            Your volunteer application is pending review. Thank you for stepping up.
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-paw-100 bg-white/80 py-10 text-center text-sm text-slate-500">
        <p className="font-medium text-paw-800">Built for transparency and local compassion.</p>
        <p className="mt-1">Every rupee is tracked. Volunteers share updates so you can see the impact.</p>
      </footer>
    </div>
  );
}
