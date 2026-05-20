import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/api/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Save, AlertTriangle, LogOut } from "lucide-react";

interface TaxConfig {
  id: string;
  countrySlug: string;
  label: string;
  brackets: unknown;
  social: unknown;
  updatedAt: string;
}

export default function AdminTax() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<TaxConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { brackets: string; social: string }>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  async function loadConfigs() {
    try {
      const { data } = await api.get<TaxConfig[]>("/api/admin/tax-configs");
      setConfigs(data);
      const initial: Record<string, { brackets: string; social: string }> = {};
      for (const c of data) {
        initial[c.countrySlug] = {
          brackets: JSON.stringify(c.brackets, null, 2),
          social: JSON.stringify(c.social, null, 2),
        };
      }
      setDrafts(initial);
    } catch {
      toast({ variant: "destructive", title: t("error.apiUnavailable") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadConfigs(); }, []);

  function updateDraft(countrySlug: string, field: "brackets" | "social", value: string) {
    setDrafts((prev) => ({ ...prev, [countrySlug]: { ...prev[countrySlug], [field]: value } }));
    const key = `${countrySlug}.${field}`;
    try {
      JSON.parse(value);
      setJsonErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    } catch {
      setJsonErrors((prev) => ({ ...prev, [key]: t("error.invalidJson") }));
    }
  }

  async function save(config: TaxConfig) {
    const draft = drafts[config.countrySlug];
    if (!draft) return;

    const bKey = `${config.countrySlug}.brackets`;
    const sKey = `${config.countrySlug}.social`;
    if (jsonErrors[bKey] || jsonErrors[sKey]) {
      toast({ variant: "destructive", title: t("error.invalidJson") });
      return;
    }

    let brackets: unknown;
    let social: unknown;
    try {
      brackets = JSON.parse(draft.brackets);
      social = JSON.parse(draft.social);
    } catch {
      toast({ variant: "destructive", title: t("error.invalidJson") });
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/admin/tax-configs/${config.countrySlug}`, { brackets, social });
      toast({ title: t("admin.save") + " ✓" });
      loadConfigs();
    } catch {
      toast({ variant: "destructive", title: t("error.apiUnavailable") });
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("paymap_token");
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">{t("admin.tax")}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/cities")}
              className="border-white/10 text-white/60 hover:text-white text-xs">
              {t("admin.cities")}
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-white/40 text-xs">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              {t("admin.logout")}
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-md border border-yellow-500/20 bg-yellow-500/05 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-200/70">{t("admin.taxSaveWarning")}</p>
        </div>

        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <Tabs defaultValue={configs[0]?.countrySlug ?? "de"}>
            <TabsList className="bg-white/05 mb-4">
              {configs.map((c) => (
                <TabsTrigger key={c.countrySlug} value={c.countrySlug} className="text-xs">
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {configs.map((config) => {
              const draft = drafts[config.countrySlug];
              const bErr = jsonErrors[`${config.countrySlug}.brackets`];
              const sErr = jsonErrors[`${config.countrySlug}.social`];

              return (
                <TabsContent key={config.countrySlug} value={config.countrySlug} className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-white/80 flex items-center justify-between">
                        <span>{t("admin.taxBrackets")}</span>
                        {bErr && <Badge variant="destructive" className="text-[10px]">{bErr}</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={draft?.brackets ?? ""}
                        onChange={(e) => updateDraft(config.countrySlug, "brackets", e.target.value)}
                        rows={12}
                        className={`font-mono text-xs border-white/10 bg-white/5 resize-none ${bErr ? "border-negative" : ""}`}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-white/80 flex items-center justify-between">
                        <span>{t("admin.taxSocial")}</span>
                        {sErr && <Badge variant="destructive" className="text-[10px]">{sErr}</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={draft?.social ?? ""}
                        onChange={(e) => updateDraft(config.countrySlug, "social", e.target.value)}
                        rows={8}
                        className={`font-mono text-xs border-white/10 bg-white/5 resize-none ${sErr ? "border-negative" : ""}`}
                      />
                    </CardContent>
                  </Card>

                  <Button
                    onClick={() => save(config)}
                    disabled={saving || !!bErr || !!sErr}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? t("loading") : t("admin.save")}
                  </Button>

                  <p className="text-xs text-white/30 text-center">
                    {t("admin.taxConfigTitle")}: {config.label} — {new Date(config.updatedAt).toLocaleString()}
                  </p>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </main>
    </div>
  );
}
