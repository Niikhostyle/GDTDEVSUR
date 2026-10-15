import { memo, useCallback, useRef } from "react";
import { enrichStackItem, techIconUrl, lookupTechSlug } from "../../lib/techIcons";
import type { CollectionSchema, FieldDef } from "./schemas";

type Props = {
  schema: CollectionSchema;
  data: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

type Item = Record<string, unknown>;
type ListDef = NonNullable<CollectionSchema["lists"]>[number];
type ObjectDef = NonNullable<CollectionSchema["objects"]>[number];

const FieldInput = memo(function FieldInput({
  field,
  value,
  onEdit,
}: {
  field: FieldDef;
  value: unknown;
  onEdit: (key: string, v: unknown) => void;
}) {
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-3 text-sm text-[var(--admin-ink)]">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onEdit(field.key, e.target.checked)}
          className="h-4 w-4 accent-[var(--admin-accent)]"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block text-[11px] font-600 tracking-[0.16em] text-[var(--admin-muted)] uppercase">
        {field.label}
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onEdit(field.key, e.target.value)}
          rows={4}
          placeholder={field.placeholder}
          className="admin-input min-h-[108px] resize-y"
        />
      </label>
    );
  }

  return (
    <label className="block text-[11px] font-600 tracking-[0.16em] text-[var(--admin-muted)] uppercase">
      {field.label}
      <input
        type={field.type === "number" ? "number" : "text"}
        value={String(value ?? "")}
        onChange={(e) =>
          onEdit(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)
        }
        placeholder={field.placeholder}
        className="admin-input"
      />
    </label>
  );
});

function FieldGrid({
  fields,
  values,
  onEdit,
  className = "grid gap-4 md:grid-cols-2",
}: {
  fields: FieldDef[];
  values: Item | undefined;
  onEdit: (key: string, v: unknown) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {fields.map((field) => (
        <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
          <FieldInput field={field} value={values?.[field.key]} onEdit={onEdit} />
        </div>
      ))}
    </div>
  );
}

const ObjectSection = memo(function ObjectSection({
  obj,
  value,
  setObject,
}: {
  obj: ObjectDef;
  value: Item | undefined;
  setObject: (objKey: string, fieldKey: string, v: unknown) => void;
}) {
  const onEdit = useCallback((k: string, v: unknown) => setObject(obj.key, k, v), [obj.key, setObject]);
  return (
    <section className="admin-panel space-y-4 rounded-2xl p-5 md:p-6">
      <h3 className="text-[11px] font-700 tracking-[0.2em] text-[var(--admin-accent)] uppercase">
        {obj.label}
      </h3>
      <FieldGrid fields={obj.fields} values={value} onEdit={onEdit} />
    </section>
  );
});

type ListActions = {
  setItem: (listKey: string, index: number, fieldKey: string, v: unknown) => void;
  move: (listKey: string, index: number, dir: -1 | 1) => void;
  remove: (listKey: string, index: number) => void;
};

