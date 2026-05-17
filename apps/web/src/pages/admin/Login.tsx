import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Form = z.infer<typeof schema>;

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Form) {
    setLoading(true);
    try {
      const res = await api.post<{ token: string }>("/api/auth/login", data);
      sessionStorage.setItem("paymap_token", res.data.token);
      navigate("/admin/cities");
    } catch {
      toast({ variant: "destructive", title: t("error.loginFailed") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center dot-grid px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-serif">
            pay<span className="text-accent-blue">map</span>
            <span className="text-white/40 font-sans text-sm font-normal ml-2">
              {t("admin.login")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("admin.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="border-white/10 bg-white/5"
              />
              {errors.email && (
                <p className="text-xs text-negative">{t("error.required")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("admin.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="border-white/10 bg-white/5"
              />
              {errors.password && (
                <p className="text-xs text-negative">{t("error.required")}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("loading") : t("admin.loginButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
