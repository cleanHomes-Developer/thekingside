import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Create account
          </p>
          <h1 className="text-3xl font-semibold">Join The King Side</h1>
          <p className="text-white/60">
            Register to enter tournaments and track your standing.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
