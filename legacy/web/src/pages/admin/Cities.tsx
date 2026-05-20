import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/api/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Plus, Trash2, ChevronUp, ChevronDown, LogOut } from "lucide-react";

interface CityRow {
  id: string;
  slug: string;
  flag: string;
  isHomeCity: boolean;
  isActive: boolean;
  sortOrder: number;
  translations: Array<{ locale: string; name: string; country: string }>;
  col: { rent: number; food: number; transport: number } | null;
  regimes: Array<{
    id: string;
    slug: string;
    incomeRate: number;
    socialRate: number;
    exemptFrac: number | null;
    isDefault: boolean;
    sortOrder: number;
    translations: Array<{ locale: string; label: string }>;
  }>;
  details: Array<{ id: string; section: string; locale: string; items: string[] }>;
}

const SECTIONS = ["fin", "cost", "sec", "climate", "sport", "social"] as const;

const regimeSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  labelDE: z.string().min(1),
  labelEN: z.string().min(1),
  incomeRate: z.number().min(0).max(100),
  socialRate: z.number().min(0).max(100),
  exemptFrac: z.number().min(0).max(100).optional().nullable(),
  isDefault: z.boolean(),
  sortOrder: z.number(),
});

const cityFormSchema = z.object({
  slug: z.string().min(1),
  flag: z.string().min(1),
  isHomeCity: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  nameDE: z.string().min(1),
  nameEN: z.string().min(1),
  countryDE: z.string().min(1),
  countryEN: z.string().min(1),
  rent: z.number().min(0),
  food: z.number().min(0),
  transport: z.number().min(0),
  regimes: z.array(regimeSchema),
  detailsFinDE: z.string(),
  detailsFinEN: z.string(),
  detailsCostDE: z.string(),
  detailsCostEN: z.string(),
  detailsSecDE: z.string(),
  detailsSecEN: z.string(),
  detailsClimateDE: z.string(),
  detailsClimateEN: z.string(),
  detailsSportDE: z.string(),
  detailsSportEN: z.string(),
  detailsSocialDE: z.string(),
  detailsSocialEN: z.string(),
});

type CityForm = z.infer<typeof cityFormSchema>;

function getDetailsText(city: CityRow, section: string, locale: string): string {
  const d = city.details.find((x) => x.section === section && x.locale === locale);
  return d ? d.items.join("\n") : "";
}

function buildDetails(data: CityForm): Record<string, Record<string, string[]>> {
  const de: Record<string, string[]> = {};
  const en: Record<string, string[]> = {};
  for (const section of SECTIONS) {
    const key = section.charAt(0).toUpperCase() + section.slice(1);
    const deKey = `details${key}DE` as keyof CityForm;
    const enKey = `details${key}EN` as keyof CityForm;
    de[section] = (data[deKey] as string).split("\n").filter(Boolean);
    en[section] = (data[enKey] as string).split("\n").filter(Boolean);
  }
  return { de, en };
}

