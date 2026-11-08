"use client";

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Form from "@/components/form/Form";
import {ChevronDownIcon} from "@/icons";
import {useError} from "@/context/ErrorContext";
import {createYoutubeSource, updateYoutubeSource} from "@/server/api/youtubeSources";
import {fetchUsers} from "@/server/api/users";
import {getDataUserAuth, getIsOwner} from "@/server/api/auth";
import {parseYoutubeUrl, youtubeEmbedUrl} from "@/utils/youtube";
import {useT} from "@/i18n/I18nProvider";
import config from "@/config/globalConfig";

interface YoutubeSourceFormProps {
  source?: any;
}

const YoutubeSourceForm: React.FC<YoutubeSourceFormProps> = ({source}) => {
  const t = useT("forms.youtubeSources");
  const tCommon = useT("common.buttons");
  const isOwner = getIsOwner();
  const user = getDataUserAuth();
  const router = useRouter();
  const setError = useError().setError;
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: source?.name || "",
    url: source?.url || "",
    owner_id: source?.owner_id || (isOwner ? user?.id || "" : ""),
    youtube_mode: source?.youtube_mode || "overlay",
    youtube_size: source?.youtube_size || "medium",
    youtube_position: source?.youtube_position || "tr",
    youtube_loop: source?.youtube_loop ?? true,
    youtube_audio: source?.youtube_audio ?? false,
    youtube_captions: source?.youtube_captions ?? false,
  });

  useEffect(() => {
    if (isOwner) return;
    fetchUsers()
      .then((items) => setOwners(items.filter((item: any) => item.role !== "admin" && item.enabled)))
      .catch((err: any) => setError(err.data?.message || err.message || t("errors.loadOwners")));
  }, [isOwner, setError]);

  const parsed = parseYoutubeUrl(form.url);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsed) {
      setError(t("errors.invalidUrl"));
      return;
    }
    if (!form.name.trim()) {
      setError(t("errors.nameRequired"));
      return;
    }
    if (!form.owner_id) {
      setError(t("errors.ownerRequired"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        url: form.url.trim(),
        owner_id: form.owner_id,
        youtube_mode: form.youtube_mode,
        youtube_size: form.youtube_size,
        youtube_position: form.youtube_position,
        youtube_loop: form.youtube_loop,
        youtube_audio: form.youtube_audio,
        youtube_captions: form.youtube_captions,
      };
      if (source?.id) {
        await updateYoutubeSource(source.id, payload);
      } else {
        await createYoutubeSource(payload);
      }
      router.push("/youtube");
    } catch (err: any) {
      setError(err.data?.message || err.data?.errors?.join?.(" · ") || err.message || t("errors.saveItem"));
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = parsed
    ? youtubeEmbedUrl(parsed, {
        loop: form.youtube_loop,
        audio: form.youtube_audio,
        captions: form.youtube_captions,
      })
    : "";

  const requestPreviewAudio = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    if (!form.youtube_audio || !event.currentTarget.contentWindow) return;

    const iframe = event.currentTarget;
    const send = (func: string, args: unknown[] = []) => {
      iframe.contentWindow?.postMessage(JSON.stringify({event: "command", func, args}), "https://www.youtube.com");
    };

    send("unMute");
    send("setVolume", [100]);
    send("playVideo");
  };

  return (
    <Form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-6 shadow-theme-xs">
      <div className="mb-5">
        <Label>{t("labels.name")}</Label>
        <Input name="name" value={form.name} onChange={(event) => setForm({...form, name: event.target.value})} placeholder={t("placeholders.name")} />
      </div>
      <div className="mb-5">
        <Label>{t("labels.url")}</Label>
        <Input
          name="url"
          type="url"
          value={form.url}
          onChange={(event) => setForm({...form, url: event.target.value})}
          placeholder={t("placeholders.url")}
          error={form.url.trim() !== "" && !parsed}
          hint={form.url.trim() !== "" && !parsed ? t("errors.invalidUrl") : t("hints.url")}
        />
      </div>
      {!isOwner && (
        <div className="mb-5">
          <Label>{t("labels.owner")}</Label>
          <div className="relative">
            <Select
              defaultValue={String(form.owner_id || "")}
              onChange={(value) => setForm({...form, owner_id: value})}
              options={owners.map((owner) => ({value: String(owner.id), label: owner.name}))}
              placeholder={t("placeholders.owner")}
              className="w-full"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"><ChevronDownIcon /></span>
          </div>
        </div>
      )}
      {parsed && (
        <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="aspect-video overflow-hidden rounded-lg bg-black">
            <iframe
              title={t("labels.preview")}
              src={previewUrl}
              onLoad={requestPreviewAudio}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="rounded-lg border border-line bg-surface-sunken p-4 text-sm text-content-secondary">
            <div className="font-medium text-content-primary">{t("labels.type")}</div>
            <div className="mt-1">{parsed.sourceType === "playlist" ? t("types.playlist") : t("types.video")}</div>
            <div className="mt-4 font-medium text-content-primary">{t("labels.youtubeId")}</div>
            <div className="mt-1 break-all">{parsed.youtubeId}</div>
          </div>
        </div>
      )}
      <div className="mb-6 rounded-lg border border-line bg-surface-sunken p-4">
        <h2 className="mb-4 text-sm font-semibold text-content-primary">{t("labels.playbackSettings")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("labels.mode")}</Label>
            <div className="relative">
              <Select
                defaultValue={form.youtube_mode}
                onChange={(value) => setForm({...form, youtube_mode: value})}
                options={[
                  {value: "overlay", label: t("options.mode.overlay")},
                  {value: "fullscreen", label: t("options.mode.fullscreen")},
                ]}
                className="w-full"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"><ChevronDownIcon /></span>
            </div>
          </div>
          <div>
            <Label>{t("labels.size")}</Label>
            <div className="relative">
              <Select
                defaultValue={form.youtube_size}
                onChange={(value) => setForm({...form, youtube_size: value})}
                options={[
                  {value: "small", label: t("options.size.small")},
                  {value: "medium", label: t("options.size.medium")},
                  {value: "large", label: t("options.size.large")},
                ]}
                className="w-full"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"><ChevronDownIcon /></span>
            </div>
          </div>
          <div>
            <Label>{t("labels.position")}</Label>
            <div className="relative">
              <Select
                defaultValue={form.youtube_position}
                onChange={(value) => setForm({...form, youtube_position: value})}
                options={config.positions.map((position) => ({value: position.value, label: position.label}))}
                className="w-full"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"><ChevronDownIcon /></span>
            </div>
          </div>
          <div className="flex items-end pb-2">
            <Checkbox
              checked={form.youtube_loop}
              onChange={(checked) => setForm({...form, youtube_loop: checked})}
              label={t("labels.loop")}
            />
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Checkbox
            checked={form.youtube_audio}
            onChange={(checked) => setForm({...form, youtube_audio: checked})}
            label={t("labels.audio")}
          />
          <Checkbox
            checked={form.youtube_captions}
            onChange={(checked) => setForm({...form, youtube_captions: checked})}
            label={t("labels.captions")}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/youtube")}>{tCommon("cancel")}</Button>
        <Button type="submit" variant="primary" loading={loading}>{source ? tCommon("saveChanges") : tCommon("add")}</Button>
      </div>
    </Form>
  );
};

export default YoutubeSourceForm;
