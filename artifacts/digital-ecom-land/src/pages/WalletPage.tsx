import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetWalletBalance, useListWithdrawals, useRequestWithdrawal, getGetWalletBalanceQueryKey, getListWithdrawalsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Wallet, Loader2, Building2, CheckCircle2, Clock } from "lucide-react"

export function WalletPage() {
  const { t, i18n } = useTranslation()
  const { data: balance, isLoading: balanceLoading } = useGetWalletBalance()
  const { data: withdrawals, isLoading: withdrawalsLoading } = useListWithdrawals()
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const canWithdraw = balance ? balance.withdrawableBalance >= balance.minimumWithdrawal : false
  const locale = i18n.language === 'ar' ? 'ar-MA' : 'fr-MA'

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("wallet.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t("wallet.subtitle")}</p>
        </div>
        <Button
          className="gap-2 shadow-[0_0_15px_rgba(229,169,60,0.2)]"
          size="lg"
          disabled={!canWithdraw || balanceLoading}
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          <Wallet className="size-5" /> {t("wallet.requestWithdrawal")}
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="bg-card border-primary/20 shadow-lg relative overflow-hidden md:col-span-2">
          <div className="absolute top-0 end-0 p-6 sm:p-8 opacity-10 pointer-events-none">
            <Wallet className="size-24 sm:size-32 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm sm:text-base">{t("wallet.withdrawableBalance")}</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-3">
                <div className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
                  {formatCurrency(balance?.withdrawableBalance || 0)}
                </div>
                {!canWithdraw && balance && (
                  <p className="text-sm text-muted-foreground">
                    {t("wallet.minimumWithdrawal", { amount: formatCurrency(balance.minimumWithdrawal) })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <Card className="bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t("wallet.pendingEarnings")}</CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {formatCurrency(balance?.pendingBalance || 0)}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t("wallet.totalWithdrawn")}</CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {formatCurrency(balance?.totalEarned || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{t("wallet.withdrawalHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : !withdrawals?.length ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t("wallet.withdrawalHistory")} —
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>{t("common.currency")}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t("wallet.withdrawalForm.bankName")}</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{new Date(w.requestedAt).toLocaleDateString(locale)}</div>
                        {w.paidAt && (
                          <div className="text-xs text-muted-foreground mt-1">{new Date(w.paidAt).toLocaleDateString(locale)}</div>
                        )}
                      </TableCell>
                      <TableCell className="font-bold tracking-tight">
                        {formatCurrency(w.amount)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-muted-foreground shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{w.bankName || "—"}</div>
                            <div className="text-xs text-muted-foreground font-mono">{w.ribNumber || "—"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {w.status === "PAYE" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 gap-1 text-xs">
                            <CheckCircle2 className="size-3" /> {t("wallet.withdrawalStatus.PAYEE")}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 gap-1 text-xs">
                            <Clock className="size-3" /> {t("wallet.withdrawalStatus.EN_TRAITEMENT")}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
  const { t } = useTranslation()
  const [amount, setAmount] = useState(maxAmount.toString())
  const requestWithdrawal = useRequestWithdrawal()
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
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setTouched(false) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("wallet.withdrawalForm.title")}</DialogTitle>
          <DialogDescription>{t("wallet.subtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("wallet.withdrawalForm.amount")}</label>
              <Input
                type="number"
                required
                min="100"
                max={maxAmount}
                value={amount}
                onChange={e => { setAmount(e.target.value); setTouched(true) }}
                className="text-lg font-bold"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 100 DH</span>
                <span>Max: {formatCurrency(maxAmount)}</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-start gap-3 border border-border">
              <Building2 className="size-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t("wallet.withdrawalForm.bankName")} / RIB — traitement 24-48h ouvrables.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("wallet.withdrawalForm.cancel")}</Button>
            <Button type="submit" disabled={requestWithdrawal.isPending} className="gap-2">
              {requestWithdrawal.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("wallet.withdrawalForm.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