export default function AdminCities() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cities, setCities] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCity, setEditCity] = useState<CityRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register, handleSubmit, reset, control, watch, setValue,
  } = useForm<CityForm>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      isHomeCity: false, isActive: true, sortOrder: 0,
      rent: 0, food: 0, transport: 0, regimes: [],
      detailsFinDE: "", detailsFinEN: "", detailsCostDE: "", detailsCostEN: "",
      detailsSecDE: "", detailsSecEN: "", detailsClimateDE: "", detailsClimateEN: "",
      detailsSportDE: "", detailsSportEN: "", detailsSocialDE: "", detailsSocialEN: "",
    },
  });

  const { fields: regimeFields, append: appendRegime, remove: removeRegime } = useFieldArray({
    control, name: "regimes",
  });

  const isHomeCity = watch("isHomeCity");

  async function loadCities() {
    try {
      const { data } = await api.get<CityRow[]>("/api/admin/cities");
      setCities(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      toast({ variant: "destructive", title: t("error.apiUnavailable") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCities(); }, []);

  function openNew() {
    setEditCity(null);
    reset({
      slug: "", flag: "", isHomeCity: false, isActive: true, sortOrder: cities.length,
      nameDE: "", nameEN: "", countryDE: "", countryEN: "",
      rent: 0, food: 0, transport: 0, regimes: [],
      detailsFinDE: "", detailsFinEN: "", detailsCostDE: "", detailsCostEN: "",
      detailsSecDE: "", detailsSecEN: "", detailsClimateDE: "", detailsClimateEN: "",
      detailsSportDE: "", detailsSportEN: "", detailsSocialDE: "", detailsSocialEN: "",
    });
    setSheetOpen(true);
  }

  function openEdit(city: CityRow) {
    setEditCity(city);
    const de = city.translations.find((t) => t.locale === "de");
    const en = city.translations.find((t) => t.locale === "en");
    reset({
      slug: city.slug,
      flag: city.flag,
      isHomeCity: city.isHomeCity,
      isActive: city.isActive,
      sortOrder: city.sortOrder,
      nameDE: de?.name ?? "",
      nameEN: en?.name ?? "",
      countryDE: de?.country ?? "",
      countryEN: en?.country ?? "",
      rent: city.col?.rent ?? 0,
      food: city.col?.food ?? 0,
      transport: city.col?.transport ?? 0,
      regimes: city.regimes.map((r) => ({
        id: r.id,
        slug: r.slug,
        labelDE: r.translations.find((t) => t.locale === "de")?.label ?? "",
        labelEN: r.translations.find((t) => t.locale === "en")?.label ?? "",
        incomeRate: r.incomeRate * 100,
        socialRate: r.socialRate * 100,
        exemptFrac: r.exemptFrac != null ? r.exemptFrac * 100 : null,
        isDefault: r.isDefault,
        sortOrder: r.sortOrder,
      })),
      detailsFinDE: getDetailsText(city, "fin", "de"),
      detailsFinEN: getDetailsText(city, "fin", "en"),
      detailsCostDE: getDetailsText(city, "cost", "de"),
      detailsCostEN: getDetailsText(city, "cost", "en"),
      detailsSecDE: getDetailsText(city, "sec", "de"),
      detailsSecEN: getDetailsText(city, "sec", "en"),
      detailsClimateDE: getDetailsText(city, "climate", "de"),
      detailsClimateEN: getDetailsText(city, "climate", "en"),
      detailsSportDE: getDetailsText(city, "sport", "de"),
      detailsSportEN: getDetailsText(city, "sport", "en"),
      detailsSocialDE: getDetailsText(city, "social", "de"),
      detailsSocialEN: getDetailsText(city, "social", "en"),
    });
    setSheetOpen(true);
  }

  async function onSubmit(data: CityForm) {
    setSaving(true);
    try {
      const payload = {
        slug: data.slug,
        flag: data.flag,
        isHomeCity: data.isHomeCity,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        nameDE: data.nameDE,
        nameEN: data.nameEN,
        countryDE: data.countryDE,
        countryEN: data.countryEN,
      };

      let cityId: string;
      if (editCity) {
        await api.patch(`/api/admin/cities/${editCity.id}`, payload);
        cityId = editCity.id;
      } else {
        const { data: created } = await api.post<{ id: string }>("/api/admin/cities", payload);
        cityId = created.id;
      }

      // Save CoL
      await api.put(`/api/admin/cities/${cityId}/col`, {
        rent: data.rent, food: data.food, transport: data.transport,
      });

      // Save details
      const details = buildDetails(data);
      await api.put(`/api/admin/cities/${cityId}/details`, details);

      // Save regimes (only for target cities)
      if (!data.isHomeCity) {
        for (const regime of data.regimes) {
          const regimePayload = {
            slug: regime.slug,
            labelDE: regime.labelDE,
            labelEN: regime.labelEN,
            incomeRate: regime.incomeRate / 100,
            socialRate: regime.socialRate / 100,
            exemptFrac: regime.exemptFrac != null ? regime.exemptFrac / 100 : null,
            isDefault: regime.isDefault,
            sortOrder: regime.sortOrder,
          };
          if (regime.id) {
            await api.patch(`/api/admin/regimes/${regime.id}`, regimePayload);
          } else {
            await api.post(`/api/admin/cities/${cityId}/regimes`, regimePayload);
          }
        }
      }

      setSheetOpen(false);
      toast({ title: t("admin.save") + " ✓" });
      loadCities();
    } catch {
      toast({ variant: "destructive", title: t("error.apiUnavailable") });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(city: CityRow) {
    try {
      await api.patch(`/api/admin/cities/${city.id}`, { isActive: !city.isActive });
      loadCities();
    } catch {
      toast({ variant: "destructive", title: t("error.apiUnavailable") });
    }
  }

  async function moveOrder(city: CityRow, dir: 1 | -1) {
    try {
      await api.patch(`/api/admin/cities/${city.id}/order`, { sortOrder: city.sortOrder + dir });
      loadCities();
    } catch {
      toast({ variant: "destructive", title: t("error.apiUnavailable") });
    }
  }

  async function deleteCity(city: CityRow) {
    if (!confirm(`Delete ${city.slug}?`)) return;
    try {
      await api.delete(`/api/admin/cities/${city.id}`);
      loadCities();
    } catch {
      toast({ variant: "destructive", title: t("error.apiUnavailable") });
    }
  }

  function logout() {
    sessionStorage.removeItem("paymap_token");
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">{t("admin.cities")}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/tax")}
              className="border-white/10 text-white/60 hover:text-white text-xs">
              {t("admin.tax")}
            </Button>
            <Button size="sm" onClick={openNew} className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t("admin.newCity")}
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-white/40 text-xs">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              {t("admin.logout")}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="rounded-lg border border-white/08 overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/40 text-xs w-8"></TableHead>
                  <TableHead className="text-white/40 text-xs">{t("admin.nameDE")}</TableHead>
                  <TableHead className="text-white/40 text-xs">{t("admin.nameEN")}</TableHead>
                  <TableHead className="text-white/40 text-xs">{t("admin.type")}</TableHead>
                  <TableHead className="text-white/40 text-xs">{t("admin.active")}</TableHead>
                  <TableHead className="text-white/40 text-xs">{t("admin.sortOrder")}</TableHead>
                  <TableHead className="text-white/40 text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city) => {
                  const de = city.translations.find((t) => t.locale === "de");
                  const en = city.translations.find((t) => t.locale === "en");
                  return (
                    <TableRow key={city.id} className="border-white/08 hover:bg-white/02" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <TableCell className="text-xl py-2">{city.flag}</TableCell>
                      <TableCell className="text-sm py-2">{de?.name}</TableCell>
                      <TableCell className="text-sm py-2 text-white/50">{en?.name}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-[10px] border-white/20 text-white/50">
                          {city.isHomeCity ? t("admin.home") : t("admin.target")}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Switch
                          checked={city.isActive}
                          onCheckedChange={() => toggleActive(city)}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveOrder(city, -1)}>
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-white/40 w-4 text-center">{city.sortOrder}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveOrder(city, 1)}>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(city)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-negative hover:text-negative" onClick={() => deleteCity(city)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* City drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[540px] overflow-y-auto" style={{ maxWidth: "540px" }}>
          <SheetHeader className="pb-4">
            <SheetTitle className="font-serif text-lg">
              {editCity ? editCity.flag + " " + (editCity.translations.find((t) => t.locale === "de")?.name ?? "") : t("admin.newCity")}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            <Tabs defaultValue="general">
              <TabsList className="w-full justify-start bg-white/05 mb-4">
                <TabsTrigger value="general" className="text-xs">{t("admin.general")}</TabsTrigger>
                {!isHomeCity && (
                  <TabsTrigger value="regimes" className="text-xs">{t("admin.taxRegimes")}</TabsTrigger>
                )}
                <TabsTrigger value="col" className="text-xs">{t("admin.col")}</TabsTrigger>
                <TabsTrigger value="details" className="text-xs">{t("admin.details")}</TabsTrigger>
              </TabsList>

              {/* General tab */}
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("admin.nameDE")} *</Label>
                    <Input {...register("nameDE")} className="border-white/10 bg-white/5 h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("admin.nameEN")} *</Label>
                    <Input {...register("nameEN")} className="border-white/10 bg-white/5 h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("admin.countryDE")} *</Label>
                    <Input {...register("countryDE")} className="border-white/10 bg-white/5 h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("admin.countryEN")} *</Label>
                    <Input {...register("countryEN")} className="border-white/10 bg-white/5 h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("admin.flag")} *</Label>
                    <Input {...register("flag")} className="border-white/10 bg-white/5 h-8 text-sm" placeholder="🇩🇪" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("admin.slug")} *</Label>
                    <Input {...register("slug")} className="border-white/10 bg-white/5 h-8 text-sm font-mono" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-white/60">{t("admin.home")} / {t("admin.target")}</Label>
                    <Switch
                      checked={watch("isHomeCity")}
                      onCheckedChange={(v) => setValue("isHomeCity", v)}
                    />
                    <span className="text-xs text-white/40">
                      {watch("isHomeCity") ? t("admin.home") : t("admin.target")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-white/60">{t("admin.active")}</Label>
                    <Switch
                      checked={watch("isActive")}
                      onCheckedChange={(v) => setValue("isActive", v)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("admin.sortOrder")}</Label>
                  <Input
                    type="number"
                    {...register("sortOrder", { valueAsNumber: true })}
                    className="border-white/10 bg-white/5 h-8 text-sm w-24"
                  />
                </div>
              </TabsContent>

              {/* Regimes tab */}
              {!isHomeCity && (
                <TabsContent value="regimes" className="space-y-4">
                  {regimeFields.map((field, idx) => (
                    <Card key={field.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] border-white/20">
                            {watch(`regimes.${idx}.slug`) || `Regime ${idx + 1}`}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-negative"
                            onClick={() => removeRegime(idx)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px]">{t("admin.labelDE")} *</Label>
                            <Input {...register(`regimes.${idx}.labelDE`)} className="border-white/10 bg-white/5 h-7 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">{t("admin.labelEN")} *</Label>
                            <Input {...register(`regimes.${idx}.labelEN`)} className="border-white/10 bg-white/5 h-7 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">{t("admin.slug")} *</Label>
                            <Input {...register(`regimes.${idx}.slug`)} className="border-white/10 bg-white/5 h-7 text-xs font-mono" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">{t("admin.incomeRate")} *</Label>
                            <Input
                              type="number" step="0.01"
                              {...register(`regimes.${idx}.incomeRate`, { valueAsNumber: true })}
                              className="border-white/10 bg-white/5 h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">{t("admin.socialRate")} *</Label>
                            <Input
                              type="number" step="0.01"
                              {...register(`regimes.${idx}.socialRate`, { valueAsNumber: true })}
                              className="border-white/10 bg-white/5 h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">{t("admin.exemptFrac")}</Label>
                            <Input
                              type="number" step="0.01" placeholder="—"
                              {...register(`regimes.${idx}.exemptFrac`, { valueAsNumber: true })}
                              className="border-white/10 bg-white/5 h-7 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={watch(`regimes.${idx}.isDefault`)}
                            onCheckedChange={(v) => setValue(`regimes.${idx}.isDefault`, v)}
                          />
                          <Label className="text-xs text-white/60">{t("admin.isDefault")}</Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full border border-dashed border-white/15 text-white/50 hover:text-white text-xs"
                    onClick={() =>
                      appendRegime({
                        slug: "", labelDE: "", labelEN: "",
                        incomeRate: 0, socialRate: 0, exemptFrac: null,
                        isDefault: regimeFields.length === 0, sortOrder: regimeFields.length,
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {t("admin.addRegime")}
                  </Button>
                </TabsContent>
              )}

              {/* CoL tab */}
              <TabsContent value="col" className="space-y-4">
                <div className="space-y-3">
                  {(["rent", "food", "transport"] as const).map((field) => (
                    <div key={field} className="space-y-1.5">
                      <Label className="text-xs">{t(`admin.${field}`)} *</Label>
                      <Input
                        type="number"
                        {...register(field, { valueAsNumber: true })}
                        className="border-white/10 bg-white/5 h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Details tab */}
              <TabsContent value="details" className="space-y-0">
                <Tabs defaultValue="de">
                  <TabsList className="bg-white/05 mb-3 w-full justify-start">
                    <TabsTrigger value="de" className="text-xs">DE</TabsTrigger>
                    <TabsTrigger value="en" className="text-xs">EN</TabsTrigger>
                  </TabsList>
                  {(["de", "en"] as const).map((lang) => (
                    <TabsContent key={lang} value={lang} className="space-y-4 mt-0">
                      {SECTIONS.map((section) => {
                        const key = `details${section.charAt(0).toUpperCase() + section.slice(1)}${lang.toUpperCase()}` as keyof CityForm;
                        return (
                          <div key={section} className="space-y-1.5">
                            <Label className="text-xs text-white/60">
                              {t(`details.section.${section}`)}
                            </Label>
                            <Textarea
                              {...register(key as any)}
                              rows={3}
                              placeholder="Ein Item pro Zeile / One item per line"
                              className="border-white/10 bg-white/5 text-xs resize-none"
                            />
                          </div>
                        );
                      })}
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
            </Tabs>

            <SheetFooter className="pt-6 flex gap-2 border-t border-white/08 mt-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-white/60"
                onClick={() => setSheetOpen(false)}
              >
                {t("admin.cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t("loading") : t("admin.save")}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
