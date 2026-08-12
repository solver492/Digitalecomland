import { useTranslation } from "react-i18next"
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User, Building2, Save } from "lucide-react"

export function SettingsPage() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useGetProfile()
  const updateProfile = useUpdateProfile()
  const queryClient = useQueryClient()

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t("settings.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Personal Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="size-5 text-primary" /> {t("settings.personalInfo")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t("settings.personalInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="personal-form"
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  updateProfile.mutate({
                    data: {
                      fullName: formData.get("fullName") as string,
                      phone: formData.get("phone") as string,
                      email: formData.get("email") as string,
                      brandName: formData.get("brandName") as string,
                      city: formData.get("city") as string,
                    }
                  }, {
                    onSuccess: (data) => {
                      queryClient.setQueryData(getGetProfileQueryKey(), data)
                    }
                  })
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("settings.fullName")}</label>
                    <Input name="fullName" defaultValue={profile.fullName} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("settings.brandName")}</label>
                    <Input name="brandName" defaultValue={profile.brandName} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("settings.email")}</label>
                    <Input type="email" name="email" defaultValue={profile.email} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("settings.phone")}</label>
                    <Input name="phone" defaultValue={profile.phone} required placeholder="05 XX XX XX XX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("settings.city")}</label>
                    <Input name="city" defaultValue={profile.city} required placeholder="Casablanca, Rabat, Fès, Marrakech..." />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border mt-4 sm:mt-6 p-4 sm:p-6">
              <Button type="submit" form="personal-form" disabled={updateProfile.isPending} className="gap-2">
                {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
                <Save className="size-4" /> {t("settings.saveChanges")}
              </Button>
            </CardFooter>
          </Card>

          {/* Payment Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Building2 className="size-5 text-primary" /> {t("settings.paymentInfo")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t("settings.paymentInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="bank-form"
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  updateProfile.mutate({
                    data: {
                      bankName: formData.get("bankName") as string,
                      ribNumber: formData.get("ribNumber") as string,
                    }
                  }, {
                    onSuccess: (data) => {
                      queryClient.setQueryData(getGetProfileQueryKey(), data)
                    }
                  })
                }}
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("settings.bankName")}</label>
                    <Input name="bankName" defaultValue={profile.bankName || ""} placeholder="ex. CIH Bank, Banque Populaire, Attijariwafa..." required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("settings.ribNumber")}</label>
                    <Input name="ribNumber" defaultValue={profile.ribNumber || ""} placeholder="20-digit RIB number" className="font-mono" required />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border mt-4 sm:mt-6 p-4 sm:p-6">
              <Button type="submit" form="bank-form" disabled={updateProfile.isPending} className="gap-2">
                {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
                <Save className="size-4" /> {t("settings.saveChanges")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