const ListItemCard = memo(function ListItemCard({
  list,
  item,
  index,
  actions,
}: {
  list: ListDef;
  item: Item;
  index: number;
  actions: ListActions;
}) {
  const onEdit = useCallback(
    (k: string, v: unknown) => actions.setItem(list.key, index, k, v),
    [actions, list.key, index],
  );
  return (
    <article className="admin-cv rounded-xl border border-white/8 bg-[#0a0d14] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {list.key === "stack" && typeof item.logo === "string" && item.logo && (
            <img
              src={String(item.logo)}
              alt=""
              width={28}
              height={28}
              loading="lazy"
              decoding="async"
              className="h-7 w-7 rounded-md bg-white/90 object-contain p-1"
            />
          )}
          <p className="admin-display text-sm font-600 text-[var(--admin-ink)]">
            {list.itemLabel} {index + 1}
            {list.key === "stack" && item.name ? ` · ${String(item.name)}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => actions.move(list.key, index, -1)}
            className="admin-btn rounded-full border border-white/12 px-2.5 py-1 text-xs text-[var(--admin-muted)] hover:border-white/30 hover:text-white"
            title="Subir"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => actions.move(list.key, index, 1)}
            className="admin-btn rounded-full border border-white/12 px-2.5 py-1 text-xs text-[var(--admin-muted)] hover:border-white/30 hover:text-white"
            title="Bajar"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => actions.remove(list.key, index)}
            className="admin-btn rounded-full border border-red-400/25 px-2.5 py-1 text-xs text-red-300/90 hover:border-red-300/50"
          >
            Eliminar
          </button>
        </div>
      </div>
      <FieldGrid fields={list.fields} values={item} onEdit={onEdit} className="grid gap-3 md:grid-cols-2" />
    </article>
  );
});

export default function CollectionEditor({ schema, data, onChange }: Props) {
  const dataRef = useRef(data);
  dataRef.current = data;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const update = useCallback((patch: (d: Item) => Item) => {
    const next = patch(dataRef.current);
    dataRef.current = next;
    onChangeRef.current(next);
  }, []);

  const setRoot = useCallback(
    (key: string, value: unknown) => update((d) => ({ ...d, [key]: value })),
    [update],
  );

  const setObject = useCallback(
    (objKey: string, fieldKey: string, value: unknown) =>
      update((d) => ({ ...d, [objKey]: { ...((d[objKey] as Item) || {}), [fieldKey]: value } })),
    [update],
  );

  const actionsRef = useRef<ListActions | null>(null);
  if (!actionsRef.current) {
    actionsRef.current = {
      setItem(listKey, index, fieldKey, value) {
        update((d) => {
          const list = [...((d[listKey] as Item[]) || [])];
          let next: Item = { ...list[index], [fieldKey]: value };

          // Stack tech: al escribir el nombre, autoasignar icon + logo
          if (listKey === "stack" && fieldKey === "name") {
            const slug = lookupTechSlug(String(value ?? "").trim());
            if (slug) next = { ...next, icon: slug, logo: techIconUrl(slug) };
            next = enrichStackItem(next);
          }

          list[index] = next;
          return { ...d, [listKey]: list };
        });
      },
      move(listKey, index, dir) {
        update((d) => {
          const list = [...((d[listKey] as Item[]) || [])];
          const target = index + dir;
          if (target < 0 || target >= list.length) return d;
          [list[index], list[target]] = [list[target], list[index]];
          return { ...d, [listKey]: list };
        });
      },
      remove(listKey, index) {
        update((d) => {
          const list = [...((d[listKey] as Item[]) || [])];
          list.splice(index, 1);
          return { ...d, [listKey]: list };
        });
      },
    };
  }
  const actions = actionsRef.current;

  return (
    <div className="space-y-6">
      {schema.hasEnabled !== false && "enabled" in data && (
        <div className="admin-panel flex items-center justify-between rounded-2xl px-5 py-4">
          <div>
            <p className="admin-display font-600 text-[var(--admin-ink)]">Módulo activo</p>
            <p className="mt-1 text-xs text-[var(--admin-muted)]">
              Si lo desactivas, esta sección no se muestra en la web.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRoot("enabled", !data.enabled)}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              data.enabled ? "bg-[var(--admin-accent)]" : "bg-white/15"
            }`}
            aria-pressed={Boolean(data.enabled)}
          >
            <span
              className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                data.enabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      )}

      <section className="admin-panel space-y-4 rounded-2xl p-5 md:p-6">
        <h3 className="text-[11px] font-700 tracking-[0.2em] text-[var(--admin-accent)] uppercase">
          Contenido
        </h3>
        <FieldGrid fields={schema.fields} values={data} onEdit={setRoot} />
      </section>

      {schema.objects?.map((obj) => (
        <ObjectSection
          key={obj.key}
          obj={obj}
          value={data[obj.key] as Item | undefined}
          setObject={setObject}
        />
      ))}

      {schema.lists?.map((list) => {
        const items = (data[list.key] as Item[]) || [];
        return (
          <section key={list.key} className="admin-panel space-y-4 rounded-2xl p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[11px] font-700 tracking-[0.2em] text-[var(--admin-accent)] uppercase">
                {list.label} · {items.length}
              </h3>
              <button
                type="button"
                onClick={() => update((d) => ({ ...d, [list.key]: [...((d[list.key] as Item[]) || []), list.create()] }))}
                className="admin-btn rounded-full bg-[var(--admin-accent)] px-4 py-2 text-sm font-600 text-black"
              >
                + Añadir {list.itemLabel.toLowerCase()}
              </button>
            </div>

            {items.length === 0 && (
              <p className="text-sm text-[var(--admin-muted)]">
                Todavía no hay ítems. Añade el primero.
              </p>
            )}

            <div className="space-y-4">
              {items.map((item, index) => (
                <ListItemCard
                  key={String(item.id ?? index)}
                  list={list}
                  item={item}
                  index={index}
                  actions={actions}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
