import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl font-semibold">Welcome, {user?.firstName || user?.email}</h1>
        <p className="mt-2 text-muted-foreground">You are signed in.</p>
      </div>
    </Layout>
  );
}
