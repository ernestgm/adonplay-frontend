"use client";

import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {MdDelete, MdEdit, MdPlayArrow} from "react-icons/md";
import {useError} from "@/context/ErrorContext";
import {useMessage} from "@/context/MessageContext";
import {deleteYoutubeSources, fetchYoutubeSources} from "@/server/api/youtubeSources";
import {fetchDevices} from "@/server/api/devices";
import {parseYoutubeUrl} from "@/utils/youtube";
import {useT} from "@/i18n/I18nProvider";
import useDebounce from "@/hooks/useDebounce";
import filterItems from "@/utils/filterItems";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import Pagination from "@/components/tables/Pagination";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import ActionModal from "@/components/ui/modal/ActionModal";

const YoutubeSourcesTable = () => {
  const t = useT("pages.youtubeSources");
  const tCommon = useT("common.buttons");
  const tTable = useT("common.table");
  const tHeaders = useT("common.table.headers");
  const tActions = useT("common.table.actions");
  const tFilters = useT("common.table.filters");
  const router = useRouter();
  const setError = useError().setError;
  const setMessage = useMessage().setMessage;
  const [sources, setSources] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchYoutubeSources(), fetchDevices()])
      .then(([sourceData, deviceData]) => {
        setSources(Array.isArray(sourceData) ? sourceData : []);
        setDevices(Array.isArray(deviceData) ? deviceData : []);
      })
      .catch((err: any) => setError(err.data?.message || err.message || t("errors.load")))
      .finally(() => setLoading(false));
  }, [setError]);

  const debouncedSearch = useDebounce(search, 250);
  const filtered = filterItems(sources, debouncedSearch);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const counts = useMemo(() => devices.reduce((result: Record<number, number>, device: any) => {
    if (device.youtube_source_id) result[device.youtube_source_id] = (result[device.youtube_source_id] || 0) + 1;
    return result;
  }, {}), [devices]);

  const confirmDelete = async () => {
    try {
      await deleteYoutubeSources(selected);
      setSources((items) => items.filter((item) => !selected.includes(item.id)));
      setSelected([]);
      setMessage(t("messages.deleted"));
    } catch (err: any) {
      setError(err.data?.message || err.message || t("errors.delete"));
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <ActionModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={tTable("modals.delete.title")}
        message={tTable("modals.delete.message")}
        actions={[{label: tCommon("cancel"), onClick: () => setConfirmOpen(false)}, {label: tCommon("delete"), onClick: confirmDelete, variant: "primary"}]}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {selected.length > 0 ? (
          <Tooltip content={tActions("delete")}>
            <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}><MdDelete size={20} /></Button>
          </Tooltip>
        ) : (
          <Button size="sm" variant="primary" onClick={() => router.push("/youtube/create")}>{tCommon("add")}</Button>
        )}
        <SearchInput value={search} onChange={(value) => {setSearch(value); setPage(1);}} placeholder={tFilters("searchPlaceholder")} />
      </div>
      {loading ? <TableSkeleton columns={5} /> : paginated.length === 0 ? <EmptyState /> : (
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader><TableRow>
              <TableCell isHeader><Checkbox checked={selected.length === sources.length && sources.length > 0} onChange={(checked) => setSelected(checked ? sources.map((item) => item.id) : [])} /></TableCell>
              <TableCell isHeader>{tHeaders("name")}</TableCell>
              <TableCell isHeader>{t("headers.type")}</TableCell>
              <TableCell isHeader>{tHeaders("info")}</TableCell>
              <TableCell isHeader>{t("headers.devices")}</TableCell>
              <TableCell isHeader className="text-right">{tHeaders("actions")}</TableCell>
            </TableRow></TableHeader>
            <TableBody>{paginated.map((source: any) => {
              const parsed = parseYoutubeUrl(source.url);
              return <TableRow key={source.id}>
                <TableCell><Checkbox checked={selected.includes(source.id)} onChange={() => setSelected((items) => items.includes(source.id) ? items.filter((id) => id !== source.id) : [...items, source.id])} /></TableCell>
                <TableCell className="font-medium">{source.name}{counts[source.id] ? <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-success-500/15 px-2 py-0.5 text-xs text-success-600"><MdPlayArrow size={13} />{counts[source.id]}</span> : null}</TableCell>
                <TableCell>{parsed?.sourceType === "playlist" ? t("types.playlist") : t("types.video")}</TableCell>
                <TableCell className="max-w-sm truncate">{source.url}</TableCell>
                <TableCell>{counts[source.id] || 0}</TableCell>
                <TableCell><div className="flex justify-end gap-2"><Tooltip content={tActions("edit")}><Button size="sm" variant="outline" onClick={() => router.push(`/youtube/edit/${source.id}`)}><MdEdit size={18} /></Button></Tooltip><Tooltip content={tActions("delete")}><Button size="sm" variant="danger" onClick={() => {setSelected([source.id]); setConfirmOpen(true);}}><MdDelete size={18} /></Button></Tooltip></div></TableCell>
              </TableRow>;
            })}</TableBody>
          </Table>
        </div>
      )}
      <div className="mt-4 flex justify-end"><Pagination currentPage={page} totalPages={Math.ceil(filtered.length / itemsPerPage)} onPageChange={setPage} /></div>
    </>
  );
};

export default YoutubeSourcesTable;
