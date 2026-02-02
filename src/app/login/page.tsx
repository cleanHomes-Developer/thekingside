import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Player Access
          </p>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-white/60">
            Sign in to manage your tournaments and profile.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
