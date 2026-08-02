import { useEffect, useRef } from "react"
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User, Building2, Save } from "lucide-react"

export function SettingsPage() {
  const { data: profile, isLoading } = useGetProfile()
  const updateProfile = useUpdateProfile()
  const queryClient = useQueryClient()

  // Standard uncontrolled form setup relying on the backend for init
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account details and payout preferences.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : profile ? (
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-primary" /> Personal Information
              </CardTitle>
              <CardDescription>Update your personal and brand details.</CardDescription>
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
                    <label className="text-sm font-medium">Full Name</label>
                    <Input name="fullName" defaultValue={profile.fullName} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brand / Store Name</label>
                    <Input name="brandName" defaultValue={profile.brandName} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input type="email" name="email" defaultValue={profile.email} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input name="phone" defaultValue={profile.phone} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input name="city" defaultValue={profile.city} required />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border mt-6 p-6">
              <Button type="submit" form="personal-form" disabled={updateProfile.isPending} className="gap-2">
                {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
                <Save className="size-4" /> Save Personal Details
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" /> Payout Method (Bank)
              </CardTitle>
              <CardDescription>Where we send your margins.</CardDescription>
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
                    <label className="text-sm font-medium">Bank Name</label>
                    <Input name="bankName" defaultValue={profile.bankName || ""} placeholder="e.g. CIH Bank, Attijariwafa..." required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">RIB (Relevé d'Identité Bancaire)</label>
                    <Input name="ribNumber" defaultValue={profile.ribNumber || ""} placeholder="24-digit RIB number" className="font-mono" required />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border mt-6 p-6">
              <Button type="submit" form="bank-form" disabled={updateProfile.isPending} className="gap-2">
                {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
                <Save className="size-4" /> Save Bank Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
