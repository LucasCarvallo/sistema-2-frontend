<template>
    <div class="container py-3 py-md-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
                <h4 class="mb-1 d-flex align-items-center gap-2">
                    <i class="bi bi-diagram-3 text-primary"></i>
                    Relacion producto-atributo
                </h4>
                <p class="text-muted mb-0 small">
                    Vista de prueba sobre el archivo JSON local sin modificar su estructura.
                </p>
            </div>
            <span class="badge rounded-pill text-bg-primary-subtle text-primary-emphasis">
                {{ groupedProducts.length }} producto(s)
            </span>
        </div>

        <div class="row g-2 g-md-3 mb-3">
            <div class="col-6 col-lg-2" v-for="item in counters" :key="item.label">
                <div class="card border-0 shadow-sm h-100 counter-card">
                    <div class="card-body py-2 px-3">
                        <div class="text-muted text-uppercase counter-label">{{ item.label }}</div>
                        <div class="fw-semibold fs-5">{{ item.value }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
                <div class="row g-2">
                    <div class="col-12 col-lg-5">
                        <label class="form-label small text-muted mb-1">Buscar</label>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input
                                v-model.trim="search"
                                type="text"
                                class="form-control"
                                placeholder="Producto, atributo, valor o descripcion"
                            />
                        </div>
                    </div>
                    <div class="col-6 col-lg-3">
                        <label class="form-label small text-muted mb-1">Producto</label>
                        <select v-model.number="selectedProducto" class="form-select form-select-sm">
                            <option :value="0">Todos</option>
                            <option v-for="p in source.producto" :key="p.id" :value="p.id">
                                {{ p.nombre }}
                            </option>
                        </select>
                    </div>
                    <div class="col-6 col-lg-3">
                        <label class="form-label small text-muted mb-1">Atributo</label>
                        <select v-model.number="selectedAtributo" class="form-select form-select-sm">
                            <option :value="0">Todos</option>
                            <option v-for="a in source.atributos" :key="a.id" :value="a.id">
                                {{ a.nombre }}
                            </option>
                        </select>
                    </div>
                    <div class="col-12 col-lg-1 d-grid align-self-end">
                        <button class="btn btn-sm btn-outline-secondary" type="button" @click="clearFilters">
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <div v-if="groupedProducts.length === 0" class="card border-0 shadow-sm">
                <div class="card-body text-center text-muted py-4 d-flex flex-column align-items-center gap-2">
                    <NoImage :width="140" :height="88" />
                    No hay productos para los filtros seleccionados.
                </div>
            </div>

            <div v-else class="row g-3">
                <div class="col-12 col-xl-6" v-for="product in groupedProducts" :key="product.producto_id">
                    <div class="card border-0 shadow-sm h-100 grouped-card">
                        <div class="card-body">
                            <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
                                <div class="d-flex align-items-start gap-2">
                                    <img
                                        v-if="shouldShowImage(product.producto_id, product.images[0])"
                                        :src="product.images[0]"
                                        :alt="`Imagen de ${product.producto}`"
                                        class="product-thumb"
                                        loading="lazy"
                                        @error="markImageError(product.producto_id, product.images[0])"
                                    />
                                    <NoImage v-else :width="52" :height="40" />
                                    <div>
                                        <h6 class="mb-1 fw-semibold">{{ product.producto }}</h6>
                                        <p v-if="product.descripcion" class="small text-muted mb-0">
                                            {{ product.descripcion }}
                                        </p>
                                        <p v-if="product.images.length > 1" class="small text-muted mb-0">
                                            {{ product.images.length }} imagenes registradas
                                        </p>
                                    </div>
                                </div>
                                <div class="d-flex flex-column align-items-end gap-1">
                                    <!-- <span class="badge rounded-pill text-bg-success-subtle text-success-emphasis">
                                        {{ product.totalValores }} valor(es)
                                    </span> -->
                                    <span
                                        v-if="product.precios.length === 1"
                                        class="badge rounded-pill text-bg-warning-subtle text-warning-emphasis"
                                    >
                                        {{ formatPrice(product.precios[0]) }}
                                    </span>
                                    <span
                                        v-else-if="product.precios.length > 1"
                                        class="badge rounded-pill text-bg-warning-subtle text-warning-emphasis"
                                    >
                                        {{ formatPrice(product.precios[0]) }} -
                                        {{ formatPrice(product.precios[product.precios.length - 1]) }}
                                    </span>
                                </div>
                            </div>

                            <div class="d-flex flex-column gap-2 mt-3">
                                <div
                                    class="attribute-line"
                                    v-for="attribute in product.atributos"
                                    :key="`${product.producto_id}-${attribute.atributo_id}`"
                                >
                                    <div class="small text-muted fw-semibold mb-1">{{ attribute.atributo }}</div>
                                    <div class="d-flex flex-wrap gap-1">
                                        <span
                                            class="badge text-bg-primary-subtle text-primary-emphasis"
                                            v-for="value in attribute.valores"
                                            :key="`${product.producto_id}-${attribute.atributo_id}-${value}`"
                                        >
                                            {{ value }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import NoImage from '@/components/ui/NoImage.vue';
import source from '../../../json/ejemplo relacion atributo-producto.json';

const search = ref('');
const selectedProducto = ref(0);
const selectedAtributo = ref(0);
const brokenImages = ref(new Set());

const productsById = new Map(source.producto.map((item) => [item.id, item]));
const attributesById = new Map(source.atributos.map((item) => [item.id, item]));
const valuesById = new Map(source.valores_atributos.map((item) => [item.id, item]));

const baseRows = computed(() => {
    return source.producto_atributo.flatMap((relacion) => {
        const product = productsById.get(relacion.id_producto);
        const variantes = Array.isArray(relacion.atributos) ? relacion.atributos : [];
        const relationPrice = Number(relacion.precio);

        return variantes.flatMap((variante, varianteIndex) => {
            const ids = Array.isArray(variante?.id_valor_atributos) ? variante.id_valor_atributos : [];
            const image = typeof variante?.img === 'string' ? variante.img.trim() : '';
            const variantPrice = Number(variante?.precio);
            const precio = Number.isFinite(variantPrice)
                ? variantPrice
                : Number.isFinite(relationPrice)
                  ? relationPrice
                  : null;

            return ids.map((valorId) => {
                const valorItem = valuesById.get(valorId);
                const atributo = attributesById.get(valorItem?.id_atributo);

                return {
                    uid: `${relacion.id}-${varianteIndex}-${valorId}`,
                    variante_id: `${relacion.id}-${varianteIndex}`,
                    relacion_id: relacion.id,
                    producto_id: product?.id ?? relacion.id_producto,
                    producto: product?.nombre ?? `Producto ${relacion.id_producto}`,
                    descripcion: product?.descripcion ?? '',
                    atributo_id: atributo?.id ?? valorItem?.id_atributo ?? 0,
                    atributo: atributo?.nombre ?? 'Sin atributo',
                    valor: valorItem?.valor ?? `Valor ${valorId}`,
                    precio,
                    img: image,
                };
            });
        });
    });
});

const filteredRows = computed(() => {
    const query = search.value.toLowerCase();

    return baseRows.value.filter((row) => {
        const matchesProduct = !selectedProducto.value || row.producto_id === selectedProducto.value;
        const matchesAttribute = !selectedAtributo.value || row.atributo_id === selectedAtributo.value;
        const matchesSearch =
            !query ||
            [row.producto, row.atributo, row.valor, row.descripcion, row.precio ?? '']
                .join(' ')
                .toLowerCase()
                .includes(query);

        return matchesProduct && matchesAttribute && matchesSearch;
    });
});

const groupedProducts = computed(() => {
    const groupedMap = new Map();

    for (const row of filteredRows.value) {
        if (!groupedMap.has(row.producto_id)) {
            groupedMap.set(row.producto_id, {
                producto_id: row.producto_id,
                producto: row.producto,
                descripcion: row.descripcion,
                // totalValores: 0,
                variantesSet: new Set(),
                preciosSet: new Set(),
                imagesSet: new Set(),
                atributosMap: new Map(),
            });
        }

        const product = groupedMap.get(row.producto_id);
        // product.totalValores += 1;
        product.variantesSet.add(row.variante_id);
        if (typeof row.precio === 'number') product.preciosSet.add(row.precio);
        if (row.img) product.imagesSet.add(row.img);

        if (!product.atributosMap.has(row.atributo_id)) {
            product.atributosMap.set(row.atributo_id, {
                atributo_id: row.atributo_id,
                atributo: row.atributo,
                valoresSet: new Set(),
            });
        }

        product.atributosMap.get(row.atributo_id).valoresSet.add(row.valor);
    }

    return Array.from(groupedMap.values())
        .map((product) => ({
            producto_id: product.producto_id,
            producto: product.producto,
            descripcion: product.descripcion,
            // totalValores: product.totalValores,
            totalVariantes: product.variantesSet.size,
            precios: Array.from(product.preciosSet).sort((a, b) => a - b),
            images: Array.from(product.imagesSet),
            atributos: Array.from(product.atributosMap.values())
                .map((attribute) => ({
                    atributo_id: attribute.atributo_id,
                    atributo: attribute.atributo,
                    valores: Array.from(attribute.valoresSet).sort((a, b) =>
                        String(a).localeCompare(String(b), 'es', { sensitivity: 'base' }),
                    ),
                }))
                .sort((a, b) => a.atributo.localeCompare(b.atributo, 'es', { sensitivity: 'base' })),
        }))
        .sort((a, b) => a.producto.localeCompare(b.producto, 'es', { sensitivity: 'base' }));
});

const counters = computed(() => [
    { label: 'Productos', value: source.producto.length },
    { label: 'Atributos', value: source.atributos.length },
    { label: 'Valores', value: source.valores_atributos.length },
    { label: 'Relaciones', value: source.producto_atributo.length },
    {
        label: 'Variantes',
        value: source.producto_atributo.reduce(
            (acc, relation) => acc + (Array.isArray(relation.atributos) ? relation.atributos.length : 0),
            0,
        ),
    },
    { label: 'Combinaciones', value: baseRows.value.length },
]);

function clearFilters() {
    search.value = '';
    selectedProducto.value = 0;
    selectedAtributo.value = 0;
}

function markImageError(productId, imageUrl) {
    if (!imageUrl) return;
    const next = new Set(brokenImages.value);
    next.add(`${productId}|${imageUrl}`);
    brokenImages.value = next;
}

function shouldShowImage(productId, imageUrl) {
    if (!imageUrl) return false;
    return !brokenImages.value.has(`${productId}|${imageUrl}`);
}

function formatPrice(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return 'Sin precio';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
}
</script>

<style scoped>
.counter-card {
    background: linear-gradient(130deg, rgba(13, 110, 253, 0.06), rgba(25, 135, 84, 0.06));
    border: 1px solid rgba(13, 110, 253, 0.1);
}

.counter-label {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
}

.grouped-card {
    border: 1px solid rgba(13, 110, 253, 0.08);
}

.product-thumb {
    width: 52px;
    height: 40px;
    object-fit: cover;
    border-radius: 0.5rem;
    border: 1px solid rgba(13, 110, 253, 0.16);
    flex: 0 0 auto;
}

.attribute-line {
    padding-top: 0.4rem;
    border-top: 1px dashed rgba(108, 117, 125, 0.25);
}

.attribute-line:first-child {
    border-top: 0;
    padding-top: 0;
}
</style>
