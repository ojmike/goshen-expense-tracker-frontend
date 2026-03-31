import { useCallback, useState, useRef, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2, Building2, RefreshCw, Trash2, Plus, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { plaidService } from '@/services/plaidService';
import { useLinkedAccounts, useExchangeToken, useUnlinkAccount, useSyncTransactions } from '@/hooks/usePlaid';

function PlaidLinkButton({ onSuccess }: { onSuccess: (publicToken: string, metadata: { institution?: { name?: string } | null }) => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const token = await plaidService.createLinkToken();
      setLinkToken(token);
    } catch {
      setLoading(false);
    }
  };

  return linkToken ? (
    <PlaidLinkOpener linkToken={linkToken} onSuccess={onSuccess} onExit={() => { setLinkToken(null); setLoading(false); }} />
  ) : (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
      Link Bank Account
    </Button>
  );
}

function PlaidLinkOpener({
  linkToken,
  onSuccess,
  onExit,
}: {
  linkToken: string;
  onSuccess: (publicToken: string, metadata: { institution?: { name?: string } | null }) => void;
  onExit: () => void;
}) {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      onSuccess(publicToken, metadata);
      onExit();
    },
    onExit: () => onExit(),
  });

  const openedRef = useRef(false);

  // Auto-open when ready — only once
  useEffect(() => {
    if (ready && !openedRef.current) {
      openedRef.current = true;
      open();
    }
  }, [ready, open]);

  return (
    <Button disabled>
      <Loader2 className="size-4 animate-spin" />
      Connecting...
    </Button>
  );
}

export default function BankAccounts() {
  const { data: accounts, isLoading } = useLinkedAccounts();
  const exchangeToken = useExchangeToken();
  const unlinkAccount = useUnlinkAccount();
  const syncTransactions = useSyncTransactions();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handlePlaidSuccess = useCallback(
    async (publicToken: string, metadata: { institution?: { name?: string } | null }) => {
      await exchangeToken.mutateAsync({
        publicToken,
        institutionName: metadata.institution?.name ?? undefined,
      });
    },
    [exchangeToken],
  );

  const handleSync = async (id: number) => {
    setSyncingId(id);
    try {
      const result = await syncTransactions.mutateAsync(id);
      alert(`Synced ${result.synced} transactions`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleUnlink = async (id: number) => {
    if (confirm('Unlink this account? All synced transactions from it will be removed.')) {
      await unlinkAccount.mutateAsync(id);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Bank Accounts</h1>
          <PlaidLinkButton onSuccess={handlePlaidSuccess} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {account.institutionName ?? 'Bank Account'}
                        {account.accountMask && <span className="text-muted-foreground"> ••••{account.accountMask}</span>}
                      </p>
                      {account.accountName && (
                        <p className="text-xs text-muted-foreground">{account.accountName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(account.id)}
                      disabled={syncingId === account.id}
                    >
                      {syncingId === account.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      Sync
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleUnlink(account.id)}
                      aria-label="Unlink account"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <Landmark className="mb-4 size-10 text-muted-foreground" />
            <h3 className="text-base font-medium">No linked accounts</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Link a bank account to automatically import and categorize your transactions.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
