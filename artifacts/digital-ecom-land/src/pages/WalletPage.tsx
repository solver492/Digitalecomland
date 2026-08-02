import { useState } from "react"
import { useGetWalletBalance, useListWithdrawals, useRequestWithdrawal, getGetWalletBalanceQueryKey, getListWithdrawalsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Wallet, Loader2, ArrowRightLeft, Building2, CheckCircle2, Clock } from "lucide-react"

export function WalletPage() {
  const { data: balance, isLoading: balanceLoading } = useGetWalletBalance()
  const { data: withdrawals, isLoading: withdrawalsLoading } = useListWithdrawals()
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const canWithdraw = balance ? balance.withdrawableBalance >= balance.minimumWithdrawal : false

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and request payouts.</p>
        </div>
        <Button 
          className="gap-2 shadow-[0_0_15px_rgba(229,169,60,0.2)]"
          size="lg"
          disabled={!canWithdraw || balanceLoading}
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          <Wallet className="size-5" /> Request Withdrawal
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="bg-card border-primary/20 shadow-lg relative overflow-hidden md:col-span-2">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Wallet className="size-32 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Withdrawable Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-4">
                <div className="text-5xl font-black text-primary tracking-tight">
                  {formatCurrency(balance?.withdrawableBalance || 0)}
                </div>
                {!canWithdraw && balance && (
                  <p className="text-sm text-muted-foreground">
                    Minimum withdrawal is {formatCurrency(balance.minimumWithdrawal)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {formatCurrency(balance?.pendingBalance || 0)}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Lifetime Earned</CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {formatCurrency(balance?.totalEarned || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Record of your past payouts</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : !withdrawals?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              No withdrawals requested yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div className="font-medium">{new Date(w.requestedAt).toLocaleDateString('en-GB')}</div>
                      {w.paidAt && (
                        <div className="text-xs text-muted-foreground mt-1">Paid: {new Date(w.paidAt).toLocaleDateString('en-GB')}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold tracking-tight">
                      {formatCurrency(w.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{w.bankName || "Unknown Bank"}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{w.ribNumber || "—"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {w.status === "PAYE" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 gap-1">
                          <CheckCircle2 className="size-3" /> Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 gap-1">
                          <Clock className="size-3" /> Processing
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <WithdrawDialog 
        open={isWithdrawModalOpen} 
        onOpenChange={setIsWithdrawModalOpen}
        maxAmount={balance?.withdrawableBalance || 0}
        onSuccess={() => {
          setIsWithdrawModalOpen(false)
          queryClient.invalidateQueries({ queryKey: getGetWalletBalanceQueryKey() })
          queryClient.invalidateQueries({ queryKey: getListWithdrawalsQueryKey() })
        }}
      />
    </div>
  )
}

function WithdrawDialog({ open, onOpenChange, maxAmount, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, maxAmount: number, onSuccess: () => void }) {
  const [amount, setAmount] = useState(maxAmount.toString())
  const requestWithdrawal = useRequestWithdrawal()

  // Auto-update amount if maxAmount changes and dialog isn't modified by user yet
  const [touched, setTouched] = useState(false)
  if (open && !touched && amount !== maxAmount.toString()) {
    setAmount(maxAmount.toString())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    requestWithdrawal.mutate({ data: { amount: parseInt(amount) } }, {
      onSuccess: () => {
        setTouched(false)
        onSuccess()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setTouched(false); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to withdraw to your configured bank account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount (DZD)</label>
              <Input 
                type="number" 
                required 
                min="100" 
                max={maxAmount} 
                value={amount} 
                onChange={e => {
                  setAmount(e.target.value)
                  setTouched(true)
                }}
                className="text-lg font-bold"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Minimum: 100 DZD</span>
                <span>Max: {formatCurrency(maxAmount)}</span>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg flex items-start gap-3 border border-border">
              <Building2 className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Funds will be sent to your bank account.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ensure your RIB is correctly configured in Settings. Processing takes 24-48 business hours.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={requestWithdrawal.isPending} className="gap-2">
              {requestWithdrawal.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirm Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
