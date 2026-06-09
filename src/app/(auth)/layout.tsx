import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen" style={{ background: "var(--brand-bg)" }}>
      {children}
    </div>
  );
};

export default AuthLayout;
